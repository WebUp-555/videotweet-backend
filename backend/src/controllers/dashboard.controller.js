import mongoose from "mongoose"
import {User} from "../models/user.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {normalizeVideoMedia} from "../utils/mediaNormalizer.js"

const getChannelStats = asyncHandler(async (req, res) => {
    //: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // Verify authenticated user exists
    const currentUser = await User.findById(req.user?._id)
    if (!currentUser) {
        throw new ApiError(404, "User not found")
    }
    
    const channelId = req.user?._id
    
    // Aggregation pipeline to get comprehensive channel statistics
    const channelStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } },
                totalSubscribers: { $first: { $size: "$subscribers" } }
            }
        },
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1,
                totalSubscribers: 1
            }
        }
    ])
    
    // If no videos exist, get subscriber count separately
    let stats = channelStats[0]
    if (!stats) {
        const subscriberCount = await Subscription.countDocuments({
            channel: channelId
        })
        
        stats = {
            totalVideos: 0,
            totalViews: 0,
            totalLikes: 0,
            totalSubscribers: subscriberCount
        }
    }
    
    // Get additional analytics
    const additionalStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                averageViews: { $avg: "$views" },
                mostViewedVideo: { $max: "$views" },
                totalDuration: { $sum: "$duration" }
            }
        }
    ])
    
    const additional = additionalStats[0] || {
        averageViews: 0,
        mostViewedVideo: 0,
        totalDuration: 0
    }
    
    const finalStats = {
        ...stats,
        averageViews: Math.round(additional.averageViews || 0),
        mostViewedVideo: additional.mostViewedVideo || 0,
        totalDuration: additional.totalDuration || 0,
        channel: {
            _id: currentUser._id,
            username: currentUser.username,
            fullName: currentUser.fullName,
            avatar: currentUser.avatar
        }
    }
    
    return res.status(200).json(
        new ApiResponse(200, finalStats, "Channel stats retrieved successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    //: Get all the videos uploaded by the channel
    // Verify authenticated user exists
    const currentUser = await User.findById(req.user?._id)
    if (!currentUser) {
        throw new ApiError(404, "User not found")
    }
    
    const channelId = req.user?._id
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const sortBy = req.query.sortBy || "createdAt"
    const sortType = req.query.sortType === "asc" ? 1 : -1
    const skip = (page - 1) * limit
    
    // Aggregation pipeline to get channel videos with stats
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" }
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                videoFile: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
                likesCount: 1,
                commentsCount: 1
            }
        },
        {
            $sort: { [sortBy]: sortType }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        }
    ])

    const normalizedVideos = videos.map(normalizeVideoMedia)
    
    // Get total count for pagination
    const totalVideos = await Video.countDocuments({
        owner: channelId
    })
    
    return res.status(200).json(
        new ApiResponse(200, {
            videos: normalizedVideos,
            channel: {
                _id: currentUser._id,
                username: currentUser.username,
                fullName: currentUser.fullName,
                avatar: currentUser.avatar
            },
            pagination: {
                page,
                limit,
                total: totalVideos,
                pages: Math.ceil(totalVideos / limit),
                hasNextPage: page < Math.ceil(totalVideos / limit),
                hasPrevPage: page > 1
            }
        }, "Channel videos retrieved successfully")
    )
})

const getChannelComments = asyncHandler(async (req, res) => {
    //: Get all comments on channel videos
    const { page = 1, limit = 10 } = req.query
    
    // Verify authenticated user exists
    const currentUser = await User.findById(req.user?._id)
    if (!currentUser) {
        throw new ApiError(404, "User not found")
    }
    
    const channelId = req.user?._id
    const skip = (page - 1) * limit
    
    // Get all videos owned by the channel
    const videos = await Video.find({ owner: channelId }).select('_id')
    const videoIds = videos.map(v => v._id)
    
    // Get comments on those videos with pagination
    const comments = await Comment.aggregate([
        {
            $match: { 
                video: { $in: videoIds }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                video: { $first: "$video" }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: skip
        },
        {
            $limit: parseInt(limit)
        }
    ])
    
    // Get total count for pagination
    const totalComments = await Comment.countDocuments({ 
        video: { $in: videoIds }
    })
    
    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalComments,
                pages: Math.ceil(totalComments / limit),
                hasNextPage: page < Math.ceil(totalComments / limit),
                hasPrevPage: page > 1
            }
        }, "Channel comments retrieved successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos,
    getChannelComments
}
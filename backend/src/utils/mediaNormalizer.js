const toHttpsUrl = (url) =>
    typeof url === "string" ? url.replace(/^http:\/\//i, "https://") : url

const normalizeUserMedia = (user) => {
    if (!user) return user

    const obj = typeof user.toObject === "function" ? user.toObject() : user

    return {
        ...obj,
        avatar: toHttpsUrl(obj.avatar),
        coverImage: toHttpsUrl(obj.coverImage)
    }
}

const normalizeVideoMedia = (video) => {
    if (!video) return video

    // Support both Mongoose documents and plain objects
    const obj = typeof video.toObject === "function" ? video.toObject() : video

    return {
        ...obj,
        videoFile: toHttpsUrl(obj.videoFile),
        thumbnail: toHttpsUrl(obj.thumbnail),
        owner: normalizeUserMedia(obj.owner)
    }
}

export { toHttpsUrl, normalizeVideoMedia, normalizeUserMedia }



const toHttpsUrl = (url) =>
    typeof url === "string" ? url.replace(/^http:\/\//i, "https://") : url

const normalizeVideoMedia = (video) => {
    if (!video) return video

    // Support both Mongoose documents and plain objects
    const obj = typeof video.toObject === "function" ? video.toObject() : video

    return {
        ...obj,
        videoFile: toHttpsUrl(obj.videoFile),
        thumbnail: toHttpsUrl(obj.thumbnail)
    }
}

export { toHttpsUrl, normalizeVideoMedia }



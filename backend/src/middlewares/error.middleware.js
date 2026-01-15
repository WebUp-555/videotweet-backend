import { ApiError } from "../utils/ApiError.js"

const errorHandler = (err, req, res, next) => {
    const statusCode = err instanceof ApiError
        ? err.statusCode
        : err.statusCode || err.status || 500

    const response = {
        success: false,
        message: err?.message || "Something went wrong",
        errors: err?.errors || []
    }

    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack
    }

    return res.status(statusCode).json(response)
}

export { errorHandler }

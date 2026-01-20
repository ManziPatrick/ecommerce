"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("./AppError"));
const logger_1 = __importDefault(require("@/infra/winston/logger"));
const logs_factory_1 = require("@/modules/logs/logs.factory");
const logsService = (0, logs_factory_1.makeLogsService)();
const errorHandlers = {
    ValidationError: (err) => new AppError_1.default(400, Object.values(err.errors || {})
        .map((val) => val.message)
        .join(", ")),
    11000: () => new AppError_1.default(400, "Duplicate field value entered"),
    CastError: (err) => new AppError_1.default(400, `Invalid ${err.path}: ${err.value}`),
    TokenExpiredError: () => new AppError_1.default(401, "Your session has expired, please login again."),
    Joi: (err) => new AppError_1.default(400, (err.details || []).map((detail) => detail.message).join(", ")),
    PrismaClientKnownRequestError: (err) => {
        switch (err.code) {
            case "P2002":
                return new AppError_1.default(400, "Duplicate field value entered");
            case "P2025":
                return new AppError_1.default(404, "Record not found");
            default:
                return new AppError_1.default(400, `Prisma error: ${err.message}`);
        }
    },
    PrismaClientValidationError: () => new AppError_1.default(400, "Invalid input. Please check your request data."),
    PrismaClientInitializationError: () => new AppError_1.default(500, "Database initialization error. Please try again later."),
    PrismaClientRustPanicError: () => new AppError_1.default(500, "Unexpected internal server error. Please try again later."),
    MulterError: (err) => {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return new AppError_1.default(400, "File too large. Maximum size allowed is 20MB.");
            case "LIMIT_FILE_COUNT":
                return new AppError_1.default(400, "Too many files. Maximum allowed is 5.");
            case "LIMIT_UNEXPECTED_FILE":
                return new AppError_1.default(400, "Unexpected file field.");
            default:
                return new AppError_1.default(400, `Upload error: ${err.message}`);
        }
    },
};
const globalError = async (err, req, res, _next) => {
    let error = err instanceof AppError_1.default ? err : new AppError_1.default(500, err.message);
    const isDev = process.env.NODE_ENV === "development";
    const isProd = process.env.NODE_ENV === "production";
    const handler = errorHandlers[err.name] ||
        errorHandlers[err.constructor.name] ||
        ("code" in err ? errorHandlers[err.code || 500] : undefined);
    if (typeof handler === "function") {
        error = handler(err);
    }
    // DEV logging
    if (isDev) {
        console.error("🔴 Error Message:", err.message);
        console.error("🔴 Error Name:", err.name);
        console.error("🔴 Stack Trace:", err.stack?.split("\n").slice(0, 5).join("\n"));
        logger_1.default.error({
            message: error.message,
            statusCode: error.statusCode,
            method: req.method,
            path: req.originalUrl,
            stack: error.stack,
            ...(error.details && { details: error.details }),
        });
    }
    // PROD logging
    if (isProd && error.isOperational) {
        logger_1.default.error(`[${req.method}] ${req.originalUrl} - ${error.statusCode} - ${error.message}`);
    }
    const start = Date.now();
    const end = Date.now();
    // 🛠️ Logs Service Integration
    await logsService.error(`Error: ${error.message}`, {
        statusCode: error.statusCode,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        userId: req?.user?.id || null,
        timePeriod: end - start,
    });
    // 📤 Error Response
    res.status(error.statusCode || 500).json({
        status: error.statusCode >= 400 && error.statusCode < 500 ? "fail" : "error",
        message: error.message,
        ...(error.details && { errors: error.details }),
        ...(isDev && {
            stack: error.stack,
            error: error,
        }),
    });
};
exports.default = globalError;

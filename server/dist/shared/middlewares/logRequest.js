"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequest = void 0;
const logs_factory_1 = require("@/modules/logs/logs.factory");
const logsService = (0, logs_factory_1.makeLogsService)();
const logRequest = async (req, res, next) => {
    const start = Date.now();
    const { method, url, ip } = req;
    res.on("finish", async () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const userId = req.user?.id || "anonymous";
        await logsService.info(`API Request`, {
            method,
            url,
            status,
            timePeriod: duration,
            ip,
            userId,
        });
    });
    next();
};
exports.logRequest = logRequest;

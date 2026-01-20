"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
class LogsController {
    constructor(logsService) {
        this.logsService = logsService;
        this.getLogs = (0, asyncHandler_1.default)(async (req, res) => {
            const logs = await this.logsService.getLogs();
            (0, sendResponse_1.default)(res, 200, {
                message: "Logs fetched successfully",
                data: { logs },
            });
        });
        this.getLogByLevel = (0, asyncHandler_1.default)(async (req, res) => {
            const { level } = req.params;
            const logs = await this.logsService.getLogByLevel(level);
            (0, sendResponse_1.default)(res, 200, {
                message: "Logs fetched successfully",
                data: { logs },
            });
        });
        this.getLogById = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const log = await this.logsService.getLogById(id);
            (0, sendResponse_1.default)(res, 200, {
                message: "Log fetched successfully",
                data: { log },
            });
        });
        this.deleteLog = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            await this.logsService.deleteLog(id);
            (0, sendResponse_1.default)(res, 200, {
                message: "Log deleted successfully",
            });
        });
        this.clearLogs = (0, asyncHandler_1.default)(async (req, res) => {
            await this.logsService.clearLogs();
            (0, sendResponse_1.default)(res, 200, {
                message: "Logs cleared successfully",
            });
        });
    }
}
exports.LogsController = LogsController;

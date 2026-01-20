"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const logs_factory_1 = require("../logs/logs.factory");
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
class TransactionController {
    constructor(transactionService) {
        this.transactionService = transactionService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.getAllTransactions = (0, asyncHandler_1.default)(async (req, res) => {
            const transactions = await this.transactionService.getAllTransactions();
            (0, sendResponse_1.default)(res, 200, {
                data: { transactions },
                message: "Fetched transactions successfully",
            });
        });
        this.getTransactionById = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const transaction = await this.transactionService.getTransactionById(id);
            (0, sendResponse_1.default)(res, 200, {
                data: { transaction },
                message: "Fetched transaction successfully",
            });
        });
        this.updateTransactionStatus = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            console.log("status => ", status);
            const updatedTransaction = await this.transactionService.updateTransactionStatus(id, { status });
            (0, sendResponse_1.default)(res, 200, {
                data: { updatedTransaction },
                message: "Updated transaction successfully",
            });
        });
        this.deleteTransaction = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            await this.transactionService.deleteTransaction(id);
            (0, sendResponse_1.default)(res, 204, { message: "Deleted transaction successfully" });
        });
    }
}
exports.TransactionController = TransactionController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const logs_factory_1 = require("../logs/logs.factory");
class TransactionService {
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
        this.logsService = (0, logs_factory_1.makeLogsService)();
    }
    async getAllTransactions() {
        const transactions = await this.transactionRepository.findMany();
        return transactions;
    }
    async getTransactionById(id) {
        const transaction = await this.transactionRepository.findById(id);
        return transaction;
    }
    async updateTransactionStatus(id, data) {
        const transaction = await this.transactionRepository.updateTransaction(id, data);
        return transaction;
    }
    async deleteTransaction(id) {
        await this.transactionRepository.deleteTransaction(id);
    }
}
exports.TransactionService = TransactionService;

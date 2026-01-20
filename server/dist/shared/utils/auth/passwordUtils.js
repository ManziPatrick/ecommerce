"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = comparePassword;
exports.hashPassword = hashPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function comparePassword(plainPassword, hashedPassword) {
    return await bcryptjs_1.default.compare(plainPassword, hashedPassword);
}
async function hashPassword(plainPassword) {
    const saltRounds = 12;
    return await bcryptjs_1.default.hash(plainPassword, saltRounds);
}

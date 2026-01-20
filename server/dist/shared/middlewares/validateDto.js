"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = validateDto;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const AppError_1 = __importDefault(require("../errors/AppError"));
const logger_1 = __importDefault(require("@/infra/winston/logger"));
function validateDto(type) {
    return async (req, res, next) => {
        const dtoObj = (0, class_transformer_1.plainToInstance)(type, req.body);
        const errors = await (0, class_validator_1.validate)(dtoObj);
        if (errors.length > 0) {
            const formattedErrors = errors.map((err) => ({
                property: err.property,
                constraints: err.constraints,
            }));
            logger_1.default.error("Validation errors:", formattedErrors);
            return next(new AppError_1.default(400, "Validation failed", true, formattedErrors));
        }
        req.body = dtoObj;
        next();
    };
}

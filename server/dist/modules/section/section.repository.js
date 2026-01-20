"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionRepository = void 0;
const database_config_1 = __importDefault(require("@/infra/database/database.config"));
class SectionRepository {
    async findAll() {
        return database_config_1.default.section.findMany();
    }
    async findHero() {
        return database_config_1.default.section.findFirst({ where: { type: "HERO" } });
    }
    async findPromo() {
        return database_config_1.default.section.findFirst({ where: { type: "PROMOTIONAL" } });
    }
    async findArrivals() {
        return database_config_1.default.section.findFirst({ where: { type: "NEW_ARRIVALS" } });
    }
    async findBenefits() {
        return database_config_1.default.section.findFirst({ where: { type: "BENEFITS" } });
    }
    async create(data) {
        return database_config_1.default.section.create({ data });
    }
    async findById(id) {
        return database_config_1.default.section.findUnique({ where: { id } });
    }
    async update(type, data) {
        return database_config_1.default.section.updateMany({
            where: { type },
            data,
        });
    }
    async deleteByType(type) {
        return database_config_1.default.section.deleteMany({ where: { type } });
    }
}
exports.SectionRepository = SectionRepository;

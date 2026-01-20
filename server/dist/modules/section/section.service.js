"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionService = void 0;
const AppError_1 = __importDefault(require("@/shared/errors/AppError"));
class SectionService {
    constructor(sectionRepository) {
        this.sectionRepository = sectionRepository;
    }
    async getAllSections() {
        return this.sectionRepository.findAll();
    }
    async findHero() {
        return this.sectionRepository.findHero();
    }
    async findPromo() {
        return this.sectionRepository.findPromo();
    }
    async findBenefits() {
        return this.sectionRepository.findBenefits();
    }
    async findArrivals() {
        return this.sectionRepository.findArrivals();
    }
    async createSection(data) {
        return this.sectionRepository.create(data);
    }
    async getSectionById(id) {
        const section = await this.sectionRepository.findById(id);
        if (!section)
            throw new AppError_1.default(404, "Section not found");
        return section;
    }
    async updateSection(type, data) {
        return this.sectionRepository.update(type, data);
    }
    async deleteSection(type) {
        return this.sectionRepository.deleteByType(type);
    }
}
exports.SectionService = SectionService;

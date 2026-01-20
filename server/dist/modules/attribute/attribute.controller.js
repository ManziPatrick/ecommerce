"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeController = void 0;
const asyncHandler_1 = __importDefault(require("@/shared/utils/asyncHandler"));
const sendResponse_1 = __importDefault(require("@/shared/utils/sendResponse"));
const logs_factory_1 = require("../logs/logs.factory");
class AttributeController {
    constructor(attributeService) {
        this.attributeService = attributeService;
        this.logsService = (0, logs_factory_1.makeLogsService)();
        this.createAttribute = (0, asyncHandler_1.default)(async (req, res) => {
            const { name } = req.body;
            const attribute = await this.attributeService.createAttribute({
                name,
            });
            (0, sendResponse_1.default)(res, 201, {
                data: { attribute },
                message: "Attribute created successfully",
            });
            this.logsService.info("Attribute created", {
                userId: req.user?.id,
                sessionId: req.session.id,
            });
        });
        this.createAttributeValue = (0, asyncHandler_1.default)(async (req, res) => {
            const { attributeId, value } = req.body;
            const attributeValue = await this.attributeService.createAttributeValue({
                attributeId,
                value,
            });
            (0, sendResponse_1.default)(res, 201, {
                data: { attributeValue },
                message: "Attribute value created successfully",
            });
            this.logsService.info("Attribute value created", {
                userId: req.user?.id,
                sessionId: req.session.id,
            });
        });
        this.assignAttributeToCategory = (0, asyncHandler_1.default)(async (req, res) => {
            const { categoryId, attributeId, isRequired } = req.body;
            const result = await this.attributeService.assignAttributeToCategory({
                categoryId,
                attributeId,
                isRequired,
            });
            (0, sendResponse_1.default)(res, 201, {
                data: { result },
                message: "Attribute assigned to category successfully",
            });
            this.logsService.info("Attribute assigned to category", {
                userId: req.user?.id,
                sessionId: req.session.id,
            });
        });
        // assignAttributeToProduct = asyncHandler(
        //   async (req: Request, res: Response): Promise<void> => {
        //     const { productId, attributeId, valueId, customValue } = req.body;
        //     const result = await this.attributeService.assignAttributeToProduct({
        //       productId,
        //       attributeId,
        //       valueId,
        //       customValue,
        //     });
        //     sendResponse(res, 201, {
        //       data: { result },
        //       message: "Attribute assigned to product successfully",
        //     });
        //     this.logsService.info("Attribute assigned to product", {
        //       userId: req.user?.id,
        //       sessionId: req.session.id,
        //     });
        //   }
        // );
        this.getAllAttributes = (0, asyncHandler_1.default)(async (req, res) => {
            const { attributes, totalResults, totalPages, currentPage, resultsPerPage, } = await this.attributeService.getAllAttributes(req.query);
            (0, sendResponse_1.default)(res, 200, {
                data: {
                    attributes,
                    totalResults,
                    totalPages,
                    currentPage,
                    resultsPerPage,
                },
                message: "Attributes fetched successfully",
            });
        });
        this.getAttribute = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            const attribute = await this.attributeService.getAttribute(id);
            (0, sendResponse_1.default)(res, 200, {
                data: { attribute },
                message: "Attribute fetched successfully",
            });
        });
        this.deleteAttribute = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            console.log("icoming id => ", id);
            await this.attributeService.deleteAttribute(id);
            (0, sendResponse_1.default)(res, 200, { message: "Attribute deleted successfully" });
            this.logsService.info("Attribute deleted", {
                userId: req.user?.id,
                sessionId: req.session.id,
            });
        });
        this.deleteAttributeValue = (0, asyncHandler_1.default)(async (req, res) => {
            const { id } = req.params;
            console.log("Incoming attribute value id => ", id);
            await this.attributeService.deleteAttributeValue(id);
            (0, sendResponse_1.default)(res, 200, {
                message: "Attribute value deleted successfully",
            });
            this.logsService.info("Attribute value deleted", {
                userId: req.user?.id,
                sessionId: req.session.id,
            });
        });
    }
}
exports.AttributeController = AttributeController;

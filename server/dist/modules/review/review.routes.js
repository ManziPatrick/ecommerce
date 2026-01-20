"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_factory_1 = require("./review.factory");
const protect_1 = __importDefault(require("@/shared/middlewares/protect"));
const upload_1 = __importDefault(require("@/shared/middlewares/upload"));
const router = (0, express_1.Router)();
const controller = (0, review_factory_1.makeReviewController)();
router.get("/product/:productId", controller.getProductReviews);
router.use(protect_1.default);
router.post("/", upload_1.default.array("images", 5), controller.createReview);
router.delete("/:reviewId", controller.deleteReview);
exports.default = router;

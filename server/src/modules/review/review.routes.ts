import { Router } from "express";
import { makeReviewController } from "./review.factory";
import protect from "@/shared/middlewares/protect";
import upload from "@/shared/middlewares/upload";

const router = Router();
const controller = makeReviewController();

router.get("/product/:productId", controller.getProductReviews);

router.use(protect);

router.post(
    "/",
    upload.array("images", 5),
    controller.createReview
);

router.delete("/:reviewId", controller.deleteReview);

export default router;

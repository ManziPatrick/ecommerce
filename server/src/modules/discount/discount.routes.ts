import express from "express";
import protect from "@/shared/middlewares/protect";
import authorizeRole from "@/shared/middlewares/authorizeRole";
import { makeDiscountController } from "./discount.factory";

const router = express.Router();
const discountController = makeDiscountController();

router.post(
    "/",
    protect,
    authorizeRole("ADMIN", "SUPERADMIN"),
    discountController.createDiscount
);

router.get(
    "/",
    protect,
    authorizeRole("ADMIN", "SUPERADMIN"),
    discountController.getAllDiscounts
);

router.post("/validate", protect, discountController.validateDiscount);

router.put(
    "/:id",
    protect,
    authorizeRole("ADMIN", "SUPERADMIN"),
    discountController.updateDiscount
);

router.delete(
    "/:id",
    protect,
    authorizeRole("ADMIN", "SUPERADMIN"),
    discountController.deleteDiscount
);

export default router;

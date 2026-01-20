import express from "express";
import { makeVariantController } from "./variant.factory";
import protect from "@/shared/middlewares/protect";
import authorizeRole from "@/shared/middlewares/authorizeRole";

const router = express.Router();
const controller = makeVariantController();

router.get("/", controller.getAllVariants);
router.get("/:id", controller.getVariantById);
router.get("/sku/:sku", controller.getVariantBySku);
router.get('/:id/restock-history', protect, authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"), controller.getRestockHistory);

router.use(protect);
router.use(authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"));

router.post("/", controller.createVariant);
router.patch("/:id", controller.updateVariant);
router.post("/:id/restock", controller.restockVariant);
router.delete("/:id", controller.deleteVariant);

export default router;
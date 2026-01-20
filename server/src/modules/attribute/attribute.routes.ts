import express from "express";
import { makeAttributeController } from "./attribute.factory";

import protect from "@/shared/middlewares/protect";
import authorizeRole from "@/shared/middlewares/authorizeRole";

const router = express.Router();
const controller = makeAttributeController();

router.use(protect);

router.get("/", authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"), controller.getAllAttributes);
router.get("/:id", authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"), controller.getAttribute);
router.post("/", authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"), controller.createAttribute);
router.post("/value", authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"), controller.createAttributeValue);
router.post("/assign-category", authorizeRole("ADMIN", "SUPERADMIN"), controller.assignAttributeToCategory);
// router.post("/assign-product", authorizeRole("ADMIN", "SUPERADMIN"), controller.assignAttributeToProduct);
router.delete("/:id", authorizeRole("ADMIN", "SUPERADMIN"), controller.deleteAttribute);
router.delete("/value/:id", authorizeRole("ADMIN", "SUPERADMIN"), controller.deleteAttributeValue);

export default router;

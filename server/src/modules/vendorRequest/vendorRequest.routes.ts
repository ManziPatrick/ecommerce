import express from "express";
import protect from "@/shared/middlewares/protect";
import authorizeRole from "@/shared/middlewares/authorizeRole";
import { makeVendorRequestController } from "./vendorRequest.factory";

const router = express.Router();
const vendorRequestController = makeVendorRequestController();

// User routes
router.post("/", protect, vendorRequestController.submitRequest);

// Admin routes
router.get("/", protect, authorizeRole("ADMIN", "SUPERADMIN"), vendorRequestController.getAllRequests);
router.patch("/:id", protect, authorizeRole("ADMIN", "SUPERADMIN"), vendorRequestController.updateRequestStatus);

export default router;

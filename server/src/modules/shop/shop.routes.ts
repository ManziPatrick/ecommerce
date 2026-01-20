import express from "express";
import protect from "@/shared/middlewares/protect";
import authorizeRole from "@/shared/middlewares/authorizeRole";
import { makeShopController } from "./shop.factory";
import upload from "@/shared/middlewares/upload";

const router = express.Router();
const shopController = makeShopController();

/**
 * @swagger
 * /shops:
 *   get:
 *     summary: Get all shops
 *     responses:
 *       200:
 *         description: A list of shops.
 */
router.get("/", shopController.getAllShops);

router.get("/my-shop", protect, shopController.getMyShop);

/**
 * @swagger
 * /shops/{id}:
 *   get:
 *     summary: Get shop by ID
 *     responses:
 *       200:
 *         description: Shop details.
 *       404:
 *         description: Shop not found.
 */
router.get("/:id", shopController.getShop);

/**
 * @swagger
 * /shops/slug/{slug}:
 *   get:
 *     summary: Get shop by slug
 *     responses:
 *       200:
 *         description: Shop details.
 *       404:
 *         description: Shop not found.
 */
router.get("/slug/:slug", shopController.getShopBySlug);

/**
 * @swagger
 * /shops:
 *   post:
 *     summary: Create a new shop
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Shop created successfully.
 */
router.post(
    "/",
    protect,
    upload.single("logo"),
    shopController.createShop
);

/**
 * @swagger
 * /shops/{id}:
 *   put:
 *     summary: Update shop
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shop updated successfully.
 */
router.put(
    "/:id",
    protect,
    authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"),
    upload.single("logo"),
    shopController.updateShop
);

/**
 * @swagger
 * /shops/{id}:
 *   delete:
 *     summary: Delete shop
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Shop deleted successfully.
 */
router.delete(
    "/:id",
    protect,
    authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"),
    shopController.deleteShop
);

export default router;

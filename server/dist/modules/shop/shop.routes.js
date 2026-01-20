"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const protect_1 = __importDefault(require("@/shared/middlewares/protect"));
const authorizeRole_1 = __importDefault(require("@/shared/middlewares/authorizeRole"));
const shop_factory_1 = require("./shop.factory");
const upload_1 = __importDefault(require("@/shared/middlewares/upload"));
const router = express_1.default.Router();
const shopController = (0, shop_factory_1.makeShopController)();
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
router.get("/my-shop", protect_1.default, shopController.getMyShop);
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
router.post("/", protect_1.default, upload_1.default.single("logo"), shopController.createShop);
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
router.put("/:id", protect_1.default, (0, authorizeRole_1.default)("ADMIN", "SUPERADMIN", "VENDOR"), upload_1.default.single("logo"), shopController.updateShop);
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
router.delete("/:id", protect_1.default, (0, authorizeRole_1.default)("ADMIN", "SUPERADMIN", "VENDOR"), shopController.deleteShop);
exports.default = router;

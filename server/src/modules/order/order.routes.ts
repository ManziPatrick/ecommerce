import express from "express";
import protect from "@/shared/middlewares/protect";
import authorizeRole from "@/shared/middlewares/authorizeRole";
import { makeOrderController } from "./order.factory";

const router = express.Router();
const orderController = makeOrderController();

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders (admin only)
 *     description: Retrieves all orders in the system. Accessible only by admins and superadmins.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all orders.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 */
router.get(
  "/",
  protect,
  authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"),
  orderController.getAllOrders
);

/**
 * @swagger
 * /orders/user:
 *   get:
 *     summary: Get user orders
 *     description: Retrieves all orders placed by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders placed by the user.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 */
router.get("/user", protect, orderController.getUserOrders);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     description: Retrieves detailed information about a specific order.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to retrieve.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The details of the specified order.
 *       404:
 *         description: Order not found.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 */
router.get("/:orderId", protect, orderController.getOrderDetails);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create order from cart
 *     description: Creates a new order from the user's cart.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cartId:
 *                 type: string
 *                 description: The ID of the cart to create an order from.
 *     responses:
 *       201:
 *         description: Order created successfully.
 *       400:
 *         description: Bad request. Cart ID is missing or invalid.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 */
router.post("/", protect, orderController.createOrder);

/**
 * @swagger
 * /orders/{orderId}:
 *   put:
 *     summary: Update order status (admin only)
 *     description: Updates the status of a specific order. Accessible only by admins and superadmins.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status for the order.
 *     responses:
 *       200:
 *         description: Order updated successfully.
 *       400:
 *         description: Bad request. Status is missing.
 *       401:
 *         description: Unauthorized. Token is invalid or missing.
 *       403:
 *         description: Forbidden. User does not have the required role.
 *       404:
 *         description: Order not found.
 */
router.put(
  "/:orderId",
  protect,
  authorizeRole("ADMIN", "SUPERADMIN", "VENDOR"),
  orderController.updateOrder
);

/**
 * @swagger
 * /orders/{orderId}/return:
 *   post:
 *     summary: Request return
 *     description: Requests a return for a delivered order within 4 hours.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Return request created.
 *       400:
 *         description: Return period exceeded or invalid status.
 */
router.post("/:orderId/return", protect, orderController.requestReturn);

export default router;

import { Router } from "express";
const router = Router();
import { verifyJWT } from "../../middlewares/auth.middlewares.js"
import { getBillingShippingDetails, updateBillingShippingDetails } from "../../controllers/orgControllers/bill.controllers.js";

/**
 * @swagger
 * /v1/api/bill/get:
 *   get:
 *     tags:
 *       - Organization
 *     summary:  Retrieve Billing Shipping data by org_id
 *     description: Fetch Billing Shipping details such as addresses, city, state based on the provided org_id.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: org_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "64c9e9f9c125f2a9a5b5d2d1"
 *         description: The unique identifier of the organization
 *
 *     responses:
 *       '200':
 *         description: Details retrieved successfully
 *       '400':
 *         description: Details not found
 */
router.route("/get").get(verifyJWT, getBillingShippingDetails)



/**
 * @swagger
 * /v1/api/bill/edit:
 *   post:
 *     tags:
 *       - Organization
 *     summary: Update Billing and Shipping details
 *     description: Allows SUPERADMIN to update Billing and Shipping details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               org_id:
 *                 type: string
 *                 example: "3j4ui4iuffu4f4f43f"
 *               userId:
 *                 type: string
 *                 example: "uf4y78oy47brt6434re"
 *               billing_shipping_address:
 *                 type: string
 *                 example: "gonda"
 *               city:
 *                 type: string
 *                 example: "pune"
 *               state:
 *                 type: string
 *                 example: "up"
 *               country:
 *                 type: string
 *                 example: "india"
 *               zipcode:
 *                 type: string
 *                 example: "3523443"
 *     responses:
 *       '200':
 *         description: Details updated successfully
 *       '400':
 *         description: Details update failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Detials update failed"
 */
router.route("/edit").post(verifyJWT, updateBillingShippingDetails)


export default router;

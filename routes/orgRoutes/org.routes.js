import { Router } from "express";
const router = Router();

import { verifyJWT } from "../../middlewares/auth.middlewares.js";
import { getOrg, updateOrg } from "../../controllers/orgControllers/org.controllers.js";



/**
 * @swagger
 * /v1/api/org/get:
 *   get:
 *     tags:
 *       - Organization
 *     summary:  Retrieve organization data by org_id
 *     description: Fetch Organization details such as organization name, email, logo based on the provided org_id.
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
 *         description: Organization details retrieved successfully
 *       '400':
 *         description: Organization not found

 */
router.route("/get").get(verifyJWT, getOrg)


/**
 * @swagger
 * /v1/api/org/edit:
 *   post:
 *     tags:
 *       - Organization
 *     summary: Update Organization details
 *     description: Allows SUPERADMIN to update an organization's details
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
 *                 example: "9087654321"
 *               userId:
 *                 type: string
 *                 example: "9087654321"
 *               org_phone:
 *                 type: number
 *                 example: "9087654321"
 *               email:
 *                 type: string
 *                 example: "jane.doe@example.com"
 *               org_email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               currency:
 *                 type: string
 *                 example: "USD"
 *               vat_tax_gst_number:
 *                 type: string
 *                 example: "87876JD99K"
 *               org_website:
 *                 type: string
 *                 example: "www.example.com"
 *               org_address:
 *                 type: string
 *                 example: "22 Jump Street, Phoenix, Arizona"
 *               org_city:
 *                 type: string
 *                 example: "Phoenix"
 *               org_state:
 *                 type: string
 *                 example: "Arizona"
 *               org_country:
 *                 type: string
 *                 example: "US"
 *               org_zipcode:
 *                 type: string
 *                 example: "232233"
 *               organization:
 *                 type: string
 *                 example: "Initializ Pvt Ltd"
 *               org_logo:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *     responses:
 *       '200':
 *         description: Profile image uploaded successfully
 *       '400':
 *         description: Organization update failed
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
 *                   example: "Organization update failed"
 */

router.route("/edit").post(verifyJWT, updateOrg)


export default router;

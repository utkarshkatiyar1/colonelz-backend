import { Router } from "express";
import { checkEmail, registerUser, sendOtp, verifyOtp } from "../../controllers/usersControllers/register.controller.js";
import { checkAvailableUserIsAdmin, verifyJWT } from "../../middlewares/auth.middlewares.js";
import { login } from "../../controllers/usersControllers/login.controller.js";
import { logout } from "../../controllers/usersControllers/logout.controller.js";
import { changePassController, otpVerification, sendotpforgetpassword } from "../../controllers/usersControllers/forget.password.controller.js";
import { getUserData } from "../../controllers/usersControllers/getuserdata.controller.js";
import { profileUpload } from "../../controllers/usersControllers/profile.image.controller.js";
import { updateStatus, updateStatusClient } from "../../controllers/adminControllers/quotationController/quotation.approval.controller.js";
import { updateStatusAdmin } from "../../controllers/adminControllers/fileUploadController/contract.share.controller.js"
import { resetPassword } from "../../controllers/usersControllers/reset.password.controller.js";
import { refreshAccessToken } from "../../controllers/usersControllers/refreshToken.controller.js";
const router = Router();

/**
 * @swagger
 * /v1/api/users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Log in a user
 *     requestBody:
 *       description: User credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: user
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       '200':
 *         description: Login successful
 *       '403':
 *         description: Unauthorized
 */


router.route("/login").post(login);

router.route("/check/email").get(checkEmail)
router.route("/send/otp").post(sendOtp);
router.route("/verify/otp").post(verifyOtp);
router.route("/register").post(registerUser);

/**
 * @swagger
 * paths:
 *   /logout:
 *     post:
 *       tags: 
 *       - Users
 *       summary: Logout a user
 *       description: Logs out a user by invalidating their session or token.
 *       requestBody:
 *         description: User ID for logging out
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the user logging out
 *       responses:
 *         '200':
 *           description: User logged out successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "User logged out successfully"
 *         '400':
 *           description: Bad request, possibly due to missing or invalid parameters
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: false
 *                   message:
 *                     type: string
 *                     example: "Invalid input data"
 *         '500':
 *           description: Internal server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: false
 *                   message:
 *                     type: string
 *                     example: "Internal Server Error"
 */

router.route("/logout").post(logout)
/**
 * @swagger
 * /v1/api/users/sendotp/forget/password:
 *   post:
 *     tags:
 *       - Users
 *     summary: send otp for forgot password
 *     requestBody:
 *       description: Email for sending OTP
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *              
 *     responses:
 *       '200':
 *         description: OTP sent successfully
 *       '400':
 *         description: Failed to send OTP
 */

router.route("/sendotp/forget/password").post(sendotpforgetpassword);
/**
 * @swagger
 * /v1/api/users/verifyotp/forget/password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verify OTP for password reset
 *     requestBody:
 *       description: OTP and email for verification
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               otp:
 *                 type: string
 *                 example: '123456'
 *              
 *     responses:
 *       '200':
 *         description: OTP verified successfully
 *       '400':
 *         description: OTP verification failed
 */
router.route("/verifyotp/forget/password").post(otpVerification);

/**
 * @swagger
 * /v1/api/users/reset/password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Reset password after OTP verification
 *     requestBody:
 *       description: New password details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: Test@123
 *               token:
 *                 type: string
 *                 example: eyd23erfgbggnhjuiy6y5432wedscvbnhjukui7u654ewsdfvbgnhjuky654erfdvcdfret5yujhmn       
 *     responses:
 *       '200':
 *         description: Password reset successfully
 *       '400':
 *         description: Password reset failed
 */
router.route("/reset/password").post(changePassController);

/**
 * @swagger
 * /v1/api/users/change/password:
 *   post:
 *     tags:
 *       - Users
 *     summary:  Change password for a logged-in user
 *     requestBody:
 *       description: Old and new password details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               old_password:
 *                 type: string
 *                 example: Test@123
 *               new_password:
 *                 type: string
 *                 example: Test#123
 *               userId:
 *                 type: string
 *                 example: ds23425ythgre3456uyhtgre435
 *               confirm_new_password:
 *                 type: string
 *                 example: Test#123
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *       '400':
 *         description: Password changed failed
 */
router.route("/change/password").post(verifyJWT, resetPassword);

/**
 * @swagger
 * /v1/api/users/getdata:
 *   get:
 *     tags:
 *       - Users
 *     summary:  Retrieve user data by userId
 *     description: Fetch user details such as username, email, avatar, and role based on the provided userId.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "64c9e9f9c125f2a9a5b5d2d1"
 *         description: The unique identifier of the user
 *
 *     responses:
 *       '200':
 *         description: User details retrieved successfully
 *       '400':
 *         description: User not found

 */
router.route("/getdata").get(verifyJWT, getUserData)
/**
 * @swagger
 * /v1/api/users/profileurl:
 *   post:
 *     tags:
 *       - Users
 *     summary:  Upload user profile image
 *     description: Allows users to upload a profile image, which is then stored and associated with their user profile.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User ID and profile image file
 *       required: true
 *       content:
 *          multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 64c9e9f9c125f2a9a5b5d2d1
 *                 description: The unique identifier of the user
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The profile image file to be uploaded
 *     responses:
 *       '200':
 *         description: Profile image uploaded successfully
 *       '400':
 *         description: Profile image uploaded failed
 */
router.route("/profileurl").post(verifyJWT, profileUpload)


// router.route("/").get(checkAvailableUserIsAdmin)
router.route("/approval/admin").post(updateStatus)
router.route("/approval/client").post(updateStatusClient)

/**
 * @swagger
 * paths:
 *   /v1/api/users/refresh-token:
 *     post:
 *       tags:
 *         - Users
 *       summary: Refresh access token
 *       description: Generates a new access token using the provided refresh token. The refresh token can be sent in a cookie or in the request body.
 *       requestBody:
 *         description: Refresh token details
 *         required: false
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   description: The refresh token sent in the request body
 *       responses:
 *         '200':
 *           description: New access token generated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   accessToken:
 *                     type: string
 *                     example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   refreshToken:
 *                     type: string
 *                     example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         '400':
 *           description: Bad request, possibly due to a missing or invalid refresh token
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: false
 *                   message:
 *                     type: string
 *                     example: "Invalid refresh token"
 *         '403':
 *           description: Unauthorized access due to invalid or expired refresh token
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: false
 *                   message:
 *                     type: string
 *                     example: "Unauthorized"
 *         '500':
 *           description: Internal server error
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: false
 *                   message:
 *                     type: string
 *                     example: "Internal Server Error"
 */

router.route("/refresh-token").post(refreshAccessToken)


export default router;

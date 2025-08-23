import { Router } from "express";
const router = Router();

import fileupload, { DrawingFileUpload } from "../../controllers/adminControllers/fileUploadController/fileuploadController.js";

import { getCompanyData, getDrawingData, getFileData, getleadData, getprojectData } from "../../controllers/adminControllers/fileUploadController/getFileController.js";
import getSingleFileData from "../../controllers/adminControllers/fileUploadController/getSingleFileController.js";

import {
  createmom,
  deleteMom,
  getAllMom,
  getAllProjectMom,
  getSingleMom,
  updateMom,
} from "../../controllers/adminControllers/momControllers/mom.controller.js";
import {
  createLead,
  deleteInvativeLead,
  getAllLead,
  getSingleLead,
  getTimeline,
  leadActivity,
  leadToMultipleProject,
  leadToProject,
  updateFollowLead,
  updateLead,
} from "../../controllers/adminControllers/leadController/lead.controller.js";
import {
  getAllProject,
  getAllProjectByLeadId,
  getSingleProject,
  projectActivity,
  updateProjectDetails,
} from "../../controllers/adminControllers/projectController/project.controller.js";
import {
  getQuotationData,

} from "../../controllers/adminControllers/quotationController/getQuotation.controller.js";

import { contractShare } from "../../controllers/adminControllers/fileUploadController/contract.controller.js";
import { getNotification, updateNotification } from "../../controllers/notification/notification.controller.js";
import projectFileUpload from "../../controllers/adminControllers/fileUploadController/project.file.controller.js";
import { shareFile } from "../../controllers/adminControllers/fileUploadController/share.files.controller.js";
import { getSingleTemplateFile, templateFileUpload } from "../../controllers/adminControllers/fileUploadController/template.controller.js";
import { deleteFile, deleteFolder } from "../../controllers/adminControllers/fileUploadController/delete.file.controller.js";
import { shareQuotation, updateStatus, updateStatusAdmin } from "../../controllers/adminControllers/quotationController/quotation.approval.controller.js";
import { archiveUser, createUser, deleteUser, deleteUserArchive, getUser, restoreUser, updateUserRole } from "../../controllers/adminControllers/createuser.controllers/createuser.controller.js";
import { addMember, listUserInProject, removeMemberInProject } from "../../controllers/adminControllers/projectController/addmember.project.controller.js";
import { checkAvailableUserIsAdmin, checkAvailableUserIsAdminInFile, checkAvailableUserIsAdminInLead, checkAvailableUserIsAdminInMom, checkAvailableUserIsAdmininProject, checkAvailableUserIsAdmininProjectByLeadid, checkOpenTaskReadAccess, isAdmin } from "../../middlewares/auth.middlewares.js";


import { verifyJWT } from "../../middlewares/auth.middlewares.js";
import { contractStatus, getContractData, shareContract } from "../../controllers/adminControllers/fileUploadController/contract.share.controller.js";
import { AddMemberInLead, listUserInLead, removeMemberInlead } from "../../controllers/adminControllers/leadController/addmemberinlead.controller.js";
import { archive, deletearchive, restoreData } from "../../controllers/adminControllers/archiveControllers/archive.controller.js";
import { createTask, deleteTask, getAllTaskWithData, getAllTasks, getSingleTask, updateTask } from "../../controllers/adminControllers/taskControllers/task.controller.js";
import { createSubTask, deleteSubTask, getAllSubTask, getSingleSubTask, updateSubTask } from "../../controllers/adminControllers/taskControllers/subtask.controller.js";
import { GetSingleMinitimerController, GetSingleSubtimerController, GetSingleTasktimerController, UpdateMinitimerController, UpdateSubtimerController, UpdateTasktimerController } from "../../controllers/adminControllers/timerControllers/timer.controller.js";
import { getProjectUser, getProjectUserList, getUserList } from "../../controllers/adminControllers/createuser.controllers/getuser.controller.js";
import { createAddMember, createContractAccess, createLeadAccess, createLeadTaskAccess, createMomAccess, createOpenTaskAccess, createProjectAccess, createQuotationAccess, CreateRoleAccess, createTaskAccess, CreateUserAccess, deleteAddMember, deleteArchiveAccess, deleteArchiveUserAccess, deletedFileAccess, deleteLeadAccess, deleteLeadTskAccess, deleteMomAccess, deleteOpenTskAccess, deleteRole, deleteTskAccess, deleteUserAccess, GetArchiveUser, GetRole, GetUser, moveOpenTaskAccess, readArchiveAccess, readContractAccess, readFileAccess, readFileCompanyDataAccess, readLeadAccess, readLeadTaskAccess, readMomAccess, readOpenTaskAccess, readProjectAccess, readQuotationAccess, readTaskAccess, restoreArchiveAccess, restoreUserAccess, updateContractAccess, updateLeadAccess, updateLeadTaskAccess, updateMomAccess, updateOpenTaskAccess, updateProjectAccess, updateQuotationAccess, updateRole, updateTaskAccess, updateUserRoleAccess } from "../../middlewares/access.middlewares.js";
import { createRole, DeleteRole, getRole, roleName, roleWiseAccess, UpdateRole } from "../../controllers/adminControllers/createRoleControllers/role.controllers.js";
import { verify } from "crypto";
import { createLeadTask, deleteLeadTask, getAllLeadTasks, getAllLeadTaskWithData, getSingleLeadTask, updateLeadTask } from "../../controllers/adminControllers/leadTaskControllers/task.controller.js";
import { createLeadSubTask, deleteLeadSubTask, getAllLeadSubTask, getSingleLeadSubTask, updateLeadSubTask } from "../../controllers/adminControllers/leadTaskControllers/subtask.controller.js";
import { GetSingleLeadMinitimerController, GetSingleLeadSubtimerController, GetSingleLeadTasktimerController, UpdateLeadMinitimerController, UpdateLeadSubtimerController, UpdateLeadTasktimerController } from "../../controllers/adminControllers/leadTimerControllers/timer.controller.js";
import { Alltask, createOpenTask, deleteOpenTask, getSingleOpenTask, MoveTask, updateOpenTask } from "../../controllers/adminControllers/taskControllers/alltask.controller.js";
import { createOpenSubTask, deleteOpenSubTask, getAllOpenSubTask, getSingleOpenSubTask, updateOpenSubTask } from "../../controllers/adminControllers/taskControllers/opensubtask.controller.js";
import { GetSingleOpenSubtimerController, GetSingleOpenTasktimerController, UpdateOpenSubtimerController, UpdateOpenTasktimerController } from "../../controllers/adminControllers/taskControllers/openTimer.controller.js";
import { createImage, deleteMainImage, getAllMainImage, getAllPanoImagesFromFileManager, getImageById } from "../../controllers/adminControllers/threeImageControllers/threeImage.controller.js";
import { addUserToFile, getFilesForUser } from "../../controllers/adminControllers/leadController/approval.controller.js";
import { createLeadMiniTask, deleteLeadMiniTask, getAllLeadMiniTask, getSingleLeadMiniTask, updateLeadMiniTask } from "../../controllers/adminControllers/leadTaskControllers/minitask.controller.js";
import { createMiniTask, deleteMiniTask, getAllMiniTask, getSingleMiniTask, updateMiniTask } from "../../controllers/adminControllers/taskControllers/minitask.controller.js";
import { deleteProjectExecutionTask, deleteProjectExecutionTaskDetails, downloadExecutionChart, getProjectExecutionTask, projectExecutionTask, updateProjectExecutionTask, updateProjectExecutionTaskDetails } from "../../controllers/adminControllers/project_execution_timeline/project_execution_task.js";
import { createProjectExecutionSubtask, deleteProjectExecutionSubtask, deleteProjectExecutionSubtaskDetails, getProjectExecutionSubtaskAffections, updateProjectExecutionSubtask, updateProjectExecutionSubtaskDetails } from "../../controllers/adminControllers/project_execution_timeline/project_execution_subtask.js";

// router.use(checkAvailableUserIsAdmin)

/**
 * @swagger
 * /v1/api/admin/create/user:
 *   post:
 *     summary: Create a new user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Data for creating a user
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */
router.route("/create/user").post(verifyJWT, CreateUserAccess, createUser);
/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Project Management API
 *   description: API documentation for project-related operations
 *   version: 1.0.0
 *
 * servers:
 *   - url: 
 *
 *
 * paths:
 *   /v1/api/admin/add/member:
 *     post:
 *       tags: [Project Management]
 *       summary: Add a member to a project
 *       description: Allows adding a new member to a specific project with a defined role.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Member details to be added to the project
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the member
 *                 project_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d2"
 *                   description: The unique identifier of the project
 *                 user_name:
 *                   type: string
 *                   example: "JohnDoe"
 *                   description: The name of the user being added
 *                 role:
 *                   type: string
 *                   example: "Developer"
 *                   description: The role assigned to the user within the project
 *       responses:
 *         '200':
 *           description: Member added successfully
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
 *                     example: "Member added successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       project_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d2"
 *                       user_name:
 *                         type: string
 *                         example: "JohnDoe"
 *                       role:
 *                         type: string
 *                         example: "Developer"
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
 *         '403':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/add/member").post(verifyJWT, createAddMember, addMember);
/**
 * @swagger
 * /v1/api/admin/get/alluser:
 *   get:
 *     summary: all active user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "64c9e9f9c125f2a9a5b5d2d1"
 *         description: The unique identifier of the user
 *     responses:
 *       200:
 *         description: User fetched  successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */
router.route("/get/alluser").get(verifyJWT, GetUser, getUser);
/**
 * @swagger
 * /v1/api/admin/delete/user:
 *   delete:
 *     summary: Soft delete a user and store in archive
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "64c9e9f9c125f2a9a5b5d2d1"
 *         description: The unique identifier of the user to be deleted
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

router.route("/delete/user").delete(verifyJWT, deleteUserAccess, deleteUser);

router.route("/get/userlist").get(verifyJWT, getUserList);
/**
 * @swagger
 * /v1/api/admin/archive/user:
 *   get:
 *     summary: all archive user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched  successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */
router.route("/archive/user").get(verifyJWT, GetArchiveUser, archiveUser);
/**
 * @swagger
 * /v1/api/admin/restore/user:
 *   post:
 *     summary: restore user from archive
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: restore user from archive
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "64c9e9f9c125f2a9a5b5d2d1"
 
 *     responses:
 *       200:
 *         description: User restore successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */
router.route("/restore/user").post(verifyJWT, restoreUserAccess, restoreUser);
/**
 * @swagger
 * /v1/api/admin/delete/archive/user:
 *   delete:
 *     summary:  delete a user from archive
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "64c9e9f9c125f2a9a5b5d2d1"
 *         description: The unique identifier of the user to be deleted
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.route("/delete/archive/user").delete(verifyJWT, deleteArchiveUserAccess, deleteUserArchive);

// router.route("/user/access/list").get(verifyJWT, userAcessLeadOrProjectList)
/**
 * @swagger
 * /v1/api/admin/update/users/role:
 *   put:
 *     summary: "Update User Role"
 *     description: "Updates the role of a specified user."
 *     tags:
 *       - "User Management"
 *     parameters:
 *       - in: "header"
 *         name: "Authorization"
 *         description: "JWT token for authentication"
 *         required: true
 *         type: "string"
 *       - in: "body"
 *         name: "body"
 *         description: "User role update information"
 *         required: true
 *         schema:
 *           type: "object"
 *           properties:
 *             userId:
 *               type: "string"
 *               example: "1234567890abcdef"
 *             role:
 *               type: "string"
 *               example: "admin"
 *     responses:
 *       200:
 *         description: "User role updated successfully"
 *         schema:
 *           type: "object"
 *           properties:
 *             message:
 *               type: "string"
 *               example: "User role updated successfully"
 *       400:
 *         description: "Bad Request"
 *         schema:
 *           type: "object"
 *           properties:
 *             message:
 *               type: "string"
 *               example: "Invalid user ID or role"
 *       401:
 *         description: "Unauthorized"
 *         schema:
 *           type: "object"
 *           properties:
 *             message:
 *               type: "string"
 *               example: "Invalid token"
 *       404:
 *         description: "User not found"
 *         schema:
 *           type: "object"
 *           properties:
 *             message:
 *               type: "string"
 *               example: "User not found"
 */
router.route("/update/users/role").put(verifyJWT, updateUserRoleAccess, updateUserRole)


router.route("/fileupload").post(verifyJWT, fileupload);
router.route("/drawingupload").post(verifyJWT, DrawingFileUpload);
router.route("/getfile").get(verifyJWT, readFileAccess, checkAvailableUserIsAdminInFile, getFileData);
router.route("/getdrawingfile").get(verifyJWT, readFileAccess, getDrawingData);
router.route("/get/onefile").get(verifyJWT, readFileAccess, getSingleFileData);
router.route("/lead/getfile").get(verifyJWT, readLeadAccess, getleadData);
router.route("/project/getfile").get(verifyJWT, readProjectAccess, getprojectData);
router.route("/project/fileupload").post(verifyJWT, projectFileUpload);
router.route("/view/contract").post(verifyJWT, readContractAccess, contractShare);
router.route("/share/file").post(verifyJWT, shareFile);
router.route("/template/fileupload").post(verifyJWT, templateFileUpload);
router.route("/template/single/file").get(verifyJWT, readFileCompanyDataAccess, getSingleTemplateFile);
router.route("/delete/file").delete(verifyJWT, deletedFileAccess, deleteFile);
router.route("/share/contract").post(verifyJWT, createContractAccess, shareContract);
router.route("/contract/approval").post(verifyJWT, updateContractAccess, contractStatus);
router.route("/get/contractdata").get(verifyJWT, readContractAccess, getContractData);
router.route("/delete/folder").delete(verifyJWT, deletedFileAccess, deleteFolder);
router.route("/get/companyData").get(verifyJWT, readFileCompanyDataAccess, getCompanyData);



/**
 * @swagger
 * /v1/api/admin/getall/project:
 *   get:
 *     summary: all project Details
 *     tags: [Project Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "64c9e9f9c125f2a9a5b5d2d1"
 *         description: The unique identifier of the user
 *     responses:
 *       200:
 *         description: Project data fetched  successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */
router.route("/getall/project").get(verifyJWT, readProjectAccess, checkAvailableUserIsAdmininProject, getAllProject);
router.route("/getallByLeadId/project").get(verifyJWT, readProjectAccess, checkAvailableUserIsAdmininProjectByLeadid, getAllProjectByLeadId);
/**
 * @swagger
 * /v1/api/admin/getsingle/project:
 *   get:
 *     summary: Get single project details
 *     tags: [Project Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "64c9e9f9c125f2a9a5b5d2d1"
 *         description: The unique identifier of the user
 *       - in: query
 *         name: project_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "COLP-123456"
 *         description: The unique identifier of the project
 *     responses:
 *       200:
 *         description: Project details fetched successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized
 */

router.route("/getsingle/project").get(verifyJWT, readProjectAccess, getSingleProject);
/** 
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Project Management API
 *   description: API documentation for project-related operations
 *   version: 1.0.0
 *
 * servers:
 *   - url: 
 *
 * paths:
 *   /v1/api/admin/update/project:
 *     put:
 *       tags: [Project Management]
 *       summary: Update project details
 *       description: Allows updating of project details such as status, timeline, budget, and other related information.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Project details to be updated
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the project
 *                 project_status:
 *                   type: string
 *                   example: "In Progress"
 *                   description: The current status of the project
 *                 timeline_date:
 *                   type: string
 *                   format: date
 *                   example: "2024-12-31"
 *                   description: The timeline or deadline date for the project
 *                 project_budget:
 *                   type: number
 *                   example: 50000
 *                   description: The budget allocated for the project
 *                 description:
 *                   type: string
 *                   example: "This project involves redesigning the client's website."
 *                   description: A detailed description of the project
 *                 designer:
 *                   type: string
 *                   example: "JohnDoe"
 *                   description: The name or ID of the designer assigned to the project
 *                 user_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the user making the update
 *                 client_email:
 *                   type: string
 *                   example: "client@example.com"
 *                   description: The email of the client associated with the project
 *       responses:
 *         '200':
 *           description: Project details updated successfully
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
 *                     example: "Project details updated successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       project_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       project_status:
 *                         type: string
 *                         example: "In Progress"
 *                       timeline_date:
 *                         type: string
 *                         format: date
 *                         example: "2024-12-31"
 *                       project_budget:
 *                         type: number
 *                         example: 50000
 *                       description:
 *                         type: string
 *                         example: "This project involves redesigning the client's website."
 *                       designer:
 *                         type: string
 *                         example: "JohnDoe"
 *                       user_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       client_email:
 *                         type: string
 *                         example: "client@example.com"
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
 *         '403':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/update/project").put(verifyJWT, updateProjectAccess, updateProjectDetails);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/remove/member/project:
 *     post:
 *       tags: [Project Management]
 *       summary: Remove a member from a project
 *       description: Allows removal of a specific member from a project by providing the project ID and the username of the member.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Project ID and username of the member to be removed
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the project
 *                 username:
 *                   type: string
 *                   example: "JohnDoe"
 *                   description: The username of the member to be removed
 *       responses:
 *         '200':
 *           description: Member removed successfully
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
 *                     example: "Member removed successfully"
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
 *         '403':
 *           description: Unauthorized access due to missing or invalid JWT
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
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/remove/member/project").post(verifyJWT, deleteAddMember, removeMemberInProject);
router.route("/get/user/project").get(verifyJWT, getProjectUser);
router.route("/get/userlist/project").get(verifyJWT, getProjectUserList);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/get/userlist/project:
 *     get:
 *       tags:
 *         - Project Management
 *       summary: Retrieve a list of users associated with a project
 *       description: Fetches a list of users linked to a specific project based on the provided project ID.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: project_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "COLP-123456"
 *           description: The unique identifier of the project
 *       responses:
 *         '200':
 *           description: User list retrieved successfully
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
 *                     example: "User list retrieved successfully"
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "64c9e9f9c125f2a9a5b5d2d2"
 *                         username:
 *                           type: string
 *                           example: "JaneDoe"
 *                         role:
 *                           type: string
 *                           example: "Developer"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.route("/get/userlist/project/").get(verifyJWT, listUserInProject);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/get/project/activity:
 *     get:
 *       tags:
 *         - Project Management
 *       summary: Retrieve project activity
 *       description: Fetches the activity associated with a specific project using the project ID.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: project_id
 *           in: query
 *           required: true
 *           schema:
 *             type: string
 *           description: The ID of the project*
 *         - name: page
 *           in: query
 *           required: false
 *           schema:
 *             type: integer
 *             format: int32
 *           description: The page number for pagination (default is 1).
 *         - name: limit
 *           in: query
 *           required: false
 *           schema:
 *             type: integer
 *             format: int32
 *           description: The number of results per page (default is 5).
 *       responses:
 *         '200':
 *           description: Successful response with project activity
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         activity_id:
 *                           type: string
 *                           example: "activity_456"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-09-26T12:00:00Z"
 *                         description:
 *                           type: string
 *                           example: "Project updated with new milestones"
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
 *                     example: "Invalid project ID"
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '404':
 *           description: Project not found
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
 *                     example: "Project not found"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/get/project/activity").get(verifyJWT, projectActivity);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/get/lead/activity:
 *     get:
 *       tags:
 *         - Lead Management
 *       summary: Retrieve lead activity
 *       description: Fetches the activity associated with a specific lead using the lead ID.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: lead_id
 *           in: query
 *           required: true
 *           schema:
 *             type: string
 *           description: The ID of the lead*
 *         - name: page
 *           in: query
 *           required: false
 *           schema:
 *             type: integer
 *             format: int32
 *           description: The page number for pagination (default is 1).
 *         - name: limit
 *           in: query
 *           required: false
 *           schema:
 *             type: integer
 *             format: int32
 *           description: The number of results per page (default is 5).
 *       responses:
 *         '200':
 *           description: Successful response with lead activity
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         activity_id:
 *                           type: string
 *                           example: "activity_123"
 *                         timestamp:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-09-26T12:00:00Z"
 *                         description:
 *                           type: string
 *                           example: "Lead viewed product X"
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
 *                     example: "Invalid lead ID"
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '404':
 *           description: Lead not found
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
 *                     example: "Lead not found"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/get/lead/activity").get(verifyJWT, leadActivity);

/**
 * @swagger
 * paths:
 *   /v1/api/admin/create/lead:
 *     post:
 *       tags:
 *         - Lead Management
 *       summary: Create a new lead
 *       description: Allows creating a new lead by providing necessary details such as name, email, phone, location, status, and more.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Lead details to be created
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                   description: The name of the lead
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                   description: The email address of the lead
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                   description: The phone number of the lead
 *                 location:
 *                   type: string
 *                   example: "New York"
 *                   description: The location of the lead
 *                 status:
 *                   type: string
 *                   example: "New"
 *                   description: The current status of the lead
 *                 source:
 *                   type: string
 *                   example: "Website"
 *                   description: The source through which the lead was acquired
 *                 content:
 *                   type: string
 *                   example: "Interested in product X"
 *                   description: Additional content or notes related to the lead
 *                 userId:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the user creating the lead
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2024-09-03"
 *                   description: The date when the lead was created
 *                 lead_manager:
 *                   type: string
 *                   example: "Jane Smith"
 *                   description: The name or ID of the lead manager
 *       responses:
 *         '200':
 *           description: Lead created successfully
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
 *                     example: "Lead created successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       phone:
 *                         type: string
 *                         example: "+1234567890"
 *                       location:
 *                         type: string
 *                         example: "New York"
 *                       status:
 *                         type: string
 *                         example: "New"
 *                       source:
 *                         type: string
 *                         example: "Website"
 *                       content:
 *                         type: string
 *                         example: "Interested in product X"
 *                       userId:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-09-03"
 *                       lead_manager:
 *                         type: string
 *                         example: "Jane Smith"
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
 *         '403':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/create/lead").post(verifyJWT, createLeadAccess, createLead);
router.route("/adduser/approval").post(verifyJWT, addUserToFile);
router.route("/getfile/approval").get(verifyJWT, getFilesForUser);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/getall/lead:
 *     get:
 *       tags:
 *         - Lead Management
 *       summary: Get all leads
 *       description: Retrieves a list of all leads. This endpoint checks user permissions to determine if the user is an admin or has access to the leads.
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: Successfully retrieved all leads
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
 *                     example: "Leads retrieved successfully"
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "64c9e9f9c125f2a9a5b5d2d1"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *                         phone:
 *                           type: string
 *                           example: "+1234567890"
 *                         location:
 *                           type: string
 *                           example: "New York"
 *                         status:
 *                           type: string
 *                           example: "New"
 *                         source:
 *                           type: string
 *                           example: "Website"
 *                         content:
 *                           type: string
 *                           example: "Interested in product X"
 *                         userId:
 *                           type: string
 *                           example: "64c9e9f9c125f2a9a5b5d2d1"
 *                         date:
 *                           type: string
 *                           format: date
 *                           example: "2024-09-03"
 *                         lead_manager:
 *                           type: string
 *                           example: "Jane Smith"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/getall/lead").get(verifyJWT, readLeadAccess, checkAvailableUserIsAdminInLead, getAllLead);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/getsingle/lead:
 *     get:
 *       tags:
 *         - Lead Management
 *       summary: Get a single lead by ID
 *       description: Retrieves the details of a specific lead based on the provided lead ID.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: lead_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "64c9e9f9c125f2a9a5b5d2d1"
 *           description: The unique identifier of the lead to be retrieved
 *       responses:
 *         '200':
 *           description: Successfully retrieved the lead details
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
 *                     example: "Lead retrieved successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 *                       phone:
 *                         type: string
 *                         example: "+1234567890"
 *                       location:
 *                         type: string
 *                         example: "New York"
 *                       status:
 *                         type: string
 *                         example: "New"
 *                       source:
 *                         type: string
 *                         example: "Website"
 *                       content:
 *                         type: string
 *                         example: "Interested in product X"
 *                       userId:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-09-03"
 *                       lead_manager:
 *                         type: string
 *                         example: "Jane Smith"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
 *         '404':
 *           description: Lead not found
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
 *                     example: "Lead not found"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/getsingle/lead").get(verifyJWT, readLeadAccess, getSingleLead);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/update/lead:
 *     put:
 *       tags:
 *         - Lead Management
 *       summary: Update lead details
 *       description: Allows an admin to update the details of an existing lead, including status, content, and other relevant information.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Lead details to be updated
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the user making the update
 *                 lead_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d2"
 *                   description: The unique identifier of the lead to be updated
 *                 status:
 *                   type: string
 *                   example: "In Progress"
 *                   description: The current status of the lead
 *                 content:
 *                   type: string
 *                   example: "Followed up with the client regarding product X."
 *                   description: Detailed content or notes related to the lead update
 *                 createdBy:
 *                   type: string
 *                   example: "AdminUser"
 *                   description: The name or ID of the admin who is updating the lead
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2024-09-03"
 *                   description: The date when the update is being made
 *       responses:
 *         '200':
 *           description: Lead details updated successfully
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
 *                     example: "Lead details updated successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       lead_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d2"
 *                       status:
 *                         type: string
 *                         example: "In Progress"
 *                       content:
 *                         type: string
 *                         example: "Followed up with the client regarding product X."
 *                       createdBy:
 *                         type: string
 *                         example: "AdminUser"
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-09-03"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
 *         '404':
 *           description: Lead not found
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
 *                     example: "Lead not found"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/update/lead").put(verifyJWT, updateLeadAccess, updateFollowLead);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/create/lead/project:
 *     post:
 *       tags:
 *         - Project Management
 *       summary: Create a project from a lead
 *       description: Converts a lead into a project with all relevant details, including client information, project specifics, and budget. Allows for the upload of a contract file.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Details of the lead to be converted into a project
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 lead_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the lead being converted
 *                 client_name:
 *                   type: string
 *                   example: "Jane Doe"
 *                   description: The name of the client
 *                 client_email:
 *                   type: string
 *                   example: "jane.doe@example.com"
 *                   description: The email address of the client
 *                 client_contact:
 *                   type: string
 *                   example: "+1234567890"
 *                   description: The contact number of the client
 *                 location:
 *                   type: string
 *                   example: "New York"
 *                   description: The location of the project
 *                 description:
 *                   type: string
 *                   example: "This project involves the development of a new e-commerce platform."
 *                   description: Detailed description of the project
 *                 project_type:
 *                   type: string
 *                   example: "Development"
 *                   description: Type of the project
 *                 project_name:
 *                   type: string
 *                   example: "E-Commerce Platform"
 *                   description: Name of the project
 *                 project_status:
 *                   type: string
 *                   example: "Not Started"
 *                   description: Current status of the project
 *                 timeline_date:
 *                   type: string
 *                   format: date
 *                   example: "2024-12-31"
 *                   description: The deadline for the project
 *                 project_start_date:
 *                   type: string
 *                   format: date
 *                   example: "2024-10-01"
 *                   description: The start date of the project
 *                 project_budget:
 *                   type: number
 *                   example: 50000
 *                   description: The budget allocated for the project
 *                 designer:
 *                   type: string
 *                   example: "John Doe"
 *                   description: The name or ID of the designer assigned to the project
 *                 user_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the user creating the project
 *                 contract:
 *                   type: string
 *                   format: binary
 *                   description: The contract file associated with the project
 *       responses:
 *         '200':
 *           description: Project created successfully from the lead
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
 *                     example: "Project created successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       lead_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       client_name:
 *                         type: string
 *                         example: "Jane Doe"
 *                       client_email:
 *                         type: string
 *                         example: "jane.doe@example.com"
 *                       client_contact:
 *                         type: string
 *                         example: "+1234567890"
 *                       location:
 *                         type: string
 *                         example: "New York"
 *                       description:
 *                         type: string
 *                         example: "This project involves the development of a new e-commerce platform."
 *                       project_type:
 *                         type: string
 *                         example: "Development"
 *                       project_name:
 *                         type: string
 *                         example: "E-Commerce Platform"
 *                       project_status:
 *                         type: string
 *                         example: "Not Started"
 *                       timeline_date:
 *                         type: string
 *                         format: date
 *                         example: "2024-12-31"
 *                       project_start_date:
 *                         type: string
 *                         format: date
 *                         example: "2024-10-01"
 *                       project_budget:
 *                         type: number
 *                         example: 50000
 *                       designer:
 *                         type: string
 *                         example: "John Doe"
 *                       user_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */


router.route("/create/lead/project").post(verifyJWT, createProjectAccess, leadToProject);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/add/member/lead:
 *     post:
 *       tags:
 *         - Lead Management
 *       summary: Add a member to a lead
 *       description: Allows adding a new member to a specific lead with a defined role.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Member details to be added to the lead
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the member being added
 *                 lead_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d2"
 *                   description: The unique identifier of the lead to which the member is being added
 *                 user_name:
 *                   type: string
 *                   example: "JohnDoe"
 *                   description: The name of the user being added
 *                 role:
 *                   type: string
 *                   example: "Contributor"
 *                   description: The role assigned to the user within the lead
 *       responses:
 *         '200':
 *           description: Member added successfully to the lead
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
 *                     example: "Member added successfully to the lead"
 *                   data:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       lead_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d2"
 *                       user_name:
 *                         type: string
 *                         example: "JohnDoe"
 *                       role:
 *                         type: string
 *                         example: "Contributor"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/add/member/lead").post(verifyJWT, createAddMember, AddMemberInLead);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/update/lead/data:
 *     put:
 *       tags:
 *         - Lead Management
 *       summary: Update lead details
 *       description: Allows updating the details of a specific lead, including name, email, phone, and other relevant information.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Details of the lead to be updated
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lead_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the lead to be updated
 *                 lead_name:
 *                   type: string
 *                   example: "Acme Corp"
 *                   description: The name of the lead
 *                 email:
 *                   type: string
 *                   example: "contact@acmecorp.com"
 *                   description: The email address of the lead
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                   description: The phone number of the lead
 *                 location:
 *                   type: string
 *                   example: "New York, NY"
 *                   description: The location of the lead
 *                 source:
 *                   type: string
 *                   example: "Website"
 *                   description: The source through which the lead was acquired
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2024-09-01"
 *                   description: The date when the lead was created or last updated
 *                 lead_manager:
 *                   type: string
 *                   example: "JaneDoe"
 *                   description: The name or ID of the lead manager
 *                 user_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the user making the update
 *       responses:
 *         '200':
 *           description: Lead details updated successfully
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
 *                     example: "Lead details updated successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       lead_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       lead_name:
 *                         type: string
 *                         example: "Acme Corp"
 *                       email:
 *                         type: string
 *                         example: "contact@acmecorp.com"
 *                       phone:
 *                         type: string
 *                         example: "+1234567890"
 *                       location:
 *                         type: string
 *                         example: "New York, NY"
 *                       source:
 *                         type: string
 *                         example: "Website"
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-09-01"
 *                       lead_manager:
 *                         type: string
 *                         example: "JaneDoe"
 *                       user_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/update/lead/data").put(verifyJWT, updateLeadAccess, updateLead);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/lead/multiple/project:
 *     post:
 *       tags:
 *         - Lead Management
 *       summary: Assign a lead to multiple projects
 *       description: Allows assigning a lead to multiple projects with a specified type and user ID.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Details for assigning a lead to multiple projects
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lead_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the lead
 *                 type:
 *                   type: string
 *                   example: "New Project"
 *                   description: The type or category of the project(s) to be assigned
 *                 user_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the user making the assignment
 *       responses:
 *         '200':
 *           description: Lead assigned to multiple projects successfully
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
 *                     example: "Lead assigned to multiple projects successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       lead_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       type:
 *                         type: string
 *                         example: "New Project"
 *                       user_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/lead/multiple/project").post(verifyJWT, createProjectAccess, leadToMultipleProject);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/remove/member/lead:
 *     post:
 *       tags:
 *         - Lead Management
 *       summary: Remove a member from a lead
 *       description: Allows removing a member from a specific lead based on the provided lead ID and username.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Details for removing a member from a lead
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lead_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the lead
 *                 username:
 *                   type: string
 *                   example: "JohnDoe"
 *                   description: The username of the member to be removed from the lead
 *       responses:
 *         '200':
 *           description: Member removed from the lead successfully
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
 *                     example: "Member removed from the lead successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       lead_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       username:
 *                         type: string
 *                         example: "JohnDoe"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.route("/remove/member/lead").post(verify, deleteAddMember, removeMemberInlead);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/get/userlist/lead:
 *     get:
 *       tags:
 *         - Lead Management
 *       summary: Retrieve a list of users associated with a lead
 *       description: Fetches a list of users linked to a specific lead based on the provided lead ID.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: lead_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "64c9e9f9c125f2a9a5b5d2d1"
 *           description: The unique identifier of the lead
 *       responses:
 *         '200':
 *           description: User list retrieved successfully
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
 *                     example: "User list retrieved successfully"
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "64c9e9f9c125f2a9a5b5d2d2"
 *                         username:
 *                           type: string
 *                           example: "JaneDoe"
 *                         role:
 *                           type: string
 *                           example: "Developer"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/get/userlist/lead").get(verifyJWT, listUserInLead);
router.route("/get/timeline/lead").get(verifyJWT, getTimeline);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/delete/inactive/lead:
 *     delete:
 *       tags:
 *         - Lead Management
 *       summary: Delete an inactive lead
 *       description: Deletes a lead based on the provided lead ID if the lead is inactive.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: lead_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "723101"
 *           description: The unique identifier of the lead to be deleted.
 *       responses:
 *         '200':
 *           description: Lead deleted successfully
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
 *                     example: "Lead deleted successfully."
 *         '400':
 *           description: Bad request, possibly due to missing lead_id
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
 *                     example: "lead_id is required."
 *         '403':
 *           description: Forbidden, user not found or insufficient permissions
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
 *                     example: "User not found."
 *         '404':
 *           description: Lead not found
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
 *                     example: "Lead not found."
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
 *                     example: "Something went wrong."
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/delete/inactive/lead").delete(verifyJWT, deleteLeadAccess, deleteInvativeLead);


/**
 * @swagger
 * paths:
 *   /v1/api/admin/create/mom:
 *     post:
 *       tags:
 *         - MOM Management
 *       summary: Create a new Minutes of Meeting (MoM)
 *       description: Allows the creation of a new Minutes of Meeting (MoM) with details including meeting date, location, and attendees.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Details of the MoM to be created
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the user creating the MoM
 *                 project_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d2"
 *                   description: The unique identifier of the project related to the MoM
 *                 meetingDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-09-15"
 *                   description: The date of the meeting
 *                 location:
 *                   type: string
 *                   example: "Conference Room A"
 *                   description: The location where the meeting took place
 *                 client_name:
 *                   type: string
 *                   example: "Acme Corp."
 *                   description: The name of the client involved in the meeting
 *                 organisor:
 *                   type: string
 *                   example: "Jane Smith"
 *                   description: The name of the person organizing the meeting
 *                 attendees:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["John Doe", "Emily Davis"]
 *                   description: A list of attendees at the meeting
 *                 remark:
 *                   type: string
 *                   example: "Discussed project milestones and next steps."
 *                   description: Additional remarks or notes from the meeting
 *       responses:
 *         '200':
 *           description: MoM created successfully
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
 *                     example: "MoM created successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       project_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d2"
 *                       meetingDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-09-15"
 *                       location:
 *                         type: string
 *                         example: "Conference Room A"
 *                       client_name:
 *                         type: string
 *                         example: "Acme Corp."
 *                       organisor:
 *                         type: string
 *                         example: "Jane Smith"
 *                       attendees:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["John Doe", "Emily Davis"]
 *                       remark:
 *                         type: string
 *                         example: "Discussed project milestones and next steps."
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.route("/create/mom").post(verifyJWT, createMomAccess, createmom);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/getall/mom:
 *     get:
 *       tags:
 *         - MOM Management
 *       summary: Retrieve all Minutes of Meeting (MoM) entries
 *       description: Fetches a list of all MoM entries, optionally filtered by project_id.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: project_id
 *           required: false
 *           schema:
 *             type: string
 *             example: "64c9e9f9c125f2a9a5b5d2d2"
 *           description: The unique identifier of the project to filter MoM entries
 *       responses:
 *         '200':
 *           description: Successfully retrieved list of MoM entries
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
 *                     example: "MoM entries retrieved successfully"
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           example: "64c9e9f9c125f2a9a5b5d2d1"
 *                         project_id:
 *                           type: string
 *                           example: "64c9e9f9c125f2a9a5b5d2d2"
 *                         meetingDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-09-15"
 *                         location:
 *                           type: string
 *                           example: "Conference Room A"
 *                         client_name:
 *                           type: string
 *                           example: "Acme Corp."
 *                         organisor:
 *                           type: string
 *                           example: "Jane Smith"
 *                         attendees:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["John Doe", "Emily Davis"]
 *                         remark:
 *                           type: string
 *                           example: "Discussed project milestones and next steps."
 *         '400':
 *           description: Bad request, possibly due to invalid query parameters
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
 *                     example: "Invalid query parameters"
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/getall/mom").get(verifyJWT, readMomAccess, getAllMom);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/getsingle/mom:
 *     get:
 *       tags:
 *         - MOM Management
 *       summary: Retrieve a single Minute of Meeting (MoM) entry
 *       description: Fetches details of a specific MoM entry based on the provided `project_id` and `mom_id`.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: project_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "64c9e9f9c125f2a9a5b5d2d2"
 *           description: The unique identifier of the project to which the MoM entry belongs
 *         - in: query
 *           name: mom_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "64c9e9f9c125f2a9a5b5d2d3"
 *           description: The unique identifier of the MoM entry to retrieve
 *       responses:
 *         '200':
 *           description: Successfully retrieved the MoM entry
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
 *                     example: "MoM entry retrieved successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       project_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d2"
 *                       meetingDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-09-15"
 *                       location:
 *                         type: string
 *                         example: "Conference Room A"
 *                       client_name:
 *                         type: string
 *                         example: "Acme Corp."
 *                       organisor:
 *                         type: string
 *                         example: "Jane Smith"
 *                       attendees:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["John Doe", "Emily Davis"]
 *                       remark:
 *                         type: string
 *                         example: "Discussed project milestones and next steps."
 *         '400':
 *           description: Bad request, possibly due to missing or invalid query parameters
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
 *                     example: "Invalid query parameters"
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/getsingle/mom").get(verifyJWT, readMomAccess, getSingleMom);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/getall/project/mom:
 *     get:
 *       tags:
 *         - MOM Management
 *       summary: Retrieve all MoM entries for a project
 *       description: Fetches all Minute of Meeting (MoM) entries associated with a specific project, accessible only by authorized users with admin privileges in the project.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: project_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "64c9e9f9c125f2a9a5b5d2d2"
 *           description: The unique identifier of the project for which MoM entries are to be retrieved
 *       responses:
 *         '200':
 *           description: Successfully retrieved MoM entries for the project
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
 *                     example: "MoM entries retrieved successfully"
 *                   data:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         user_id:
 *                           type: string
 *                           example: "64c9e9f9c125f2a9a5b5d2d1"
 *                         project_id:
 *                           type: string
 *                           example: "64c9e9f9c125f2a9a5b5d2d2"
 *                         meetingDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-09-15"
 *                         location:
 *                           type: string
 *                           example: "Conference Room A"
 *                         client_name:
 *                           type: string
 *                           example: "Acme Corp."
 *                         organisor:
 *                           type: string
 *                           example: "Jane Smith"
 *                         attendees:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["John Doe", "Emily Davis"]
 *                         remark:
 *                           type: string
 *                           example: "Discussed project milestones and next steps."
 *         '400':
 *           description: Bad request, possibly due to missing or invalid query parameters
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
 *                     example: "Invalid query parameters"
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/getall/project/mom").get(verifyJWT, readMomAccess, checkAvailableUserIsAdminInMom, getAllProjectMom);

/**
 * @swagger
 * paths:
 *   /v1/api/admin/update/mom:
 *     put:
 *       tags:
 *         - MOM Management
 *       summary: Update a MoM entry
 *       description: Allows updating a Minute of Meeting (MoM) entry with new information such as the description/remark.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: project_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "64c9e9f9c125f2a9a5b5d2d2"
 *           description: The unique identifier of the project to which the MoM belongs
 *         - in: query
 *           name: mom_id
 *           required: true
 *           schema:
 *             type: string
 *             example: "64c9e9f9c125f2a9a5b5d2d3"
 *           description: The unique identifier of the MoM entry to be updated
 *       requestBody:
 *         description: Updated MoM information
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 remark:
 *                   type: string
 *                   example: "Updated MoM with new details."
 *                   description: The updated description or remark for the MoM entry
 *                 meetingdate:
 *                   type: string
 *                   format: date
 *                   example: "2024-09-17"
 *                   description: The date of the meeting
 *                 location:
 *                   type: string
 *                   example: "Conference Room A"
 *                   description: The location where the meeting took place
 *                 client_name:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Acme Corp", "Beta LLC"]
 *                   description: The names of the clients
 *                 organisor:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["John Doe", "Jane Smith"]
 *                   description: The names of the people organizing the meeting
 *                 attendees:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Jane Smith", "Robert Brown"]
 *                   description: List of attendees at the meeting
 *       responses:
 *         '200':
 *           description: MoM entry updated successfully
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
 *                     example: "MoM entry updated successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       project_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d2"
 *                       mom_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d3"
 *                       remark:
 *                         type: string
 *                         example: "Updated MoM with new details."
 *                       meetingdate:
 *                         type: string
 *                         format: date
 *                         example: "2024-09-17"
 *                       location:
 *                         type: string
 *                         example: "Conference Room A"
 *                       client_name:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Acme Corp", "Beta LLC"]
 *                       organisor:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["John Doe", "Jane Smith"]
 *                       attendees:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Jane Smith", "Robert Brown"]
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */


router.route("/update/mom").put(verifyJWT, updateMomAccess, updateMom);
/**
 * @swagger
 * paths:
 *   /v1/api/admin/delete/mom:
 *     delete:
 *       tags:
 *         - MOM Management
 *       summary: Delete a MoM entry
 *       description: Deletes a Minute of Meeting (MoM) entry based on the provided project ID and MoM ID.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Identifiers for the MoM entry to be deleted
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d2"
 *                   description: The unique identifier of the project to which the MoM belongs
 *                 mom_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d3"
 *                   description: The unique identifier of the MoM entry to be deleted
 *       responses:
 *         '200':
 *           description: MoM entry deleted successfully
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
 *                     example: "MoM entry deleted successfully"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/delete/mom").delete(verifyJWT, deleteMomAccess, deleteMom);




/**
 * @swagger
 * paths:
 *   /v1/api/admin/share/quotation:
 *     post:
 *       tags:
 *         - Quotation Management
 *       summary: Share a quotation
 *       description: Allows sharing a quotation with specific details such as user, file, and client information.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Quotation details to be shared
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d1"
 *                   description: The unique identifier of the user sharing the quotation
 *                 user_name:
 *                   type: string
 *                   example: "JohnDoe"
 *                   description: The name of the user sharing the quotation
 *                 file_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d2"
 *                   description: The unique identifier of the file being shared
 *                 folder_name:
 *                   type: string
 *                   example: "Quotations"
 *                   description: The name of the folder containing the quotation file
 *                 project_id:
 *                   type: string
 *                   example: "64c9e9f9c125f2a9a5b5d2d3"
 *                   description: The unique identifier of the project associated with the quotation
 *                 client_email:
 *                   type: string
 *                   example: "client@example.com"
 *                   description: The email address of the client receiving the quotation
 *                 client_name:
 *                   type: string
 *                   example: "Jane Smith"
 *                   description: The name of the client receiving the quotation
 *                 type:
 *                   type: string
 *                   example: "New Business"
 *                   description: The type or category of the quotation
 *       responses:
 *         '200':
 *           description: Quotation shared successfully
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
 *                     example: "Quotation shared successfully"
 *                   data:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d1"
 *                       user_name:
 *                         type: string
 *                         example: "JohnDoe"
 *                       file_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d2"
 *                       folder_name:
 *                         type: string
 *                         example: "Quotations"
 *                       project_id:
 *                         type: string
 *                         example: "64c9e9f9c125f2a9a5b5d2d3"
 *                       client_email:
 *                         type: string
 *                         example: "client@example.com"
 *                       client_name:
 *                         type: string
 *                         example: "Jane Smith"
 *                       type:
 *                         type: string
 *                         example: "New Business"
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
 *         '401':
 *           description: Unauthorized access due to missing or invalid JWT
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
 *         '403':
 *           description: Forbidden access due to insufficient permissions
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
 *                     example: "Forbidden"
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
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.route("/share/quotation").post(verifyJWT, readQuotationAccess, shareQuotation);
router.route("/get/quotationdata").get(verifyJWT, readQuotationAccess, getQuotationData);
router.route("/quotation/approval").post(verifyJWT, updateQuotationAccess, updateStatusAdmin);




router.route("/get/notification").get(verifyJWT, checkAvailableUserIsAdmin, getNotification);
router.route("/update/notification").put(verifyJWT, updateNotification);


router.route("/get/archive").get(verifyJWT, readArchiveAccess, archive);
router.route("/delete/archive").delete(verifyJWT, deleteArchiveAccess, deletearchive);
router.route("/restore/file").post(verifyJWT, restoreArchiveAccess, restoreData);

//project task
router.route("/create/task").post(verifyJWT, createTaskAccess, createTask);
router.route("/get/all/task").get(verifyJWT, readTaskAccess, getAllTasks);
router.route("/get/single/task").get(verifyJWT, readTaskAccess, getSingleTask);
router.route("/update/task").put(verifyJWT, updateTaskAccess, updateTask);
router.route("/delete/task").delete(verifyJWT, deleteTskAccess, deleteTask);
router.route("/gettask/details").get(verifyJWT, readProjectAccess, getAllTaskWithData);
router.route("/update/task/time").put(verifyJWT, UpdateTasktimerController);
router.route("/get/task/time").get(verifyJWT, GetSingleTasktimerController);

router.route("/create/subtask").post(verifyJWT, createSubTask);
router.route("/get/all/subtask").get(verifyJWT, getAllSubTask);
router.route("/get/single/subtask").get(verifyJWT, getSingleSubTask);
router.route("/update/subtask").put(verifyJWT, updateSubTask);
router.route("/delete/subtask").delete(verifyJWT, deleteSubTask);
router.route("/update/subtask/time").put(verifyJWT, UpdateSubtimerController);
router.route("/get/subtask/time").get(verifyJWT, GetSingleSubtimerController);

router.route("/create/minitask").post(verifyJWT, createMiniTask);
router.route("/get/all/minitask").get(verifyJWT, getAllMiniTask);
router.route("/get/single/minitask").get(verifyJWT, getSingleMiniTask);
router.route("/update/minitask").put(verifyJWT, updateMiniTask);
router.route("/delete/minitask").delete(verifyJWT, deleteMiniTask);
router.route("/update/minitask/time").put(verifyJWT, UpdateMinitimerController);
router.route("/get/minitask/time").get(verifyJWT, GetSingleMinitimerController);


//lead task
router.route("/create/leadtask").post(verifyJWT, createLeadTaskAccess, createLeadTask);
router.route("/get/all/leadtask").get(verifyJWT, readLeadTaskAccess, getAllLeadTasks);
router.route("/get/single/leadtask").get(verifyJWT, readLeadTaskAccess, getSingleLeadTask);
router.route("/update/leadtask").put(verifyJWT, updateLeadTaskAccess, updateLeadTask);
router.route("/delete/leadtask").delete(verifyJWT, deleteLeadTskAccess, deleteLeadTask);
router.route("/getleadtask/details").get(verifyJWT, readLeadAccess, getAllLeadTaskWithData);
router.route("/update/leadtask/time").put(verifyJWT, UpdateLeadTasktimerController);
router.route("/get/leadtask/time").get(verifyJWT, GetSingleLeadTasktimerController);


router.route("/create/leadsubtask").post(verifyJWT, createLeadSubTask);
router.route("/get/all/leadsubtask").get(verifyJWT, getAllLeadSubTask);
router.route("/get/single/leadsubtask").get(verifyJWT, getSingleLeadSubTask);
router.route("/update/leadsubtask").put(verifyJWT, updateLeadSubTask);
router.route("/delete/leadsubtask").delete(verifyJWT, deleteLeadSubTask);
router.route("/update/leadsubtask/time").put(verifyJWT, UpdateLeadSubtimerController);
router.route("/get/leadsubtask/time").get(verifyJWT, GetSingleLeadSubtimerController);


router.route("/create/leadminitask").post(verifyJWT, createLeadMiniTask);
router.route("/get/all/leadminitask").get(verifyJWT, getAllLeadMiniTask);
router.route("/get/single/leadminitask").get(verifyJWT, getSingleLeadMiniTask);
router.route("/update/leadminitask").put(verifyJWT, updateLeadMiniTask);
router.route("/delete/leadminitask").delete(verifyJWT, deleteLeadMiniTask);
router.route("/update/leadminitask/time").put(verifyJWT, UpdateLeadMinitimerController);
router.route("/get/leadminitask/time").get(verifyJWT, GetSingleLeadMinitimerController);


//open task
router.route("/get/alltask/details").get(verifyJWT, checkOpenTaskReadAccess, Alltask);
router.route("/create/opentask").post(verifyJWT, createOpenTaskAccess, createOpenTask);
router.route("/get/single/opentask").get(verifyJWT, readOpenTaskAccess, getSingleOpenTask);
router.route("/update/opentask").put(verifyJWT, updateOpenTaskAccess, updateOpenTask);
router.route("/delete/opentask").delete(verifyJWT, deleteOpenTskAccess, deleteOpenTask);
router.route("/move/task").post(verifyJWT, moveOpenTaskAccess, MoveTask);
router.route("/update/opentask/time").put(verifyJWT, UpdateOpenTasktimerController);
router.route("/get/opentask/time").get(verifyJWT, GetSingleOpenTasktimerController);


router.route("/create/opensubtask").post(verifyJWT, createOpenSubTask);
router.route("/get/all/opensubtask").get(verifyJWT, getAllOpenSubTask);
router.route("/get/single/opensubtask").get(verifyJWT, getSingleOpenSubTask);
router.route("/update/opensubtask").put(verifyJWT, updateOpenSubTask);
router.route("/delete/opensubtask").delete(verifyJWT, deleteOpenSubTask);
router.route("/update/opensubtask/time").put(verifyJWT, UpdateOpenSubtimerController);
router.route("/get/opensubtask/time").get(verifyJWT, GetSingleOpenSubtimerController);




router.route("/create/role").post(verifyJWT, CreateRoleAccess, createRole);
router.route("/get/role").get(verifyJWT, GetRole, getRole);
router.route("/update/role").put(verifyJWT, updateRole, UpdateRole);
router.route("/delete/role").delete(verifyJWT, deleteRole, DeleteRole);
router.route("/rolewise/access").get(verifyJWT, roleWiseAccess);
router.route("/get/rolename").get(verifyJWT, roleName);


router.route("/create/threeimage").post(createImage);
router.route("/delete/mainimage").delete(deleteMainImage);
router.route("/get/threeimage").get(getImageById);
router.route("/get/all/mainthreeimage").get(getAllMainImage);
router.route("/get/all/panoimages").get(getAllPanoImagesFromFileManager);

router.route("/create/project/execution/task").post(verifyJWT, projectExecutionTask); 
router.route("/get/project/execution/tasks").get(verifyJWT, getProjectExecutionTask); 
router.route("/update/project/execution/task").put(verifyJWT, updateProjectExecutionTask); 
router.route("/delete/project/execution/task").delete(verifyJWT, deleteProjectExecutionTask); 
router.route("/delete/project/execution/task/details").delete(verifyJWT, deleteProjectExecutionTaskDetails);  
router.route("/update/project/execution/task/details").put(verifyJWT, updateProjectExecutionTaskDetails); 
router.route("/project/execution/download").post(downloadExecutionChart); 


router.route("/create/project/execution/subtask").post(verifyJWT, createProjectExecutionSubtask); 
router.route("/update/project/execution/subtask").put(verifyJWT, updateProjectExecutionSubtask); 
router.route("/delete/project/execution/subtask").delete(verifyJWT, deleteProjectExecutionSubtask); 
router.route("/delete/project/execution/subtask/details").delete(verifyJWT, deleteProjectExecutionSubtaskDetails); 
router.route("/update/project/execution/subtask/details").put(verifyJWT, updateProjectExecutionSubtaskDetails); 
router.route("/get/project/execution/subtask/affections").get(verifyJWT, getProjectExecutionSubtaskAffections); 














export default router;

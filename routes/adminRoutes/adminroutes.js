import { Router } from "express";
const router = Router();

import fileupload from "../../controllers/adminControllers/fileUploadController/fileuploadController.js";

import { getCompanyData, getFileData, getleadData, getprojectData } from "../../controllers/adminControllers/fileUploadController/getFileController.js";
import getSingleFileData from "../../controllers/adminControllers/fileUploadController/getSingleFileController.js";

import {
  createmom,
  getAllMom,
  getAllProjectMom,
  getSingleMom,
  sendPdf,
} from "../../controllers/adminControllers/momControllers/mom.controller.js";
import {
  createLead,
  getAllLead,
  getSingleLead,
  leadToMultipleProject,
  leadToProject,
  updateFollowLead,
  updateLead,
} from "../../controllers/adminControllers/leadController/lead.controller.js";
import {
  getAllProject,
  getSingleProject,
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
import { createUser, deleteUser, getUser } from "../../controllers/adminControllers/createuser.controllers/createuser.controller.js";
import { addMember } from "../../controllers/adminControllers/projectController/addmember.project.controller.js";
import { checkAvailableUserIsAdmin, isAdmin } from "../../middlewares/auth.middlewares.js";


import { verifyJWT } from "../../middlewares/auth.middlewares.js";
import { contractStatus, getContractData, shareContract } from "../../controllers/adminControllers/fileUploadController/contract.share.controller.js";
import { AddMemberInLead } from "../../controllers/adminControllers/leadController/addmemberinlead.controller.js";
import { archive, deletearchive, restoreData } from "../../controllers/adminControllers/archiveControllers/archive.controller.js";
import { createTask, deleteTask, getAllTaskWithData, getAllTasks, getSingleTask, updateTask } from "../../controllers/adminControllers/taskControllers/task.controller.js";
import { createSubTask, deleteSubTask, getAllSubTask, getSingleSubTask, updateSubTask } from "../../controllers/adminControllers/taskControllers/subtask.controller.js";
import { GetSingleSubtimerController, UpdateSubtimerController } from "../../controllers/adminControllers/timerControllers/timer.controller.js";
import { getUserList } from "../../controllers/adminControllers/createuser.controllers/getuser.controller.js";
import { createAddMember, createLeadAccess, createMomAccess, createProjectAccess, createQuotationAccess, CreateRoleAccess, createTaskAccess,  CreateUserAccess, deleteArchiveAccess, deletedFileAccess, deleteRole, deleteTskAccess, GetRole, GetUser, readArchiveAccess, readContractAccess, readFileAccess, readFileCompanyDataAccess, readLeadAccess, readMomAccess, readProjectAccess, readQuotationAccess, readTaskAccess, restoreArchiveAccess, updateLeadAccess, updateProjectAccess, updateRole, updateTaskAccess } from "../../middlewares/access.middlewares.js";
import { createRole, DeleteRole, getRole, roleName, roleWiseAccess, UpdateRole } from "../../controllers/adminControllers/createRoleControllers/role.controllers.js";

// router.use(checkAvailableUserIsAdmin)


router.route("/create/user").post(verifyJWT, CreateUserAccess, createUser);
router.route("/add/member").post(verifyJWT,createAddMember, addMember);
router.route("/get/alluser").get(verifyJWT, GetUser, getUser);
router.route("/delete/user").delete(verifyJWT,  deleteUser, deleteUser);
router.route("/get/userlist").get(verifyJWT, getUserList);


router.route("/fileupload").post(verifyJWT, fileupload);
router.route("/getfile").get(verifyJWT, readFileAccess, checkAvailableUserIsAdmin,  getFileData);
router.route("/get/onefile").get(verifyJWT, readFileAccess, getSingleFileData);
router.route("/lead/getfile").get(verifyJWT,readLeadAccess, getleadData);
router.route("/project/getfile").get(verifyJWT,readProjectAccess, getprojectData);
router.route("/project/fileupload").post(verifyJWT, projectFileUpload);
router.route("/view/contract").post(verifyJWT,readContractAccess, contractShare);
router.route("/share/file").post(verifyJWT, shareFile);
router.route("/template/fileupload").post(verifyJWT, templateFileUpload);
router.route("/template/single/file").get(verifyJWT,readFileCompanyDataAccess, getSingleTemplateFile);
router.route("/delete/file").delete(verifyJWT,deletedFileAccess, deleteFile);
router.route("/share/contract").post(verifyJWT,readContractAccess, shareContract);
router.route("/contract/approval").post(verifyJWT,readContractAccess, contractStatus);
router.route("/get/contractdata").get(verifyJWT,readContractAccess, getContractData);
router.route("/delete/folder").delete(verifyJWT,deletedFileAccess, deleteFolder);
router.route("/get/companyData").get(verifyJWT,readFileCompanyDataAccess, getCompanyData);




router.route("/getall/project").get(verifyJWT, readProjectAccess, checkAvailableUserIsAdmin,  getAllProject);
router.route("/getsingle/project").get(verifyJWT,readProjectAccess, getSingleProject);
router.route("/update/project").put(verifyJWT,updateProjectAccess, updateProjectDetails);

router.route("/create/lead").post(verifyJWT,createLeadAccess, createLead);
router.route("/getall/lead").get(verifyJWT, readLeadAccess, checkAvailableUserIsAdmin,  getAllLead);
router.route("/getsingle/lead").get(verifyJWT, readLeadAccess, getSingleLead);
router.route("/update/lead").put(verifyJWT, updateLeadAccess, updateFollowLead);
router.route("/create/lead/project").post(verifyJWT, createProjectAccess, leadToProject);
router.route("/add/member/lead").post(verifyJWT,createAddMember, AddMemberInLead);
router.route("/update/lead/data").put(verifyJWT,updateLeadAccess, updateLead);
router.route("/lead/multiple/project").post(verifyJWT, createProjectAccess, leadToMultipleProject);

router.route("/create/mom").post(verifyJWT,createMomAccess, createmom);
router.route("/getall/mom").get(verifyJWT,readMomAccess, getAllMom);
router.route("/getsingle/mom").get(verifyJWT,readMomAccess, getSingleMom);
router.route("/getall/project/mom").get(verifyJWT, readMomAccess, checkAvailableUserIsAdmin, getAllProjectMom);
router.route("/send/momdata").post(verifyJWT, sendPdf);


router.route("/share/quotation").post(verifyJWT, createQuotationAccess, shareQuotation);
router.route("/get/quotationdata").get(verifyJWT, readQuotationAccess, getQuotationData);
router.route("/quotation/approval").post(verifyJWT, isAdmin, updateStatusAdmin);




router.route("/get/notification").get(verifyJWT, checkAvailableUserIsAdmin, getNotification);
router.route("/update/notification").put(verifyJWT, updateNotification);


router.route("/get/archive").get(verifyJWT, readArchiveAccess, archive);
router.route("/delete/archive").delete(verifyJWT, deleteArchiveAccess, deletearchive);
router.route("/restore/file").post(verifyJWT, restoreArchiveAccess, restoreData);


router.route("/create/task").post(verifyJWT,createTaskAccess, createTask);
router.route("/get/all/task").get(verifyJWT,readTaskAccess, getAllTasks);
router.route("/get/single/task").get(verifyJWT,readTaskAccess, getSingleTask);
router.route("/update/task").put(verifyJWT,updateTaskAccess, updateTask);
router.route("/delete/task").delete(verifyJWT,deleteTskAccess, deleteTask);
router.route("/gettask/details").get(verifyJWT,readProjectAccess, getAllTaskWithData);


router.route("/create/subtask").post(verifyJWT, createSubTask);
router.route("/get/all/subtask").get(verifyJWT, getAllSubTask);
router.route("/get/single/subtask").get(verifyJWT, getSingleSubTask);
router.route("/update/subtask").put(verifyJWT, updateSubTask);
router.route("/delete/subtask").delete(verifyJWT, deleteSubTask);
router.route("/update/subtask/time").put(verifyJWT, UpdateSubtimerController);
router.route("/get/subtask/time").get(verifyJWT, GetSingleSubtimerController);



router.route("/create/role").post(verifyJWT, CreateRoleAccess, createRole);
router.route("/get/role").get(verifyJWT,GetRole, getRole );
router.route("/update/role").put(verifyJWT, updateRole,UpdateRole );
router.route("/delete/role").delete(verifyJWT, deleteRole, DeleteRole);
router.route("/rolewise/access").get(verifyJWT, roleWiseAccess);
router.route("/get/rolename").get(verifyJWT, roleName);







export default router;

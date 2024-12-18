
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import { responseData } from "../../../utils/respounse.js";
import { onlyEmailValidation } from "../../../utils/validation.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { infotransporter } from "../../../utils/function.js";
import orgModel from "../../../models/orgmodels/org.model.js";

function validateEmailArray(emailArray) {
    for (let i = 0; i < emailArray.length; i++) {
        if (!onlyEmailValidation(emailArray[i])) {
            return false;
        }
    }
    return true;
}



export const shareFile = async (req, res) => {
    try {
        const fileId = req.body.file_id;
        const leadId = req.body.lead_id;
        const projectId = req.body.project_id;
        const folderId = req.body.folder_id;
        const email = req.body.email;
        const subject = req.body.subject;
        const cc = req.body.cc;
        const bcc = req.body.bcc;
        const body = req.body.body;
        const type = req.body.type;
        const user_id = req.body.user_id;
        const org_id = req.body.org_id;


        const isValid = validateEmailArray(email);

        // Validate required parameters
        if (!fileId) {
            return responseData(res, "", 400, false, "File ID is required", null);
        } else if (!isValid) {
            return responseData(res, "", 400, false, "Invalid email address", null);
        }else if(!org_id)
        {
            return responseData(res, "", 400, false, "Org ID is required", null);
        }
         else {
            let findfiles;
            let attachments = [];
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                responseData(res, "", 404, false, "Org not found!", []);
            }
            const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
            if (!check_user) {
                return responseData(res, "", 404, false, "User not found", null);
            }

            if (type === 'template') {
                findfiles = await fileuploadModel.findOne({
                    "files.folder_id": folderId,
                    org_id: org_id
                });
                for (let i = 0; i < findfiles.files.length; i++) {
                    for (let j = 0; j < findfiles.files[i].files.length; j++) {
                        if (fileId.includes(findfiles.files[i].files[j].fileId)) {
                            attachments.push({ path: findfiles.files[i].files[j].fileUrl });
                        }
                    }
                }
            } else {
                findfiles = await fileuploadModel.findOne({
                    org_id: org_id,
                    $or: [
                        { project_id: projectId },
                        { lead_id: leadId },
                    ]
                });
                if (findfiles && findfiles.files) {
                    for (let i = 0; i < findfiles.files.length; i++) {
                        if (findfiles.files[i].files) {
                            for (let j = 0; j < findfiles.files[i].files.length; j++) {
                                if (fileId.includes(findfiles.files[i].files[j].fileId)) {
                                    attachments.push({ path: findfiles.files[i].files[j].fileUrl });
                                }
                            }
                        }
                    }
                }
            }


            if (!findfiles) {
                return responseData(res, "", 404, false, "Data Not Found", null);
            }

            const mailOptions = {
                from:process.env.INFO_USER_EMAIL,
                to:email, 
                cc: cc,
                bcc: bcc,
                subject: subject,
                html: body,
                attachments: attachments,
                replyTo: "info@colonelz.com" 
            };
            infotransporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    responseData(res, "", 400, false, "Failed to send email");
                } else {

                    responseData(
                        res,
                        `Email has been sent successfully`,
                        200,
                        true,
                        ""
                    );
                }
            });
        }
    } catch (err) {
        console.log(err)
        responseData(res, "", 500, false, "Internal Server Error", err);
    }
};


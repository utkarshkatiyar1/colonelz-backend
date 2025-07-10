import { responseData } from "../../../utils/respounse.js";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import registerModel from "../../../models/usersModels/register.model.js";
import leadModel from "../../../models/adminModels/leadModel.js";
import { onlyAlphabetsValidation, onlyEmailValidation } from "../../../utils/validation.js";
import { admintransporter, infotransporter, s3 } from "../../../utils/function.js"
import orgModel from "../../../models/orgmodels/org.model.js";
import Approval from "../../../models/adminModels/approval.model.js";
import { createOrUpdateTimeline } from "../../../utils/timeline.utils.js";




function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}


const storeOrUpdateContract = async (res, existingContractData, userId, userEmail, check_lead, leadUpdate, checkUser, isFirst = false) => {
    try {

        const username = checkUser.username.trim().split(" ")
        const mailOptions = {
            from: process.env.INFO_USER_EMAIL,
            to: userEmail,
            subject: "Contract Approval",
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Contract Approval</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background: #007bff;
                        color: #ffffff;
                        text-align: center;
                        padding: 15px;
                        border-radius: 8px 8px 0 0;
                        font-size: 20px;
                        font-weight: bold;
                    }
                    .content {
                        padding: 20px;
                        font-size: 16px;
                        color: #333333;
                    }
                    .content p {
                        margin: 10px 0;
                    }
                    .footer {
                        margin-top: 20px;
                        text-align: center;
                        font-size: 14px;
                        color: #777777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">Contract Approval</div>
                    <div class="content">
                        <p>Hello <strong>${username[0]}</strong>,</p>
        
                        <p>A contract has been sent to you for approval. Please see the details below:</p>
        
                        <p><strong>Lead Name:</strong> ${check_lead.name}</p>
                        <p><strong>Lead ID:</strong> ${check_lead.lead_id}</p>
                        <p><strong>Contract File Name:</strong> ${existingContractData.contractData.file_name}</p>
        
                        <p>Thank you,</p>
                        <p><strong>COLONELZ</strong></p>
                    </div>
                    <div class="footer">
                        &copy; 2025 COLONELZ. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            `,
        };


        if (isFirst) {
            // Find the approval document that matches lead_id
            const approval = await Approval.findOne({ lead_id: existingContractData.lead_id, org_id: existingContractData.org_id });

            if (!approval) {
                return responseData(res, "", 400, false, "Approval document not found", []);
            }


            // Find the file inside the files array that matches file_id
            const file = approval.files.find(f => f.file_id === existingContractData.contractData.itemId);

            if (!file) {
                return responseData(res, "", 400, false, "File not found in approval document", []);
            }

            const updatedLead = await leadModel.findOneAndUpdate(
                { lead_id: existingContractData.lead_id, org_id: existingContractData.org_id },
                {
                    $push: { "contract": existingContractData.contractData }
                },
                { new: true } // Return the updated document
            );

            // Add user_id to the file's users list if not already present
            if (!file.users.includes(userId)) {
                file.users.push(userId);
            }

            // Save the updated approval document
            await approval.save();



            await createOrUpdateTimeline(existingContractData.lead_id, "", existingContractData.org_id, leadUpdate, {}, res);

            infotransporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.log(error);
                    responseData(res, "", 400, false, "Failed to send email for approval");
                }
                else {
                    responseData(
                        res,
                        "Contract shared and Email for approval has been send",
                        200,
                        true,
                        ""
                    );
                }
            });

            return responseData(res, `Contract shared successfully`, 200, true, "");
        } else {
            // Find the approval document that matches lead_id
            const approval = await Approval.findOne({ lead_id: existingContractData.lead_id, org_id: existingContractData.org_id });


            if (!approval) {
                return responseData(res, "", 400, false, "Approval document not found", []);
            }

            // Find the file inside the files array that matches file_id
            const file = approval.files.find(f => f.file_id === existingContractData.contractData.itemId);

            if (!file) {
                return responseData(res, "", 400, false, "File not found in approval document", []);
            }

            // Find and update the specific contract in the array
            const updatedLead = await leadModel.findOneAndUpdate(
                {
                    lead_id: existingContractData.lead_id,
                    org_id: existingContractData.org_id,
                    "contract.itemId": existingContractData.contractData.itemId
                },
                {
                    $set: {
                        "contract.$.admin_status": "pending"
                    }
                },
                { new: true } // Return the updated document
            );

            if (updatedLead) {
                if (!file.users.includes(userId)) {
                    file.users.push(userId);
                }

                // Update the status to pending
                file.status = "pending";

                // Save the updated approval document

                await approval.save();



                await createOrUpdateTimeline(existingContractData.lead_id, "", existingContractData.org_id, leadUpdate, {}, res);

                infotransporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log(error);
                        responseData(res, "", 400, false, "Failed to send email for approval");
                    }
                    else {
                        responseData(
                            res,
                            "Contract shared and Email for approval has been send",
                            200,
                            true,
                            ""
                        );
                    }
                });
                return responseData(res, `Contract updated successfully`, 200, true, "");
            } else {
                // If no contract found, create a new one
                const newContract = await leadModel.findOneAndUpdate(
                    { lead_id: existingContractData.lead_id, org_id: existingContractData.org_id },
                    {
                        $push: { "contract": existingContractData.contractData }
                    },
                    { new: true } // Return the updated document
                );

                if (!file.users.includes(userId)) {
                    file.users.push(userId);
                }

                // Save the updated approval document
                await approval.save();

                await createOrUpdateTimeline(existingContractData.lead_id, "", existingContractData.org_id, leadUpdate, {}, res);

                infotransporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log(error);
                        responseData(res, "", 400, false, "Failed to send email for approval");
                    }
                    else {
                        responseData(
                            res,
                            "Contract shared and Email for approval has been send",
                            200,
                            true,
                            ""
                        );
                    }
                });
                return responseData(res, `Contract shared successfully`, 200, true, "");
            }
        }
    } catch (err) {
        return responseData(res, "", 403, false, "Error occurred while storing contract");
    }
};


const uploadImage = async (req, file, lead_id, org_id, fileName) => {

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let newFileName = `${String(fileName)}_${timestamp}`;

    if (typeof newFileName !== 'string') {
        newFileName = String(newFileName);
    }
    // console.log(file)
    const data = await s3
        .upload({
            Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Quotation`,
            Key: newFileName,
            Body: file.data,
            ContentType: file.mimetype,

        })
        .promise();

    const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Quotation`,
        Key: newFileName,
        Expires: 157680000 // URL expires in 5 year
    });
    return { status: true, data, signedUrl };

};

const saveFileUploadData = async (
    res,
    existingFileUploadData,

) => {
    try {


        // Use update query to push data
        const updateResult = await fileuploadModel.updateOne(
            {
                lead_id: existingFileUploadData.lead_id,
                org_id: existingFileUploadData.org_id,
                "files.folder_name": existingFileUploadData.folder_name,
            },
            {
                $set: {
                    "files.$.updated_date": existingFileUploadData.updated_Date,
                },
                $push: {

                    "files.$.files": { $each: existingFileUploadData.files },
                },
            },
            {
                arrayFilters: [
                    { "folder.folder_name": existingFileUploadData.folder_name },
                ],
            }
        );

        if (updateResult.modifiedCount === 1) {
            console.log("File Upload Data Updated Successfully");
        } else {
            // If the folder does not exist, create a new folder object
            const updateNewFolderResult = await fileuploadModel.updateOne(
                { lead_id: existingFileUploadData.lead_id, org_id: existingFileUploadData.org_id, },
                {
                    $push: {
                        files: {
                            folder_name: existingFileUploadData.folder_name,
                            updated_date: existingFileUploadData.updated_date,
                            files: existingFileUploadData.files,
                        },
                    },
                }
            );

            if (updateNewFolderResult.modifiedCount === 1) {
                console.log("New Folder Created and File Upload Data Updated Successfully");
            } else {
                console.log("Lead not found or file data already updated");
                responseData(
                    res,
                    "",
                    404,
                    false,
                    "Lead not found or file data already updated"
                );
            }
        }

    } catch (error) {
        console.error("Error saving file upload data:", error);
        responseData(
            res,
            "",
            500,
            false,
            "Something went wrong. File data not updated"
        );
    }
};


export const shareContract = async (req, res) => {
    try {
        const folder_name = req.body.folder_name;
        const fileId = req.body.file_id;
        const lead_id = req.body.lead_id;
        const type = req.body.type;
        const client_email = req.body.email;
        const client_name = req.body.client_name;
        const project_name = req.body.project_name;
        const site_location = req.body.site_location;
        const org_id = req.body.org_id;
        const userId = req.body.userId;
        const user_id = req.body.user_id;
        const userEmail = req.body.userEmail;
        // console.log('folder_name', folder_name)



        if (!folder_name || !fileId || !lead_id || !org_id) {
            return responseData(res, "", 400, false, "Please enter all fields");
        }

        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }

            let checkUser = {};

            if (userId) {
                checkUser = await registerModel.findById(userId);
                if (!checkUser) {
                    return responseData(res, "", 404, false, "user not found");
                }
            }


            const currUser = await registerModel.findById(user_id);
            if (!currUser) {
                return responseData(res, "", 404, false, "user not found");
            }



            if (type === 'Internal') {

                const check_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id });
                // console.log("check_lead", check_lead)
                if (!check_lead) {
                    return responseData(res, "", 400, false, "Lead not found");
                }
                else {

                    // const check_status1 = await leadModel.findOne({ lead_id: lead_id,  org_id: org_id, "contract.itemId": fileId, "contract.admin_status": "pending" });
                    const check_status1 = await leadModel.findOne({
                        lead_id: lead_id,
                        org_id: org_id,
                        contract: {
                            $elemMatch: {
                                itemId: fileId,
                                admin_status: "pending"
                            }
                        }
                    });

                    if (check_status1) {
                        return responseData(res, "", 400, false, "This Contract not  closed yet");
                    }
                    // const check_status2 = await leadModel.findOne({ lead_id: lead_id, org_id: org_id, "contract.itemId": fileId, "contract.admin_status": "rejected" });
                    const check_status2 = await leadModel.findOne({
                        lead_id: lead_id,
                        org_id: org_id,
                        contract: {
                            $elemMatch: {
                                itemId: fileId,
                                admin_status: "rejected"
                            }
                        }
                    });
                    if (check_status2) {
                        return responseData(res, "", 400, false, "This Contract rejected");
                    }
                    // const check_status3 = await leadModel.findOne({ lead_id: lead_id, org_id: org_id, "contract.itemId": fileId, "contracts.admin_status": "approved" });
                    const check_status3 = await leadModel.findOne({
                        lead_id: lead_id,
                        org_id: org_id,
                        contract: {
                            $elemMatch: {
                                itemId: fileId,
                                admin_status: "approved"
                            }
                        }
                    });

                    if (check_status3) {
                        return responseData(res, "", 400, false, "This Contract approved");
                    }






                    const check_file = await fileuploadModel.findOne({ "files.files.fileId": fileId, org_id: org_id });
                    if (!check_file) {
                        return responseData(res, "", 400, false, "File not found");
                    }
                    else {


                        const file_url = check_file.files.find(x => x.folder_name === folder_name)?.files.find(file => file.fileId === fileId);

                        const contractData = {
                            itemId: fileId,
                            admin_status: "pending",
                            file_name: file_url.fileName,
                            files: file_url,
                            remark: "",

                        };

                        const leadUpdate = {
                            username: currUser.username,
                            role: currUser.role,
                            message: ` has shared the contract (${file_url.fileName}) to ${checkUser.username}`,
                            updated_date: new Date(),
                            tags: [],
                            type: 'contract share'
                        }

                        if (check_lead.contract.length < 1) {

                            const createObj = {
                                lead_id,
                                org_id,
                                contractData,
                            }

                            await storeOrUpdateContract(res, createObj, userId, userEmail, check_lead, leadUpdate, checkUser, true);
                        }
                        else {
                            const createObj = {
                                lead_id,
                                org_id,
                                contractData,


                            }
                            await storeOrUpdateContract(res, createObj, userId, userEmail, check_lead, leadUpdate, checkUser);

                        }
                    }

                }

            }
            else if (type === 'Client') {
                // Input validation
                if (!client_email || !onlyEmailValidation(client_email)) {
                    return responseData(res, "", 400, false, "Please enter a valid client email");
                }
                if (!client_name || client_name.length < 3) {
                    return responseData(res, "", 400, false, "Please enter a valid client name");
                }
                if (project_name && !onlyAlphabetsValidation(project_name)) {
                    return responseData(res, "", 400, false, "Please enter a valid project name");
                }
                if (!site_location || site_location.length < 5) {
                    return responseData(res, "", 400, false, "Please enter a valid site location");
                }

                // Check lead existence
                const check_lead = await leadModel.findOne({ lead_id, org_id });
                if (!check_lead) {
                    return responseData(res, "", 400, false, "Invalid lead id");
                }

                // Check file existence
                const check_file = await fileuploadModel.findOne({ "files.files.fileId": fileId, org_id: org_id });
                if (!check_file) {
                    return responseData(res, "", 400, false, "File not found");
                }

                const file_url = check_file.files.find(x => x.folder_name === 'Contract')?.files.find(file => file.fileId === fileId);
                const quotation = req.files.quotation;

                if (!quotation) {
                    return responseData(res, "", 400, false, "Quotation file not uploaded");
                }

                // Upload quotation image
                const response = await uploadImage(req, quotation, lead_id, org_id, quotation.name);
                if (!response.status) {
                    return responseData(res, "", 400, false, "Failed to upload quotation");
                }

                // Prepare file URLs
                const fileUrls = [{
                    fileUrl: response.signedUrl,
                    fileName: decodeURIComponent(response.data.Location.split('/').pop().replace(/\+/g, ' ')),
                    fileId: `FL-${generateSixDigitNumber()}`,
                    fileSize: `${quotation.size / 1024} KB`,
                    date: new Date()
                }];

                const existingFile = await fileuploadModel.findOne({ lead_id, org_id });
                if (existingFile) {
                    const mailOptions = {
                        // from: process.env.ADMIN_USER_EMAIL,
                        from: process.env.INFO_USER_EMAIL,

                        to: client_email,
                        subject: "Contract Share Notification",
                        html: createEmailBody(client_name, project_name, site_location, file_url.fileUrl, response.signedUrl)
                    };

                    admintransporter.sendMail(mailOptions, async (error) => {
                        if (error) {
                            return responseData(res, "", 400, false, "Failed to send email");
                        }

                        await saveFileUploadData(res, {
                            lead_id,
                            org_id,
                            lead_Name: existingFile.lead_name,
                            folder_name: "Quotation",
                            updated_date: new Date(),
                            files: fileUrls,
                        });

                        return responseData(res, "Email sent successfully", 200, true, "");
                    });
                }
            }
            else {
                return responseData(res, "", 400, false, "Invalid Type");
            }
        }


    }
    catch (err) {

    }
}

function createEmailBody(client_name, project_name, site_location, contractUrl, estimateUrl) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            .content { margin-bottom: 20px; }
            .note { font-style: italic; color: #555; }
        </style>
    </head>
    <body>
        <p>Dear <strong>${client_name}</strong>,</p>
        <p>Hope you're doing well!</p>
       <p>We appreciate your expressed interest in our services. Thank you for dedicating your time to the last call / meeting, it greatly aided in our comprehension of your requirements in your <strong>${project_name}</strong>.</p>
        <p>PFA for your kind perusal:</p>
        <ul>
            <li>Design Consultation Draft Contract - <a href="${contractUrl}">View and Download Contract</a></li>
            <li>Tentative Project Estimate - <a href="${estimateUrl}">View and Download Project Estimate</a></li>
        </ul>
     <p>We look forward to the prospect of a successful collaboration for your <strong>${project_name}</strong> at <strong>${site_location}</strong>. Please feel free to call if you have any questions or concerns.</p>
        <p class="note">Kindly note:</p>
          <ul class="note">
        <li>A separate detailed estimate will be provided post-design finalization.</li>
        <li>This estimate is meant to give you a general idea of potential costs. The final expenses will depend on the design, materials, and finishes finalized with you. Any alterations in design due to site requirements or client requests will have an impact on the estimate and the project timeline, which will be promptly updated. The final estimate will be as actuals.</li>
        <li>The project timeline will depend on the final scope of work, which will be updated in the contract.</li>
    </ul>
    </body>
    </html>`;
}

export const updateStatusAdmin = async (req, res) => {
    try {
        const file_id = req.query.fileId;
        const lead_id = req.query.lead_id;
        const status = req.query.status;
        const org_id = req.query.org_id;

        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const check_status = await leadModel.findOne({ lead_id: lead_id, org_id: org_id })
        if (check_status) {

            for (let i = 0; i < check_status.contract.length; i++) {
                if (check_status.contract[i].itemId == file_id) {

                    if (check_status.contract[i].admin_status !== 'pending') {
                        return responseData(res, "", 404, false, "You already submit your response");
                    }
                    else {
                        try {

                            const filter = { "data.quotationData.contract_file_id": file_id, organization: org_id };
                            const update = {
                                $set: { "data.$[outerElem].quotationData.$[innerElem].approval_status": status }
                            };
                            const options = {
                                arrayFilters: [
                                    { "outerElem.quotationData": { $exists: true } },
                                    { "innerElem.contract_file_id": file_id }
                                ],
                                new: true
                            };

                            const userUpdate = await registerModel.findOneAndUpdate(filter, update, options);
                            // console.log(userUpdate)

                        } catch (error) {
                            console.error("Error updating document:", error);
                        }
                        if (status == 'approved') {
                            await leadModel.findOneAndUpdate(
                                {
                                    lead_id: lead_id,
                                    org_id: org_id,
                                    "contract.$.itemId": file_id
                                },
                                {
                                    $set: {
                                        "contract.$[elem].admin_status": status,

                                    }
                                },
                                {
                                    arrayFilters: [{ "elem.itemId": file_id }],
                                    new: true
                                }

                            );
                            res.send('Quotation approved successfully!');

                        }
                        if (status === 'rejected') {
                            await leadModel.findOneAndUpdate(
                                {
                                    lead_id: lead_id,
                                    org_id: org_id,
                                    "contract.$.itemId": file_id
                                },
                                {
                                    $set: {
                                        "contract.$[elem].admin_status": status,

                                    }
                                },
                                {
                                    arrayFilters: [{ "elem.itemId": file_id }],
                                    new: true
                                }
                            );
                            res.send('Quotation rejected successfully!');
                        }
                    }
                }

            }
        }
        else {
            return responseData(res, "", 404, false, "No lead found with this lead_id");
        }

    }
    catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Something went wrong while approving the Contract");

    }





}


export const contractStatus = async (req, res) => {
    try {
        const status = req.body.status;
        const lead_id = req.body.lead_id;
        const itemId = req.body.file_id;
        const remark = req.body.remark;
        const org_id = req.body.org_id;
        const user_id = req.body.user_id;

        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const check_user = await registerModel.findById(user_id);
        if (!check_user) {
            return responseData(res, "", 404, false, "User not found");
        }
        const check_status = await leadModel.findOne({
            lead_id: lead_id, org_id: org_id,
            "contract.$.itemId": itemId
        })

        const approval = await Approval.findOne({ lead_id: lead_id, org_id: org_id });

        if (!approval) {
            return responseData(res, "", 400, false, "Approval document not found", []);
        }
        const file = approval.files.find(f => f.file_id === itemId);
        if (!file) {
            return responseData(res, "", 400, false, "File not found in approval document", []);
        }

        for (let i = 0; i < check_status.contract.length; i++) {
            if (check_status.contract[i].itemId == itemId) {
                if (check_status.contract[i].admin_status !== "pending" && check_status.contract[i].admin_status !== "notsend") {

                    return responseData(res, "", 400, false, "you are already submit your response");
                }
                else {
                    try {
                        const filter = { "data.quotationData.contract_file_id": itemId, organization: org_id, };
                        const update = {
                            $set: { "data.$[outerElem].quotationData.$[innerElem].approval_status": status }
                        };
                        const options = {
                            arrayFilters: [
                                { "outerElem.quotationData": { $exists: true } },
                                { "innerElem.contract_file_id": itemId }
                            ],
                            new: true
                        };

                        const userUpdate = await registerModel.findOneAndUpdate(filter, update, options);


                    } catch (error) {
                        console.error("Error updating document:", error);
                    }

                    if (status == 'approved') {
                        await leadModel.findOneAndUpdate(
                            {
                                lead_id: lead_id,
                                org_id: org_id,
                                "contract.$.itemId": itemId
                            },
                            {
                                $set: {
                                    "contract.$[elem].admin_status": status,

                                }
                            },
                            {
                                arrayFilters: [{ "elem.itemId": itemId }],
                                new: true
                            }

                        );

                        file.status = status;
                        await approval.save();

                        const leadUpdate = {
                            username: check_user.username,
                            role: check_user.role,
                            message: ` has approved the contract (${file.file_name}) .`,
                            updated_date: new Date(),
                            tags: [],
                            type: 'contract acceptance'

                        }

                        await createOrUpdateTimeline(lead_id, '', org_id, leadUpdate, {}, res);
                        responseData(res, "Contract  approved Successfully", 200, true, "");

                    }
                    if (status === 'rejected') {
                        await leadModel.findOneAndUpdate(
                            {
                                lead_id: lead_id,
                                org_id: org_id,
                                "contract.$.itemId": itemId
                            },
                            {
                                $set: {
                                    "contract.$[elem].admin_status": status,
                                    "contract.$[elem].remark": remark

                                }
                            },
                            {
                                arrayFilters: [{ "elem.itemId": itemId }],
                                new: true
                            }
                        );

                        file.status = status;
                        await approval.save();

                        const leadUpdate = {
                            username: check_user.username,
                            role: check_user.role,
                            message: ` has rejected the contract (${file.file_name}) .`,
                            updated_date: new Date(),
                            tags: [],
                            type: 'contract rejection'

                        }

                        await createOrUpdateTimeline(lead_id, '', org_id, leadUpdate, {}, res);

                        responseData(res, "Contract  rejected Successfully", 200, true, "");
                    }
                }
            }

        }

    }
    catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Something went wrong while approving the contract");
    }
}


export const getContractData = async (req, res) => {
    try {
        const lead_id = req.query.lead_id;
        const org_id = req.query.org_id;

        if (!lead_id) {
            return responseData(res, "", 400, false, "Lead id is required");
        }
        else if (!org_id) {
            return responseData(res, "", 400, false, "Org id is required");
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }
            const contractData = await leadModel.find({ lead_id: lead_id, org_id: org_id })
            if (contractData) {

                return responseData(res, "Contract data fetched successfully", 200, true, "", contractData[0].contract);
            }
            else {
                return responseData(res, "", 400, false, "No contract found");
            }


        }


    }
    catch (err) {
        responseData(res, "", 500, false, "Something went wrong while getting the contract");
    }
}














import { responseData } from "../../../utils/respounse.js";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import registerModel from "../../../models/usersModels/register.model.js";
import projectModel from "../../../models/adminModels/project.model.js";
import { onlyEmailValidation } from "../../../utils/validation.js";
import { admintransporter } from "../../../utils/function.js";
import orgModel from "../../../models/orgmodels/org.model.js";








const storeOrUpdateQuotations = async (res, existingQuotationData, isFirst = false) => {
    try {
        let updatedQuotationData;

        if (isFirst) {
            // If it's the first entry, push the quotation data directly
            const updatedProject = await projectModel.findOneAndUpdate(
                { project_id: existingQuotationData.project_id, org_id: existingQuotationData.org_id },
                {
                    $push: { "quotation": existingQuotationData.quotationsData }
                },
                { new: true } // Return the updated document
            );
            return responseData(res, `Quotation shared successfully`, 200, true, "");

            updatedQuotationData = updatedProject.quotation;

        } else {
            // For subsequent entries, check if the item exists and update accordingly
            const findProject = await projectModel.findOne({ "quotation.itemId": existingQuotationData.quotationsData.itemId ,  org_id:  existingQuotationData.org_id});

            if (findProject) {
                let findItem
                if (existingQuotationData.client === "client") {

                    findItem = await projectModel.findOneAndUpdate(
                        {
                            project_id: existingQuotationData.project_id,
                            org_id: existingQuotationData.org_id,
                            "quotation.itemId": existingQuotationData.quotationsData.itemId
                        },
                        {
                            $set: {

                                "quotation.$[elem].client_status": "pending"
                            }
                        },
                        {
                            arrayFilters: [{ "elem.itemId": existingQuotationData.quotationsData.itemId }],
                            new: true // Return the updated document
                        }
                    );
                    return responseData(res, `Quotation shared successfully`, 200, true, "");
                }
                if (existingQuotationData.admin === "admin") {

                    findItem = await projectModel.findOneAndUpdate(
                        {
                            project_id: existingQuotationData.project_id,
                            org_id: existingQuotationData.org_id,
                            "quotation.itemId": existingQuotationData.quotationsData.itemId
                        },
                        {
                            $set: {
                                "quotation.$[elem].admin_status": "pending",

                            }
                        },
                        {
                            arrayFilters: [{ "elem.itemId": existingQuotationData.quotationsData.itemId }],
                            new: true // Return the updated document
                        }
                    );
                    return responseData(res, `Quotation shared successfully`, 200, true, "");
                }


                if (findItem) {
                    updatedQuotationData = findItem.quotation;
                } else {
                    const updatedProject = await projectModel.findOneAndUpdate(
                        { project_id: existingQuotationData.project_id,org_id: existingQuotationData.org_id },
                        {
                            $push: { "quotation": existingQuotationData.quotationsData }
                        },
                        { new: true } // Return the updated document
                    );
                    return responseData(res, `Quotation shared successfully`, 200, true, "");
                    updatedQuotationData = updatedProject.quotation;
                }

            } else {
                const updatedProject = await projectModel.findOneAndUpdate(
                    { project_id: existingQuotationData.project_id, org_id: existingQuotationData.org_id },
                    {
                        $push: { "quotation": existingQuotationData.quotationsData }
                    },
                    { new: true } // Return the updated document
                );
                return responseData(res, `Quotation shared successfully`, 200, true, "");
                return; // Exit early if project not found
            }
        }

    } catch (error) {
        // Log and respond with error message
        console.error("Error storing or updating quotations:", error);
        responseData(res, "", 500, false, "Internal server error");
    }
};



export const shareQuotation = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        // const user_name = req.body.user_name;
        const file_id = req.body.file_id;
        const folder_name = req.body.folder_name;
        const project_id = req.body.project_id;
        const client_email = req.body.client_email;
        const client_name = req.body.client_name;
        const org_id = req.body.org_id;
        const type = req.body.type;
        if (!type || !file_id || !project_id || !user_id ||  !org_id) {
            return responseData(res, "", 400, false, "Missing required fields");
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
        if (!check_user) {
            return responseData(res, "", 400, false, "User not found");
        }
        if (type === "Client") {
            if (!onlyEmailValidation(client_email) || !client_name) {
                return responseData(res, "", 400, false, "Invalid client email or missing client name");
            }
            const findQuotation = await fileuploadModel.findOne({ "files.files.fileId": file_id , org_id: org_id});
            if (!findQuotation) {
                return responseData(res, "", 403, false, "Quotation file not found");
            }
            const findProject = await projectModel.findOne({ project_id: project_id, org_id:org_id });
            if (!findProject) {
                return responseData(res, "", 403, false, "Project not found");
            }
            const findFile = findQuotation.files.find(folder => folder.folder_name === folder_name)?.files.find(file => file.fileId === file_id);
            if (!findFile) {
                return responseData(res, "", 403, false, "File not found in the specified folder");
            }
            const mailOptions = {
                from: process.env.INFO_USER_EMAIL,
                to: client_email,
                subject: "Quotation Approval Notification",
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation Approval Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80%;
            margin: auto;
            padding: 20px;
        }
        .notification {
            background-color: #f0f0f0;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .notification h2 {
            margin-top: 0;
            color: #333;
        }
        .notification p {
            margin-bottom: 10px;
            color: #555;
        }
        .btn {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            cursor: pointer;
        }
        .btn:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="notification">
            <h2>Quotation Approval Notification</h2>
            <p>Hello ${client_name},</p>
            <p>A new quotation file has been shared with you for approval. Please review it and take necessary actions.</p>
            <p>Project Name: <strong>${findProject.project_name}</strong></p>
            <p>Quotation File ID: <strong>${file_id}</strong></p>
            <p>File URL: <a href="${findFile.fileUrl}">View File</a></p>
             <p >
                 <a href="${approvalLinkClient(project_id, file_id, org_id)}">Click Here For Action</a> 
            
                    </p>
            <p>Thank you!</p>
            
        </div>
    </div>
</body>
</html>
`
            };
            let check_status = 0;
            const check_data = await projectModel.findOne({
                project_id: project_id,
                org_id:org_id,
                "quotation.$.itemId": file_id
            })
            await projectModel.findOneAndUpdate({ project_id: project_id, org_id: org_id },
                {
                    $push: {
                        project_updated_by: {
                            username: check_user.username,
                            role: check_user.role,
                            message: `has sent the quotation for approval to client ${client_name}.`,
                            updated_date: new Date()
                        }
                    }
                }
            )
            if (check_data.quotation.length > 0) {
                for (let i = 0; i < check_data.quotation.length; i++) {

                    if (check_data.quotation[i].itemId == file_id) {

                        if (check_data.quotation[i].client_status == "pending") {

                            check_status++;
                        }
                    }

                }



                if (check_status == 0) {
                    admintransporter.sendMail(mailOptions, async (error, info) => {
                        if (error) {
                            console.log(error)
                            return responseData(res, "", 400, false, "Failed to send email");
                        } else {

                            const quotationsData = {
                                itemId: file_id,
                                client_status: "pending",
                                file_name: findFile.fileName,
                                files: findFile,
                                remark: "",
                                admin_status: "",
                                client_remark: ""

                            };


                            const createObj = {
                                project_id,
                                org_id,
                                quotationsData,
                                client: "client"
                            }
                            await storeOrUpdateQuotations(res, createObj);

                        }
                    });

                }
                else {
                    responseData(res, "", 400, false, "Quotation already shared with client and client not response");
                }

            }
            if (check_data.quotation.length < 1) {
                admintransporter.sendMail(mailOptions, async (error, info) => {
                    if (error) {
                        console.log(error)
                        return responseData(res, "", 400, false, "Failed to send email");
                    } else {

                        const quotationsData = {
                            itemId: file_id,
                            client_status: "pending",
                            file_name: findFile.fileName,
                            files: findFile,
                            remark: "",
                            admin_status: "",
                            client_remark: ""
                        };


                        const createObj = {
                            project_id,
                            org_id,
                            quotationsData,

                        }
                        await storeOrUpdateQuotations(res, createObj, true);

                    }
                });

            }


        } else if (type === "Internal") {
            const check_status = await registerModel.findOne({
                "data.quotationData.project_id": project_id,
                "data.quotationData.quotation_file_id": file_id,
                organization: org_id


            });

            if (!check_status) {
                const findQuotation = await fileuploadModel.findOne({ "files.files.fileId": file_id, org_id: org_id });
                if (!findQuotation) {
                    return responseData(res, "", 403, false, "Quotation file not found");
                }
                const findProject = await projectModel.findOne({ project_id: project_id, org_id: org_id });
                if (!findProject) {
                    return responseData(res, "", 403, false, "Project not found");
                }

                const findFile = findQuotation.files.find(folder => folder.folder_name === folder_name)?.files.find(file => file.fileId === file_id);
                if (!findFile) {
                    return responseData(res, "", 403, false, "File not found in the specified folder");
                }
                await projectModel.findOneAndUpdate({ project_id: project_id, org_id: org_id },
                    {
                        $push: {
                            project_updated_by: {
                                username: check_user.username,
                                role: check_user.role,
                                message: `has sent the quotation for approval to ${check_user.username}.`,
                                updated_date: new Date()
                            }
                        }
                    }
                )
                const quotationsData = {
                    itemId: file_id,
                    admin_status: "pending",
                    file_name: findFile.fileName,
                    files: findFile,
                    remark: "",
                    client_status: "",
                    client_remark: "",
                };
                if (findProject.quotation.length > 0) {
                    const createObj = {
                        project_id,
                        org_id,
                        quotationsData,
                        admin: "admin"

                    }
                    await storeOrUpdateQuotations(res, createObj);
                    
                }
                else {
                    const createObj = {
                        project_id,
                        org_id,
                        quotationsData,
                    }
                    await storeOrUpdateQuotations(res, createObj, true);
                   
                }
            }
            else {
                return responseData(res, "", 400, false, "Already share this file.");
            }
        } else {
            return responseData(res, "", 400, false, "Invalid Type");
        }
    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Something went wrong while sharing the quotation");
    }
};


function approvalLinkClient(project_id, file_id, org_id) {
    return `${process.env.LOGIN_URL}/quotation?project_id=${project_id}&file_id=${file_id}&org_id=${org_id}`;
}


export const updateStatus = async (req, res) => {
    try {
        const status = req.body.status;
        const project_id = req.body.project_id;
        const itemId = req.body.file_id;
        const org_id = req.body.org_id;
        const remark = req.body.remark;
        const check_status = await projectModel.findOne({
            project_id: project_id, org_id: org_id,
            "quotation.$.itemId": itemId
        })
        for (let i = 0; i < check_status.quotation.length; i++) {
            if (check_status.quotation[i].itemId == itemId) {
                if (check_status.quotation[i].admin_status !== "pending") {
                    return responseData(res, "", 400, false, "you are already submit your response");
                }
                else {
                    try {
                        const filter = { "data.quotationData.quotation_file_id": itemId,  org_id: org_id };
                        const update = {
                            $set: { "data.$[outerElem].quotationData.$[innerElem].approval_status": status }
                        };
                        const options = {
                            arrayFilters: [
                                { "outerElem.quotationData": { $exists: true } },
                                { "innerElem.quotation_file_id": itemId }
                            ],
                            new: true
                        };

                        const userUpdate = await registerModel.findOneAndUpdate(filter, update, options);


                    } catch (error) {
                        console.error("Error updating document:", error);
                    }



                    if (status === 'approved') {
                        // If the item exists, update its admin_status and client_status
                        await projectModel.findOneAndUpdate(
                            {
                                project_id: project_id,
                                org_id: org_id,
                                "quotation.$.itemId": itemId
                            },
                            {
                                $set: {
                                    "quotation.$[elem].admin_status": status,

                                }
                            },
                            {
                                arrayFilters: [{ "elem.itemId": itemId }],
                                new: true
                            }

                        );
                        // res.send('Quotation approved successfully!');
                        responseData(res, "Quotation approved successfully!", 200, true, "")

                    } if (status === 'rejected') {
                        await projectModel.findOneAndUpdate(
                            {
                                project_id: project_id,
                                org_id: org_id,
                                "quotation.$.itemId": itemId
                            },
                            {
                                $set: {
                                    "quotation.$[elem].admin_status": status,
                                    "quotation.$[elem].remark": remark,


                                }
                            },
                            {
                                arrayFilters: [{ "elem.itemId": itemId }],
                                new: true
                            }
                        );

                        responseData(res, "Quotation rejected successfully!", 200, true, "")
                    }
                }
            }

        }

    }
    catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Something went wrong while approving the quotation");
    }
}

export const updateStatusClient = async (req, res) => {
    try {
        const status = req.body.status;
        const project_id = req.body.project_id;
        const itemId = req.body.file_id;
        const remark = req.body.remark;
        const org_id = req.body.org_id;

        const check_status = await projectModel.findOne({
            project_id: project_id,
            org_id: org_id,
            "quotation.$.itemId": itemId
        })
        for (let i = 0; i < check_status.quotation.length; i++) {
            if (check_status.quotation[i].itemId == itemId) {
                if (check_status.quotation[i].client_status !== "pending") {
                    return responseData(res, "", 400, false, "you are already submit your response");
                }
                else {
                    if (status === 'approved') {
                        // If the item exists, update its admin_status and client_status
                        await projectModel.findOneAndUpdate(
                            {
                                project_id: project_id,
                                org_id: org_id,
                                "quotation.$.itemId": itemId
                            },
                            {
                                $set: {
                                    "quotation.$[elem].client_status": status,
                                    "quotation.$[elem].client_remark": remark,

                                }
                            },
                            {
                                arrayFilters: [{ "elem.itemId": itemId }],
                                new: true
                            }

                        );

                        responseData(res, "Quotation approved successfully!", 200, true, "")
                    } if (status === 'rejected') {
                        if (!remark) {
                            return responseData(res, "", 400, false, "Please enter the remark");
                        }
                        await projectModel.findOneAndUpdate(
                            {
                                project_id: project_id,
                                org_id: org_id,
                                "quotation.$.itemId": itemId
                            },
                            {
                                $set: {
                                    "quotation.$[elem].client_status": status,
                                    "quotation.$[elem].client_remark": remark,

                                }
                            },
                            {
                                arrayFilters: [{ "elem.itemId": itemId }],
                                new: true
                            }

                        );
                        responseData(res, "Quotation rejected Successfully", 200, true, "")
                    }
                    if (status === 'amended') {
                        if (!remark) {
                            return responseData(res, "", 400, false, "Please enter the remark");
                        }
                        await projectModel.findOneAndUpdate(
                            {
                                project_id: project_id,
                                org_id: org_id,
                                "quotation.$.itemId": itemId
                            },
                            {
                                $set: {
                                    "quotation.$[elem].client_status": status,
                                    "quotation.$[elem].client_remark": remark,

                                }
                            },
                            {
                                arrayFilters: [{ "elem.itemId": itemId }],
                                new: true
                            }

                        );
                        responseData(res, "Response submitted successfully", 200, true, "")
                    }
                }
            }
        }

    }
    catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Something went wrong while approving the quotation");
    }
}


export const updateStatusAdmin = async (req, res) => {
    try {
        const status = req.body.status;
        const project_id = req.body.project_id;
        const itemId = req.body.file_id;
        const remark = req.body.remark;
        const org_id =req.body.org_id;
        const check_status = await projectModel.findOne({
            project_id: project_id,
            org_id: org_id,
            "quotation.$.itemId": itemId
        })
        for (let i = 0; i < check_status.quotation.length; i++) {
            if (check_status.quotation[i].itemId == itemId) {
                if (check_status.quotation[i].admin_status !== "pending") {

                    return responseData(res, "", 400, false, "you are already submit your response");
                }
                else {
                    try {
                        const filter = { "data.quotationData.quotation_file_id": itemId, org_id: org_id, };
                        const update = {
                            $set: { "data.$[outerElem].quotationData.$[innerElem].approval_status": status }
                        };
                        const options = {
                            arrayFilters: [
                                { "outerElem.quotationData": { $exists: true } },
                                { "innerElem.quotation_file_id": itemId }
                            ],
                            new: true
                        };

                        const userUpdate = await registerModel.findOneAndUpdate(filter, update, options);


                    } catch (error) {
                        console.error("Error updating document:", error);
                    }



                    if (status === 'approved') {
                        // If the item exists, update its admin_status and client_status
                        await projectModel.findOneAndUpdate(
                            {
                                project_id: project_id,
                                org_id: org_id,
                                "quotation.$.itemId": itemId
                            },
                            {
                                $set: {
                                    "quotation.$[elem].admin_status": status


                                }
                            },
                            {
                                arrayFilters: [{ "elem.itemId": itemId }],
                                new: true
                            }

                        );
                        // res.send('Quotation approved successfully!');
                        responseData(res, "Quotation approved successfully!", 200, true, "")

                    } if (status === 'rejected') {
                        await projectModel.findOneAndUpdate(
                            {
                                project_id: project_id,
                                org_id: org_id,
                                "quotation.$.itemId": itemId
                            },
                            {
                                $set: {
                                    "quotation.$[elem].admin_status": status,
                                    "quotation.$[elem].remark": remark

                                }
                            },
                            {
                                arrayFilters: [{ "elem.itemId": itemId }],
                                new: true
                            }
                        );
                        // res.send('Quotation rejected successfully!');
                        responseData(res, "Quotation rejected successfully!", 200, true, "")
                    }
                }
            }

        }

    }
    catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Something went wrong while approving the quotation");
    }
}
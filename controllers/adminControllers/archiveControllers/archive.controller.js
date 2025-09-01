
import arvhiveModel from "../../../models/adminModels/archive.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { responseData } from "../../../utils/respounse.js";
import archiveModel from "../../../models/adminModels/archive.model.js";
import { s3 } from "../../../utils/function.js";
import cron from "node-cron";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import moment from "moment-timezone";
import orgModel from "../../../models/orgmodels/org.model.js";
import dotenv from "dotenv";

dotenv.config();
// Configure AWS SDK





const getObjectKeyFromUrl = (url) => {
    const urlParts = url.split('.com/');
    return decodeURIComponent(urlParts[1]);
};

export const archive = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        const org_id = req.query.org_id;
        if (!user_id) {
            responseData(res, "", 400, false, "user_id is required", []);
        }
        else if (!org_id) {
            responseData(res, "", 400, false, "Org Id is required", []);
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                responseData(res, "", 404, false, "Org not found!", []);
            }
            const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
            if (!check_user) {
                responseData(res, "", 400, false, "user not found", []);
            }
            else if (check_user) {
                const archive = await arvhiveModel.find({ org_id: org_id })
                if (archive.length < 1) {
                    responseData(res, "No data found", 200, false, "", []);
                }
                if (archive.length > 0) {
                    let response = []

                    let deleted_name;

                    for (let i = 0; i < archive.length; i++) {

                        if (archive[i].deleted_type === 'file') {
                            deleted_name = archive[i].files[0].fileName
                        }
                        else if (archive[i].deleted_type === 'folder') {
                            if (archive[i].type) {
                                deleted_name = archive[i].sub_folder_name_second
                            }
                            else {
                                deleted_name = archive[i].folder_name
                            }

                        }

                        response.push({
                            lead_id: archive[i].lead_id,
                            lead_name: archive[i].lead_name,
                            project_name: archive[i].project_name,
                            project_id: archive[i].project_id,
                            folder_name: archive[i].folder_name,
                            sub_folder_name_first: archive[i].sub_folder_name_first,
                            sub_folder_name_second: archive[i].sub_folder_name_second,
                            files: archive[i].files,
                            deleted_name: deleted_name,
                            type: archive[i].type,
                            created_at: archive[i].archivedAt,
                            deleted_type: archive[i].deleted_type,

                        })
                    }
                    responseData(res, "Data found", 200, true, "", response);
                }

            }
            else {
                responseData(res, "", 400, false, "You are not authorized to access this page", []);
            }
        }

    }
    catch (err) {
        console.log(err);
        responseData(res, "", 500, false, "Something went wrong", []);
    }

}

async function deleteFolder(bucket, folder) {
    try {
        // Validate inputs
        if (!bucket || !folder) {
            console.error('deleteFolder: bucket and folder parameters are required');
            throw new Error('Missing required parameters: bucket or folder');
        }

        // Validate environment variables
        if (!process.env.S3_BUCKET_NAME) {
            console.error('deleteFolder: S3_BUCKET_NAME environment variable is not set');
            throw new Error('S3_BUCKET_NAME environment variable is required');
        }

        console.log(`Attempting to delete S3 folder: ${folder} from bucket: ${bucket}`);

        // List all objects in the folder
        const listParams = {
            Bucket: bucket,
            Prefix: folder
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log(`Folder ${folder} is already empty or does not exist.`);
            return { success: true, message: 'Folder is empty or does not exist' };
        }

        // Create a list of objects to delete
        const deleteParams = {
            Bucket: bucket,
            Delete: {
                Objects: [],
                Quiet: false
            }
        };

        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });

        console.log(`Deleting ${deleteParams.Delete.Objects.length} objects from folder: ${folder}`);

        // Delete the objects
        const deleteResult = await s3.deleteObjects(deleteParams).promise();

        // Log any errors from the delete operation
        if (deleteResult.Errors && deleteResult.Errors.length > 0) {
            console.error('Some objects failed to delete:', deleteResult.Errors);
        }

        // If there are more objects, continue deleting
        if (listedObjects.IsTruncated) {
            console.log('More objects to delete, continuing...');
            return await deleteFolder(bucket, folder);
        } else {
            console.log(`Folder ${folder} and all its contents deleted successfully.`);
            return {
                success: true,
                message: 'Folder deleted successfully',
                deletedCount: deleteParams.Delete.Objects.length
            };
        }
    } catch (error) {
        console.error(`Error deleting folder ${folder}:`, error);
        throw new Error(`Failed to delete folder ${folder}: ${error.message}`);
    }
}


export const deletearchive = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const org_id = req.body.org_id;
        const file_id = req.body.file_id;
        const lead_id = req.body.lead_id;
        const project_id = req.body.project_id;
        const folder_name = req.body.folder_name;
        const type = req.body.type;
        const delete_type = req.body.delete_type;

        if (!user_id) {
            responseData(res, "", 400, false, "user id is required", []);
        }
        else if (!delete_type) {
            responseData(res, "", 400, false, "type and delete_type is required", []);
        }
        else if (!org_id) {
            responseData(res, "", 400, false, "org id is required", []);
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                responseData(res, "", 404, false, "Org not found!", []);
            }
            const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
            if (!check_user) {
                responseData(res, "", 400, false, "user not found", []);
            }
            if (check_user) {
                let data;

                if (type === 'Drawing') {

                    if(lead_id) {

                        const folder_name = req.body.folder_name
                        const sub_folder_name_first = req.body.sub_folder_name_first;
                        const sub_folder_name_second = req.body.sub_folder_name_second;

    
                        if(delete_type === 'folder') {
    
                            //drawing folder itself 
                            if(!sub_folder_name_first && !sub_folder_name_second) {
    
                                const filesData = await archiveModel.findOne(
                                    {
                                        $and: [
                                            { folder_name: folder_name },
                                            { lead_id: lead_id },
                                            { sub_folder_name_first: "" },
                                            { sub_folder_name_second: "" }
                                        ],
                                        org_id: org_id
        
                                    },
                                );

                                // Delete S3 folders for all nested folders
                                for (const item of filesData.files) {
                                    const obj = item[0];
                                    if(obj.sub_folder_name_first && obj.sub_folder_name_second) {
                                        try {
                                            await deleteFolder(process.env.S3_BUCKET_NAME, `${org_id}/${lead_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`);
                                        } catch (error) {
                                            console.error(`Failed to delete S3 folder for lead ${lead_id}:`, error);
                                            // Continue with other deletions even if one fails
                                        }
                                    }
                                }

                                const deletedFolder = await archiveModel.deleteOne(
                                    {
                                        $and: [
                                            { folder_name: folder_name },
                                            { lead_id: lead_id },
                                            { sub_folder_name_first: "" },
                                            { sub_folder_name_second: "" }
                                        ],
                                        org_id: org_id
    
                                    },
                                );

                                if(deletedFolder) {
                                    return responseData(res, "", 200, false, "Folder deleted", []);
                                } else {
                                    return responseData(res, "", 400, false, "Can not delete folder", []);

                                }

                            } else if(sub_folder_name_first && !sub_folder_name_second) {

                                const filesData = await archiveModel.findOne(
                                    {
                                        $and: [
                                            { folder_name: folder_name },
                                            { lead_id: lead_id },
                                            { sub_folder_name_first: sub_folder_name_first },
                                            { sub_folder_name_second: "" }
                                        ],
                                        org_id: org_id
        
                                    },
                                );

                                // Delete S3 folders for all nested folders
                                for (const item of filesData.files) {
                                    const obj = item[0];
                                    if(obj.sub_folder_name_first && obj.sub_folder_name_second) {
                                        try {
                                            await deleteFolder(process.env.S3_BUCKET_NAME, `${org_id}/${lead_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`);
                                        } catch (error) {
                                            console.error(`Failed to delete S3 folder for lead ${lead_id}:`, error);
                                            // Continue with other deletions even if one fails
                                        }
                                    }
                                }

                                const deletedFolder = await archiveModel.deleteOne(
                                    {
                                        $and: [
                                            { folder_name: folder_name },
                                            { type: 'Drawing' },
                                            { lead_id: lead_id },
                                            { sub_folder_name_first: sub_folder_name_first },
                                            { sub_folder_name_second: "" }
                                        ],
                                        org_id: org_id
    
                                    },
                                );

                                if(deletedFolder) {
                                    return responseData(res, "", 200, false, "Folder deleted", []);
                                } else {
                                    return responseData(res, "", 400, false, "Can not delete folder", []);

                                }

                            } else if (sub_folder_name_first && sub_folder_name_second) {

    
                                const filesData = await archiveModel.findOne(
                                        {
                                            $and: [
                                                { folder_name: folder_name },
                                                { lead_id: lead_id },
                                                { sub_folder_name_first: sub_folder_name_first },
                                                { sub_folder_name_second: sub_folder_name_second }
                                            ],
                                            org_id: org_id
            
                                        },
                                    );
    
                                    // Delete S3 folders for all nested folders
                                    for (const item of filesData.files) {
                                        const obj = item[0];
                                        if(obj.sub_folder_name_first && obj.sub_folder_name_second) {
                                            try {
                                                await deleteFolder(process.env.S3_BUCKET_NAME, `${org_id}/${lead_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`);
                                            } catch (error) {
                                                console.error(`Failed to delete S3 folder for lead ${lead_id}:`, error);
                                                // Continue with other deletions even if one fails
                                            }
                                        }
                                    }
    
                                    const deletedFolder = await archiveModel.deleteOne(
                                        {
                                            $and: [
                                                { folder_name: folder_name },
                                                { type: 'Drawing' },
                                                { lead_id: lead_id },
                                                { sub_folder_name_first: sub_folder_name_first },
                                                { sub_folder_name_second: sub_folder_name_second }
                                            ],
                                            org_id: org_id
        
                                        },
                                    );
    
                                    if(deletedFolder) {
                                        return responseData(res, "", 200, false, "Folder deleted", []);
                                    } else {
                                        return responseData(res, "", 400, false, "Can not delete folder", []);
    
                                    }
                            }
                        }  else {

                            const filesData = await archiveModel.findOne(
                                {
                                    $and: [
                                        { lead_id: lead_id },
                                        { type: 'Drawing' },
                                        { folder_name: folder_name },
                                        { sub_folder_name_first: sub_folder_name_first },
                                        { sub_folder_name_second: sub_folder_name_second }
                                    ],
                                    "files.fileId": file_id,
                                    org_id: org_id
                                },
    
                            );
    
                            const objectKey = getObjectKeyFromUrl(filesData.files[0].fileUrl);
    
    
                            await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: objectKey }).promise();
    
                            const doc = await archiveModel.findOneAndDelete(
                                {
                                    $and: [
                                        { lead_id: lead_id },
                                        { type: 'Drawing' },
                                        { folder_name: folder_name },
                                        { sub_folder_name_first: sub_folder_name_first },
                                        { sub_folder_name_second: sub_folder_name_second }
                                    ],
                                    "files.fileId": file_id,
                                    org_id: org_id
                                },
    
                            );





                            return responseData(res, "", 200, false, "File deleted successfully", []);

                        }
                    } else if(project_id) {

                        const folder_name = req.body.folder_name
                        const sub_folder_name_first = req.body.sub_folder_name_first;
                        const sub_folder_name_second = req.body.sub_folder_name_second;

    
                        if(delete_type === 'folder') {
    
                            //drawing folder itself 
                            if(!sub_folder_name_first && !sub_folder_name_second) {
    
                                const filesData = await archiveModel.findOne(
                                    {
                                        $and: [
                                            { folder_name: folder_name },
                                            { project_id: project_id },
                                            { sub_folder_name_first: "" },
                                            { sub_folder_name_second: "" }
                                        ],
                                        org_id: org_id
        
                                    },
                                );

                                // Delete S3 folders for all nested folders
                                for (const item of filesData.files) {
                                    const obj = item[0];
                                    if(obj.sub_folder_name_first && obj.sub_folder_name_second) {
                                        try {
                                            await deleteFolder(process.env.S3_BUCKET_NAME, `${org_id}/${project_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`);
                                        } catch (error) {
                                            console.error(`Failed to delete S3 folder for project ${project_id}:`, error);
                                            // Continue with other deletions even if one fails
                                        }
                                    }
                                }

                                const deletedFolder = await archiveModel.deleteOne(
                                    {
                                        $and: [
                                            { folder_name: folder_name },
                                            { project_id: project_id },
                                            { sub_folder_name_first: "" },
                                            { sub_folder_name_second: "" }
                                        ],
                                        org_id: org_id
    
                                    },
                                );

                                if(deletedFolder) {
                                    return responseData(res, "", 200, false, "Folder deleted", []);
                                } else {
                                    return responseData(res, "", 400, false, "Can not delete folder", []);

                                }

                            } else if(sub_folder_name_first && !sub_folder_name_second) {

                                const filesData = await archiveModel.findOne(
                                    {
                                        $and: [
                                            { folder_name: folder_name },
                                            { project_id: project_id },
                                            { sub_folder_name_first: sub_folder_name_first },
                                            { sub_folder_name_second: "" }
                                        ],
                                        org_id: org_id
        
                                    },
                                );

                                // Delete S3 folders for all nested folders
                                for (const item of filesData.files) {
                                    const obj = item[0];
                                    if(obj.sub_folder_name_first && obj.sub_folder_name_second) {
                                        try {
                                            await deleteFolder(process.env.S3_BUCKET_NAME, `${org_id}/${project_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`);
                                        } catch (error) {
                                            console.error(`Failed to delete S3 folder for project ${project_id}:`, error);
                                            // Continue with other deletions even if one fails
                                        }
                                    }
                                }

                                const deletedFolder = await archiveModel.deleteOne(
                                    {
                                        $and: [
                                            { folder_name: folder_name },
                                            { type: 'Drawing' },
                                            { project_id: project_id },
                                            { sub_folder_name_first: sub_folder_name_first },
                                            { sub_folder_name_second: "" }
                                        ],
                                        org_id: org_id
    
                                    },
                                );

                                if(deletedFolder) {
                                    return responseData(res, "", 200, false, "Folder deleted", []);
                                } else {
                                    return responseData(res, "", 400, false, "Can not delete folder", []);

                                }

                            } else if (sub_folder_name_first && sub_folder_name_second) {

    
                                const filesData = await archiveModel.findOne(
                                        {
                                            $and: [
                                                { folder_name: folder_name },
                                                { project_id: project_id },
                                                { sub_folder_name_first: sub_folder_name_first },
                                                { sub_folder_name_second: sub_folder_name_second }
                                            ],
                                            org_id: org_id
            
                                        },
                                    );
    
                                    // Delete S3 folders for all nested folders
                                    for (const item of filesData.files) {
                                        const obj = item[0];
                                        if(obj.sub_folder_name_first && obj.sub_folder_name_second) {
                                            try {
                                                await deleteFolder(process.env.S3_BUCKET_NAME, `${org_id}/${project_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`);
                                            } catch (error) {
                                                console.error(`Failed to delete S3 folder for project ${project_id}:`, error);
                                                // Continue with other deletions even if one fails
                                            }
                                        }
                                    }
    
                                    const deletedFolder = await archiveModel.deleteOne(
                                        {
                                            $and: [
                                                { folder_name: folder_name },
                                                { type: 'Drawing' },
                                                { project_id: project_id },
                                                { sub_folder_name_first: sub_folder_name_first },
                                                { sub_folder_name_second: sub_folder_name_second }
                                            ],
                                            org_id: org_id
        
                                        },
                                    );
    
                                    if(deletedFolder) {
                                        return responseData(res, "", 200, false, "Folder deleted", []);
                                    } else {
                                        return responseData(res, "", 400, false, "Can not delete folder", []);
    
                                    }
                            }
                        }  else {

                            const filesData = await archiveModel.findOne(
                                {
                                    $and: [
                                        { project_id: project_id },
                                        { type: 'Drawing' },
                                        { folder_name: folder_name },
                                        { sub_folder_name_first: sub_folder_name_first },
                                        { sub_folder_name_second: sub_folder_name_second }
                                    ],
                                    "files.fileId": file_id,
                                    org_id: org_id
                                },
    
                            );
    
                            const objectKey = getObjectKeyFromUrl(filesData.files[0].fileUrl);
    
    
                            await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: objectKey }).promise();
    
                            const doc = await archiveModel.findOneAndDelete(
                                {
                                    $and: [
                                        { project_id: project_id },
                                        { type: 'Drawing' },
                                        { folder_name: folder_name },
                                        { sub_folder_name_first: sub_folder_name_first },
                                        { sub_folder_name_second: sub_folder_name_second }
                                    ],
                                    "files.fileId": file_id,
                                    org_id: org_id
                                },
    
                            );





                            return responseData(res, "", 200, false, "File deleted successfully", []);

                        }

                    }



                } else if (type === "template") {
                    const folder_name = req.body.folder_name
                    const sub_folder_name_first = req.body.sub_folder_name_first;
                    const sub_folder_name_second = req.body.sub_folder_name_second;

                    if (delete_type === 'folder') {
                        const filesData = await archiveModel.findOne(
                            {
                                $and: [
                                    { folder_name: folder_name },
                                    { sub_folder_name_first: sub_folder_name_first },
                                    { sub_folder_name_second: sub_folder_name_second }
                                ],
                                org_id: org_id

                            },

                        );

                        try {
                            await deleteFolder(process.env.S3_BUCKET_NAME, `template/${filesData.folder_name}/${filesData.sub_folder_name_first}/${filesData.sub_folder_name_second}`);
                        } catch (error) {
                            console.error(`Failed to delete S3 template folder:`, error);
                            // Continue with database deletion even if S3 deletion fails
                        }

                        data = await archiveModel.findOneAndDelete(
                            {
                                $and: [
                                    { folder_name: folder_name },
                                    { sub_folder_name_first: sub_folder_name_first },
                                    { sub_folder_name_second: sub_folder_name_second }
                                ],
                                org_id: org_id

                            },

                        );

                    }
                    else if (delete_type === 'file') {
                        const filesData = await archiveModel.findOne(
                            {
                                $and: [
                                    { folder_name: folder_name },
                                    { sub_folder_name_first: sub_folder_name_first },
                                    { sub_folder_name_second: sub_folder_name_second }
                                ],
                                "files.fileId": file_id,
                                org_id: org_id
                            },

                        );

                        const objectKey = getObjectKeyFromUrl(filesData.files[0].fileUrl);


                        await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: objectKey }).promise();

                        data = await archiveModel.findOneAndDelete(
                            {
                                $and: [
                                    { folder_name: folder_name },
                                    { sub_folder_name_first: sub_folder_name_first },
                                    { sub_folder_name_second: sub_folder_name_second }
                                ],
                                "files.fileId": file_id,
                                org_id: org_id
                            },

                        );

                    }
                    else {
                        responseData(res, "", 400, false, "delete type is required", []);
                    }




                } else {
                    if (delete_type === 'folder') {
                        const filesData = await archiveModel.findOne(
                            {
                                $or: [
                                    { project_id: project_id },
                                    { lead_id: lead_id },
                                ],
                                "files.folder_name": folder_name,
                                org_id: org_id
                            },

                        );

                        const check_folder = filesData.files.find(filedata => filedata.folder_name === folder_name)

                        if (check_folder) {
                            let folderName;
                            if (!lead_id) {
                                folderName = project_id
                            }
                            if (!project_id) {
                                folderName = lead_id
                            }
                            try {
                                await deleteFolder(process.env.S3_BUCKET_NAME, `${folderName}/${filesData.files[0].folder_name}/`);
                            } catch (error) {
                                console.error(`Failed to delete S3 folder for ${folderName}:`, error);
                                // Continue with database deletion even if S3 deletion fails
                            }

                            data = await archiveModel.findOneAndDelete(
                                {
                                    $or: [
                                        { project_id: project_id },
                                        { lead_id: lead_id },
                                    ],
                                    "files.folder_name": folder_name,
                                    org_id: org_id
                                },

                            );
                        }

                    }
                    else if (delete_type === 'file') {
                        const filesData = await archiveModel.findOne(
                            {
                                $or: [
                                    { project_id: project_id },
                                    { lead_id: lead_id },
                                ],
                                "folder_name": folder_name,
                                "files.fileId": file_id,
                                org_id: org_id
                            },

                        );

                        const objectKey = getObjectKeyFromUrl(filesData.files[0].fileUrl);

                        await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: objectKey }).promise();
                        data = await archiveModel.findOneAndDelete(
                            {
                                $or: [
                                    { project_id: project_id },
                                    { lead_id: lead_id },
                                ],
                                "folder_name": folder_name,
                                "files.fileId": file_id,
                                org_id: org_id
                            },
                        );
                    }
                    else {
                        responseData(res, "", 404, false, "Invalid Deletion Type")
                    }

                }


                if (data) {
                    responseData(res, "File Or Folder Deleted Successfully", 200, true, "",);
                }
            }
        }
    }
    catch (err) {
        console.log(err);
        responseData(res, "", 500, false, "Something went wrong", []);
    }
}


async function deleteOldFiles() {
    try {
        const thirtyDaysAgo = moment().subtract(30, 'days').toDate();

        const find_data = await archiveModel.find({
            archivedAt: { $lt: thirtyDaysAgo } // Filtering documents older than 30 days
        });
        let data;
        // console.log(find_data);
        for (let i = 0; i < find_data.length; i++) {
            if (find_data[i].type === 'template') {
                if (find_data[i].deleted_type === 'file') {
                    const objectKey = getObjectKeyFromUrl(find_data[i].files[0].fileUrl);


                    await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: objectKey }).promise();

                    data = await archiveModel.findOneAndDelete(
                        {
                            $and: [
                                { folder_name: find_data[i].folder_name },
                                { sub_folder_name_first: find_data[i].sub_folder_name_first },
                                { sub_folder_name_second: find_data[i].sub_folder_name_second }
                            ],
                            "files.fileId": find_data[i].files[0].fileId
                        },

                    );
                }
                if (find_data[i].deleted_type === 'folder') {
                    try {
                        await deleteFolder(process.env.S3_BUCKET_NAME, `template/${find_data[i].folder_name}/${find_data[i].sub_folder_name_first}/${find_data[i].sub_folder_name_second}`);
                    } catch (error) {
                        console.error(`Failed to delete S3 template folder in cron job:`, error);
                        // Continue with database deletion even if S3 deletion fails
                    }

                    data = await archiveModel.findOneAndDelete(
                        {
                            $and: [
                                { folder_name: find_data[i].folder_name },
                                { sub_folder_name_first: find_data[i].sub_folder_name_first },
                                { sub_folder_name_second: find_data[i].sub_folder_name_second }
                            ],

                        },

                    );
                }

            }
            else {
                if (find_data[i].deleted_type === 'file') {
                    const objectKey = getObjectKeyFromUrl(find_data[i].files[0].fileUrl);

                    await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: objectKey }).promise();
                    data = await archiveModel.findOneAndDelete(
                        {
                            $or: [
                                { project_id: find_data[i].project_id },
                                { lead_id: find_data[i].lead_id },
                            ],
                            "folder_name": find_data[i].folder_name,
                            "files.fileId": find_data[i].files[0].fileId
                        },
                    );

                }
                if (find_data[i].deleted_type === 'folder') {
                    const check_folder = find_data[i].files.find(filedata => filedata.folder_name === find_data[i].folder_name)

                    if (check_folder) {
                        let folderName;
                        if (!find_data[i].lead_id) {
                            folderName = find_data[i].project_id
                        }
                        if (!find_data[i].project_id) {
                            folderName = find_data[i].lead_id
                        }
                        try {
                            await deleteFolder(process.env.S3_BUCKET_NAME, `${folderName}/${find_data[i].files[0].folder_name}/`);
                        } catch (error) {
                            console.error(`Failed to delete S3 folder in cron job for ${folderName}:`, error);
                            // Continue with database deletion even if S3 deletion fails
                        }

                        data = await archiveModel.findOneAndDelete(
                            {
                                $or: [
                                    { project_id: find_data[i].project_id },
                                    { lead_id: find_data[i].lead_id },
                                ],
                                "files.folder_name": find_data[i].files[0].folder_name,
                            },

                        );
                    }
                }
            }
        }
        if (data) {
            console.log("deleted all file or folder successfully!")
        }


    }
    catch (err) {
        console.log(err);
    }

}
cron.schedule(

    '0 0 * * *',
    async () => {
        console.log('Running deleteOldFiles job');
        await deleteOldFiles();
    });


const saveFileRestoreDataInLead = async (
    res,
    existingFileUploadData,

) => {
    try {

        // Use update query to push data
        if (existingFileUploadData.deleted_type === "file") {
            const updateResult = await fileuploadModel.updateOne(
                {
                    lead_id: existingFileUploadData.lead_id,
                    org_id: existingFileUploadData.org_id,
                    "files.folder_name": existingFileUploadData.folder_name,
                },
                {
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
                responseData(res, "File data restore successfully", 200, true);
            } else {
                // If the folder does not exist, create a new folder object

                const updateNewFolderResult = await fileuploadModel.updateOne(
                    { lead_id: existingFileUploadData.lead_id, org_id: existingFileUploadData.org_id, },
                    {
                        $push: {
                            files: {
                                folder_name: existingFileUploadData.folder_name,
                                updated_date: existingFileUploadData.files[0].updated_date,
                                files: existingFileUploadData.files,
                            },
                        },
                    }
                );

                if (updateNewFolderResult.modifiedCount === 1) {
                    responseData(res, "File resotre successfully", 200, true);
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

        }
        if (existingFileUploadData.deleted_type === "folder") {
            const updateResult = await fileuploadModel.updateOne(
                {
                    lead_id: existingFileUploadData.lead_id,
                    org_id: existingFileUploadData.org_id,
                    "files.folder_name": existingFileUploadData.folder_name,
                },
                {
                    $push: {
                        "files.$.files": { $each: existingFileUploadData.files[0].files },
                    },

                },
                {
                    arrayFilters: [
                        { "folder.folder_name": existingFileUploadData.folder_name },
                    ],
                }
            );


            if (updateResult.modifiedCount === 1) {
                responseData(res, "Folder data restore  successfully", 200, true);
            } else {
                // If the folder does not exist, create a new folder object

                const updateNewFolderResult = await fileuploadModel.updateOne(
                    { lead_id: existingFileUploadData.lead_id, org_id: existingFileUploadData.org_id, },
                    {
                        $push: {
                            files: {
                                folder_name: existingFileUploadData.folder_name,
                                updated_date: existingFileUploadData.files[0].updated_date,
                                files: existingFileUploadData.files[0].files,
                            },
                        },
                    }
                );

                if (updateNewFolderResult.modifiedCount === 1) {
                    responseData(res, "folder restore successfully ", 200, true);
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


const saveFileRestoreDataInProject = async (
    res,
    existingFileUploadData,

) => {
    try {


        // Use update query to push data
        if (existingFileUploadData.deleted_type === 'file') {
            const updateResult = await fileuploadModel.updateOne(
                {
                    project_id: existingFileUploadData.project_id,
                    org_id: existingFileUploadData.org_id,
                    "files.folder_name": existingFileUploadData.folder_name,
                },
                {
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
            // console.log(updateResult)
            if (updateResult.modifiedCount === 1) {
                responseData(res, "File data restore successfully", 200, true);
            } else {
                // If the folder does not exist, create a new folder object

                const updateNewFolderResult = await fileuploadModel.updateOne(
                    { project_id: existingFileUploadData.project_id, org_id: existingFileUploadData.org_id },
                    {
                        $push: {
                            files: {
                                folder_name: existingFileUploadData.folder_name,
                                updated_date: existingFileUploadData.files[0].date,
                                files: existingFileUploadData.files,
                            },
                        },
                    }
                );

                if (updateNewFolderResult.modifiedCount === 1) {
                    responseData(res, " file restore  successfully", 200, true);
                } else {
                    console.log("Project not found or file data already updated");
                    responseData(
                        res,
                        "",
                        404,
                        false,
                        "Project not found or file data already updated"
                    );
                }
            }

        }
        if (existingFileUploadData.deleted_type === "folder") {

            const updateResult = await fileuploadModel.updateOne(
                {
                    project_id: existingFileUploadData.project_id,
                    "files.folder_name": existingFileUploadData.folder_name,
                    org_id: existingFileUploadData.org_id,
                },
                {
                    $push: {
                        "files.$.files": { $each: existingFileUploadData.files[0].files },
                    },

                },
                {
                    arrayFilters: [
                        { "folder.folder_name": existingFileUploadData.folder_name },
                    ],
                }
            );
            // console.log(updateResult)
            if (updateResult.modifiedCount === 1) {
                responseData(res, "Folder restore successfully", 200, true);
            } else {
                // If the folder does not exist, create a new folder object


                const updateNewFolderResult = await fileuploadModel.updateOne(
                    { project_id: existingFileUploadData.project_id, org_id: existingFileUploadData.org_id },
                    {
                        $push: {
                            files: {
                                folder_name: existingFileUploadData.folder_name,
                                updated_date: existingFileUploadData.files[0].updated_date,
                                files: existingFileUploadData.files[0].files,
                            },
                        },
                    }
                );
                // console.log(updateNewFolderResult)

                if (updateNewFolderResult.modifiedCount === 1) {
                    responseData(res, " folder restore successfully", 200, true);
                } else {
                    console.log("Project not found or file data already updated");
                    responseData(
                        res,
                        "",
                        404,
                        false,
                        "Project not found or file data already updated"
                    );
                }
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

const saveFileUploadDataInTemplate = async (res, existingFileUploadData,) => {
    try {


        if (existingFileUploadData.deleted_type === 'file') {
            let updateQuery = {};
            updateQuery = {
                $push: {
                    "files.$.files": { $each: existingFileUploadData.files },
                },

            };


            const updateResult = await fileuploadModel.updateOne(
                {
                    type: existingFileUploadData.type,
                    org_id: existingFileUploadData.org_id,
                    "files.sub_folder_name_second": existingFileUploadData.sub_folder_name_second,
                    "files.folder_name": existingFileUploadData.folder_name,
                    "files.sub_folder_name_first": existingFileUploadData.sub_folder_name_first,
                },
                updateQuery,
                {
                    arrayFilters: [
                        { "folder.sub_folder_name_second": existingFileUploadData.sub_folder_name_second, },
                    ],
                }
            );

            if (updateResult.modifiedCount === 1) {
                responseData(res, "File data retore successfully", 200, true);
            } else {
                const firstFile = await fileuploadModel.create({
                    type: existingFileUploadData.type,
                    org_id: existingFileUploadData.org_id,
                    files: [
                        {
                            folder_name: existingFileUploadData.folder_name,
                            sub_folder_name_first: existingFileUploadData.sub_folder_name_first,
                            sub_folder_name_second: existingFileUploadData.sub_folder_name_second,
                            updated_date: existingFileUploadData.files[0].updated_date,
                            folder_id: existingFileUploadData.folder_Id,
                            files: existingFileUploadData.files,
                        },
                    ],
                });

                responseData(res, "File data restore successfully", 200, true);


            }
        }
        if (existingFileUploadData.deleted_type === 'folder') {
            let updateQuery = {};
            updateQuery = {
                $push: {
                    "files.$.files": { $each: existingFileUploadData.files[0].files },
                },

            };


            const updateResult = await fileuploadModel.updateOne(
                {
                    type: existingFileUploadData.type,
                    org_id: existingFileUploadData.org_id,
                    "files.sub_folder_name_second": existingFileUploadData.sub_folder_name_second,
                    "files.folder_name": existingFileUploadData.folder_name,
                    "files.sub_folder_name_first": existingFileUploadData.sub_folder_name_first,
                },
                updateQuery,
                {
                    arrayFilters: [
                        { "folder.sub_folder_name_second": existingFileUploadData.sub_folder_name_second, },
                    ],
                }
            );

            if (updateResult.modifiedCount === 1) {
                responseData(res, "Folder restore successfully", 200, true);
            } else {
                const firstFile = await fileuploadModel.create({
                    type: existingFileUploadData.type,
                    org_id: existingFileUploadData.org_id,
                    files: [
                        {
                            folder_name: existingFileUploadData.folder_name,
                            sub_folder_name_first: existingFileUploadData.sub_folder_name_first,
                            sub_folder_name_second: existingFileUploadData.sub_folder_name_second,
                            updated_date: existingFileUploadData.files[0].updated_date,
                            folder_id: existingFileUploadData.folder_Id,
                            files: existingFileUploadData.files[0].files,
                        },
                    ],
                });

                responseData(res, "Folder data restore successfully", 200, true);


            }
        }

    } catch (error) {
        console.error("Error saving file upload data:", error);
        responseData(res, "", 500, false, "Something went wrong. File data not updated");
    }
};

export const restoreData = async (req, res) => {
    try {
        const lead_id = req.body.lead_id;
        const project_id = req.body.project_id;
        const user_id = req.body.user_id;
        const type = req.body.type;
        const file_id = req.body.file_id;
        const folder_name = req.body.folder_name;
        const sub_folder_name_first = req.body.sub_folder_name_first;
        const sub_folder_name_second = req.body.sub_folder_name_second;
        const restore_type = req.body.restore_type;
        const org_id = req.body.org_id;


        if (!user_id) {
            responseData(res, "", 400, false, "User id is required", []);
        }
        else if (!org_id) {
            responseData(res, "", 400, false, "org id is required", []);
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                responseData(res, "", 404, false, "Org not found!", []);
            }
            const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
            if (!check_user) {
                responseData(res, "", 400, false, "User id is not valid", []);
            }

            if(type === 'Drawing') {

                if(lead_id) {

                    if(restore_type === 'folder') {
                        if(!sub_folder_name_first && !sub_folder_name_second) {
                            const filesData = await archiveModel.findOne(
                                {
                                    $and: [
                                        { folder_name: folder_name },
                                        { project_id: project_id ? project_id : '' },
                                        { lead_id: lead_id ? lead_id : '' },
                                        { type: 'Drawing' },
                                        { sub_folder_name_first: '' },
                                        { sub_folder_name_second: '' }
                                    ],
                                    org_id: org_id
                                },
                            );
        
                            if(!filesData) {
                                return responseData(res, "", 404, false, "File or folder is not found in archive.", []);
                            }
        
                            const document = await fileuploadModel.findOne({
                                lead_id: lead_id,
                                org_id: org_id,
                                type: { $exists: false } // Ensure 'type' is missing
                            });
        
                            if(!document) {
                                return responseData(res, "", 404, false, "File or folder is not found.", []);
                            }
        
                            const newFileObject = {
                                folder_name: "Drawing",
                                updated_date: new Date(),
                                files: [],
                            };
        
                            document.files.push(newFileObject);
                            await document.save();
        
                            const archiveData = filesData.files.map((files) => ({
                                lead_id: filesData.lead_id || null,
                                org_id: filesData.org_id || '',
                                lead_name: filesData.lead_name || '',
                                project_name: filesData.project_name || '',
                                project_id: filesData.project_id || null,
                                files: files,
                                type: "Drawing",
                            }));
        
                            const restoredData = await fileuploadModel.insertMany(archiveData);
                            const deleteResult = await archiveModel.deleteOne({ lead_id, type });
        
        
                            return responseData(res, "Folder is restored", 200, true, "", []);
        
                        } else if (sub_folder_name_first && !sub_folder_name_second) {
                            const filesData = await archiveModel.findOne(
                                {
                                    $and: [
                                        { folder_name: folder_name },
                                        { project_id: project_id ? project_id : '' },
                                        { lead_id: lead_id ? lead_id : '' },
                                        { type: 'Drawing' },
                                        { sub_folder_name_first: sub_folder_name_first },
                                        { sub_folder_name_second: '' }
                                    ],
                                    org_id: org_id
                                },
                            );
        
                            if(!filesData) {
                                return responseData(res, "", 404, false, "File or folder is not found in archive.", []);
                            }
        
                            const archiveData = filesData.files.map((files) => ({
                                lead_id: filesData.lead_id || null,
                                org_id: filesData.org_id || '',
                                lead_name: filesData.lead_name || '',
                                project_name: filesData.project_name || '',
                                project_id: filesData.project_id || null,
                                files: files,
                                type: "Drawing",
                            }));
        
                            const restoredData = await fileuploadModel.insertMany(archiveData);
                            const deleteResult = await archiveModel.deleteOne({ lead_id, type, folder_name, sub_folder_name_first, sub_folder_name_second:'' });
        
                            // console.log("restoredData", restoredData)
        
                            return responseData(res, "Folder is restored", 200, true, "", []);
                        } else if (sub_folder_name_first && sub_folder_name_second) {
        
                            const filesData = await archiveModel.findOne(
                                {
                                    $and: [
                                        { folder_name: folder_name },
                                        { project_id: project_id ? project_id : '' },
                                        { lead_id: lead_id ? lead_id : '' },
                                        { type: 'Drawing' },
                                        { sub_folder_name_first: sub_folder_name_first },
                                        { sub_folder_name_second: sub_folder_name_second }
                                    ],
                                    org_id: org_id
                                },
                            );
        
                            if(!filesData) {
                                return responseData(res, "", 404, false, "File or folder is not found in archive.", []);
                            }
        
                            const archiveData = filesData.files.map((files) => ({
                                lead_id: filesData.lead_id || null,
                                org_id: filesData.org_id || '',
                                lead_name: filesData.lead_name || '',
                                project_name: filesData.project_name || '',
                                project_id: filesData.project_id || null,
                                files: files,
                                type: "Drawing",
                            }));
        
                            const restoredData = await fileuploadModel.insertMany(archiveData);
                            const deleteResult = await archiveModel.deleteOne({ lead_id, type, folder_name, sub_folder_name_first, sub_folder_name_second });
        
                            // console.log("restoredData", restoredData)
        
                            return responseData(res, "Folder is restored", 200, true, "", []);
        
        
        
                        }
    
                    } else if(restore_type === 'file') {
    
                        if(sub_folder_name_first && sub_folder_name_second) {
    
    
                            const filesData = await archiveModel.findOne({
                                $and: [
                                    { folder_name: folder_name },
                                    { project_id: project_id ? project_id : null },
                                    { lead_id: lead_id ? lead_id : null },
                                    { type: 'Drawing' },
                                    { deleted_type: 'file' },
                                    { sub_folder_name_first: sub_folder_name_first },
                                    { sub_folder_name_second: sub_folder_name_second }
                                ],
                                org_id: org_id
                            });
                            
                            
                            if (!filesData) {
                                return responseData(res, "", 404, false, "File or folder is not found in archive.", []);
                            }
                            
                            const document = await fileuploadModel.findOne({
                                lead_id: lead_id,
                                org_id: org_id,
                                type: 'Drawing',
                                'files.sub_folder_name_first': sub_folder_name_first,
                                'files.sub_folder_name_second': sub_folder_name_second
                            });
                            
                            if (!document) {
                                return responseData(res, "", 404, false, "File or folder is not found.", []);
                            }
                            
                            
                            const newFile = filesData.files[0];
                            
                            
                            // Find the correct folder inside 'files' array
                            const folderIndex = document.files.findIndex(f => 
                                f.sub_folder_name_first === sub_folder_name_first &&
                                f.sub_folder_name_second === sub_folder_name_second
                            );
                            
                            if (folderIndex === -1) {
                                return responseData(res, "", 404, false, "Folder not found in document.", []);
                            }
                            
                            // Add the new file to the correct folder
                            document.files[folderIndex].files.push(newFile);
                            
                            // Mark the nested array as modified
                            document.markModified(`files.${folderIndex}.files`);
                            
                            
                            // Save the document
                            await document.save();
                            
                            // Delete the restored file from the archive
                            await archiveModel.deleteOne({ 
                                lead_id, 
                                type: 'Drawing', 
                                sub_folder_name_first, 
                                sub_folder_name_second, 
                                deleted_type: 'file'  
                            });
                            
                            return responseData(res, "Folder is restored", 200, true, "", []);
    
                        }
    
    
    
                    } else {
                        return responseData(res, "", 400, true, "Folder is not restored", []);
    
                    }

                } else if(project_id) {
                    if(restore_type === 'folder') {
                        if(!sub_folder_name_first && !sub_folder_name_second) {
                            const filesData = await archiveModel.findOne(
                                {
                                    $and: [
                                        { folder_name: folder_name },
                                        { project_id: project_id ? project_id : '' },
                                        { lead_id: lead_id ? lead_id : '' },
                                        { type: 'Drawing' },
                                        { sub_folder_name_first: '' },
                                        { sub_folder_name_second: '' }
                                    ],
                                    org_id: org_id
                                },
                            );
        
                            if(!filesData) {
                                return responseData(res, "", 404, false, "File or folder is not found in archive.", []);
                            }
        
                            const document = await fileuploadModel.findOne({
                                project_id: project_id,
                                org_id: org_id,
                                type: { $exists: false } // Ensure 'type' is missing
                            });
        
                            if(!document) {
                                return responseData(res, "", 404, false, "File or folder is not found.", []);
                            }
        
                            const newFileObject = {
                                folder_name: "Drawing",
                                updated_date: new Date(),
                                files: [],
                            };
        
                            document.files.push(newFileObject);
                            await document.save();
        
                            const archiveData = filesData.files.map((files) => ({
                                project_id: filesData.project_id || null,
                                org_id: filesData.org_id || '',
                                lead_name: filesData.lead_name || '',
                                project_name: filesData.project_name || '',
                                project_id: filesData.project_id || null,
                                files: files,
                                type: "Drawing",
                            }));
        
                            const restoredData = await fileuploadModel.insertMany(archiveData);
                            const deleteResult = await archiveModel.deleteOne({ project_id, type });
        
        
                            return responseData(res, "Folder is restored", 200, true, "", []);
        
                        } else if (sub_folder_name_first && !sub_folder_name_second) {
                            const filesData = await archiveModel.findOne(
                                {
                                    $and: [
                                        { folder_name: folder_name },
                                        { project_id: project_id ? project_id : '' },
                                        { lead_id: lead_id ? lead_id : '' },
                                        { type: 'Drawing' },
                                        { sub_folder_name_first: sub_folder_name_first },
                                        { sub_folder_name_second: '' }
                                    ],
                                    org_id: org_id
                                },
                            );
        
                            if(!filesData) {
                                return responseData(res, "", 404, false, "File or folder is not found in archive.", []);
                            }
        
                            const archiveData = filesData.files.map((files) => ({
                                project_id: filesData.project_id || null,
                                org_id: filesData.org_id || '',
                                lead_name: filesData.lead_name || '',
                                project_name: filesData.project_name || '',
                                project_id: filesData.project_id || null,
                                files: files,
                                type: "Drawing",
                            }));
        
                            const restoredData = await fileuploadModel.insertMany(archiveData);
                            const deleteResult = await archiveModel.deleteOne({ project_id, type, folder_name, sub_folder_name_first, sub_folder_name_second:'' });
        
                            // console.log("restoredData", restoredData)
        
                            return responseData(res, "Folder is restored", 200, true, "", []);
                        } else if (sub_folder_name_first && sub_folder_name_second) {
        
                            const filesData = await archiveModel.findOne(
                                {
                                    $and: [
                                        { folder_name: folder_name },
                                        { project_id: project_id ? project_id : '' },
                                        { lead_id: lead_id ? lead_id : '' },
                                        { type: 'Drawing' },
                                        { sub_folder_name_first: sub_folder_name_first },
                                        { sub_folder_name_second: sub_folder_name_second }
                                    ],
                                    org_id: org_id
                                },
                            );
        
                            if(!filesData) {
                                return responseData(res, "", 404, false, "File or folder is not found in archive.", []);
                            }
        
                            const archiveData = filesData.files.map((files) => ({
                                project_id: filesData.project_id || null,
                                org_id: filesData.org_id || '',
                                lead_name: filesData.lead_name || '',
                                project_name: filesData.project_name || '',
                                project_id: filesData.project_id || null,
                                files: files,
                                type: "Drawing",
                            }));
        
                            const restoredData = await fileuploadModel.insertMany(archiveData);
                            const deleteResult = await archiveModel.deleteOne({ project_id, type, folder_name, sub_folder_name_first, sub_folder_name_second });
        
                            // console.log("restoredData", restoredData)
        
                            return responseData(res, "Folder is restored", 200, true, "", []);
        
        
        
                        }
    
                    } else if(restore_type === 'file') {
    
                        if(sub_folder_name_first && sub_folder_name_second) {
    
    
                            const filesData = await archiveModel.findOne({
                                $and: [
                                    { folder_name: folder_name },
                                    { project_id: project_id ? project_id : null },
                                    { lead_id: lead_id ? lead_id : null },
                                    { type: 'Drawing' },
                                    { deleted_type: 'file' },
                                    { sub_folder_name_first: sub_folder_name_first },
                                    { sub_folder_name_second: sub_folder_name_second }
                                ],
                                org_id: org_id
                            });
                            
                            
                            if (!filesData) {
                                return responseData(res, "", 404, false, "File or folder is not found in archive.", []);
                            }
                            
                            const document = await fileuploadModel.findOne({
                                project_id: project_id,
                                org_id: org_id,
                                type: 'Drawing',
                                'files.sub_folder_name_first': sub_folder_name_first,
                                'files.sub_folder_name_second': sub_folder_name_second
                            });
                            
                            if (!document) {
                                return responseData(res, "", 404, false, "File or folder is not found.", []);
                            }
                            
                            
                            const newFile = filesData.files[0];
                            
                            
                            // Find the correct folder inside 'files' array
                            const folderIndex = document.files.findIndex(f => 
                                f.sub_folder_name_first === sub_folder_name_first &&
                                f.sub_folder_name_second === sub_folder_name_second
                            );
                            
                            if (folderIndex === -1) {
                                return responseData(res, "", 404, false, "Folder not found in document.", []);
                            }
                            
                            // Add the new file to the correct folder
                            document.files[folderIndex].files.push(newFile);
                            
                            // Mark the nested array as modified
                            document.markModified(`files.${folderIndex}.files`);
                            
                            
                            // Save the document
                            await document.save();
                            
                            // Delete the restored file from the archive
                            await archiveModel.deleteOne({ 
                                project_id, 
                                type: 'Drawing', 
                                sub_folder_name_first, 
                                sub_folder_name_second, 
                                deleted_type: 'file'  
                            });
                            
                            return responseData(res, "File is restored", 200, true, "", []);
    
                        }
    
                    } else {
                        return responseData(res, "Folder can not be restored", 400, true, "Folder can not be restored", []);
    
                    }
                }

                

                

                

            } else if (type === 'template') {
                const folder_name = req.body.folder_name;
                const sub_folder_name_first = req.body.sub_folder_name_first;
                const sub_folder_name_second = req.body.sub_folder_name_second;


                const filesData = await archiveModel.findOne(
                    {
                        $and: [
                            { folder_name: folder_name },
                            { sub_folder_name_first: sub_folder_name_first },
                            { sub_folder_name_second: sub_folder_name_second }
                        ],
                        org_id: org_id

                    },

                );

                if (restore_type === 'file') {
                    saveFileUploadDataInTemplate(res, filesData)
                    await archiveModel.findOneAndDelete(
                        {
                            $and: [
                                { folder_name: folder_name },
                                { sub_folder_name_first: sub_folder_name_first },
                                { sub_folder_name_second: sub_folder_name_second }
                            ],
                            "files.fileId": file_id,
                            org_id: org_id
                        },

                    );


                }
                if (restore_type === 'folder') {
                    saveFileUploadDataInTemplate(res, filesData);
                    await archiveModel.findOneAndDelete(
                        {
                            $and: [
                                { folder_name: folder_name },
                                { sub_folder_name_first: sub_folder_name_first },
                                { sub_folder_name_second: sub_folder_name_second }
                            ],
                            org_id: org_id

                        },

                    );

                }

            }
            else {
                const filesData = await archiveModel.findOne(
                    {
                        $or: [
                            { project_id: project_id },
                            { lead_id: lead_id },
                        ],
                        "folder_name": folder_name,
                        org_id: org_id
                    },

                );

                if (restore_type === 'file') {
                    if (!filesData.project_id) {
                        await saveFileRestoreDataInLead(res, filesData);
                        await archiveModel.findOneAndDelete(
                            {
                                $or: [
                                    { project_id: project_id },
                                    { lead_id: lead_id },
                                ],
                                "folder_name": folder_name,
                                "files.fileId": file_id,
                                org_id: org_id
                            },
                        );
                    }
                    if (!filesData.lead_id) {
                        await saveFileRestoreDataInProject(res, filesData)
                        await archiveModel.findOneAndDelete(
                            {
                                $or: [
                                    { project_id: project_id },
                                    { lead_id: lead_id },
                                ],
                                "folder_name": folder_name,
                                "files.fileId": file_id,
                                org_id: org_id
                            },
                        );
                    }


                }
                if (restore_type === 'folder') {
                    // console.log(filesData)
                    if (!filesData.project_id) {
                        await saveFileRestoreDataInLead(res, filesData)
                        await archiveModel.findOneAndDelete(
                            {
                                $or: [
                                    { project_id: project_id },
                                    { lead_id: lead_id },
                                ],
                                "folder_name": folder_name,
                                org_id: org_id
                            },
                        );
                    }
                    if (!filesData.lead_id) {
                        await saveFileRestoreDataInProject(res, filesData)
                        await archiveModel.findOneAndDelete(
                            {
                                $or: [
                                    { project_id: project_id },
                                    { lead_id: lead_id },
                                ],
                                "folder_name": folder_name,
                                org_id: org_id
                            },
                        );
                    }


                }

            }

        }

    }
    catch (err) {
        console.log(err);
        responseData(res, "", 500, false, "Something went wrong", []);
    }


}
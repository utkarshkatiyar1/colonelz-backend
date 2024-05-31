
import arvhiveModel from "../../../models/adminModels/archive.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { responseData } from "../../../utils/respounse.js";
import archiveModel from "../../../models/adminModels/archive.model.js";
import AWS from "aws-sdk";
// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: "ap-south-1",
});
const s3 = new AWS.S3();




const getObjectKeyFromUrl = (url) => {
    const urlParts = url.split('.com/');
    return decodeURIComponent(urlParts[1]);
};

export const archive = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        if (!user_id) {
            responseData(res, "", 400, false, "user_id is required", []);
        }
        else {
            const check_user = await registerModel.findById({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 400, false, "user not found", []);
            }
            if (check_user.role === "ADMIN" || check_user.role === "Senior Architect") {
                const archive = await arvhiveModel.find({})
                if (archive.length < 1) {
                    responseData(res, "", 400, false, "No data found", []);
                }
                if (archive.length > 0) {
                    let response = []

                    for (let i = 0; i < archive.length; i++) {
                        response.push({
                            lead_id: archive[i].lead_id,
                            lead_name:archive[i].lead_name,
                            project_name:archive[i].project_name,
                            project_id: archive[i].project_id,
                            folder_name: archive[i].folder_name,
                            files: archive[i].files,
                            type: archive[i].type,
                            created_at: archive[i].archivedAt,

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
        console.log(error);
        responseData(res, "", 500, false, "Something went wrong", []);
    }

}

async function deleteFolder(bucket, folder) {
    try {
        // List all objects in the folder
        const listParams = {
            Bucket: bucket,
            Prefix: folder
        };

        const listedObjects = await s3.listObjectsV2(listParams).promise();
console.log(listedObjects)
        if (listedObjects.Contents.length === 0) {
            console.log('Folder is already empty or does not exist.');
            return;
        }

        // Create a list of objects to delete
        const deleteParams = {
            Bucket: bucket,
            Delete: { Objects: [] }
        };

        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });

        // Delete the objects
        await s3.deleteObjects(deleteParams).promise();

        // If there are more objects, continue deleting
        if (listedObjects.IsTruncated) {
            await deleteFolder(bucket, folder);
        } else {
            console.log('Folder and all its contents deleted successfully.');
        }
    } catch (error) {
        console.error('Error deleting folder:', error);
    }
}


export const deletearchive = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const file_id = req.body.file_id;
        const lead_id = req.body.lead_id;
        const project_id = req.body.project_id;
        const folder_name = req.body.folder_name;
        const type = req.body.type;
        const delete_type = req.body.delete_type;

        if (!user_id) {
            responseData(res, "", 400, false, "user id is required", []);
        }
        // else if (!file_id) {
        //     responseData(res, "", 400, false, "file id is required", []);
        // }
        else {
            const check_user = await registerModel.findOne({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 400, false, "user not found", []);
            }
            if (check_user.role === "ADMIN") {
                let count = 0;

                let data;
                let file;

                if (type === "template") {


                    const filesData = await archiveModel.findOne(
                        {
                            "files.sub_folder_name_second": folder_name,
                            "files.files.fileId": file_id
                        },

                    );

                    file = filesData.files.find(fileGroup => fileGroup.files.some(file => file.fileId === file_id)).files.find(file => file.fileId === file_id);

                    data = await fileuploadModel.findOneAndUpdate(
                        {
                            "files.sub_folder_name_second": folder_name,
                            "files.files.fileId": file_id
                        },
                        {
                            $pull: {
                                "files.$.files": { fileId: file_id }
                            }
                        },
                        { new: true }
                    );

                } else {
                    if (delete_type === 'folder') {
                        const filesData = await archiveModel.findOne(
                            {
                                $or: [
                                    { project_id: project_id },
                                    { lead_id: lead_id },
                                ],
                                "files.folder_name": folder_name,
                            },

                        );
                       
                        const check_folder = filesData.files.find(filedata => filedata.folder_name === folder_name)

                        if (check_folder) {
                            let folderName;
                            if(!lead_id)
                                {
                                  folderName = project_id
                                }
                                if(!project_id)
                                    {
                                        folderName = lead_id
                                    }
                            deleteFolder(process.env.S3_BUCKET_NAME, `${folderName}/${filesData.files[0].folder_name}/`);
                            data = await archiveModel.findOneAndDelete(
                                {
                                    $or: [
                                        { project_id: project_id },
                                        { lead_id: lead_id },
                                    ],
                                    "files.folder_name": folder_name,
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
                                "files.fileId": file_id
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
                                "files.fileId": file_id
                            },
                        );
                    }
                    else {
                        responseData(res, "", 404, false, "Invalid Deletion Type")
                    }

                }


                if (data) {
                    responseData(res, "File deleted successfully", 200, true, "",);
                }
            }
        }
    }
    catch (err) {
        console.log(err);
        responseData(res, "", 500, false, "Something went wrong", []);
    }
}
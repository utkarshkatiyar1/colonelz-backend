
import arvhiveModel from "../../../models/adminModels/archive.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { responseData } from "../../../utils/respounse.js";
import archiveModel from "../../../models/adminModels/archive.model.js";
import AWS from "aws-sdk";
import cron from "node-cron";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
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
                            lead_name: archive[i].lead_name,
                            project_name: archive[i].project_name,
                            project_id: archive[i].project_id,
                            folder_name: archive[i].folder_name,
                            sub_folder_name_first: archive[i].sub_folder_name_first,
                            sub_folder_name_second: archive[i].sub_folder_name_second,
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
        console.log(err);
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
        else if (!delete_type) {
            responseData(res, "", 400, false, "type and delete_type is required", []);
        }
        else {
            const check_user = await registerModel.findOne({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 400, false, "user not found", []);
            }
            if (check_user.role === "ADMIN") {
                let data;
                if (type === "template") {
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

                            },

                        );

                        deleteFolder(process.env.S3_BUCKET_NAME, `template/${filesData.folder_name}/${filesData.sub_folder_name_first}/${filesData.sub_folder_name_second}`);
                        data = await archiveModel.findOneAndDelete(
                            {
                                $and: [
                                    { folder_name: folder_name },
                                    { sub_folder_name_first: sub_folder_name_first },
                                    { sub_folder_name_second: sub_folder_name_second }
                                ],

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
                                "files.fileId": file_id
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
                                "files.fileId": file_id
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
        const find_data = await archiveModel.find({})
        let data;
        console.log(find_data)
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
                    deleteFolder(process.env.S3_BUCKET_NAME, `template/${find_data[i].folder_name}/${find_data[i].sub_folder_name_first}/${find_data[i].sub_folder_name_second}`);
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
                        deleteFolder(process.env.S3_BUCKET_NAME, `${folderName}/${find_data[i].files[0].folder_name}/`);
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

    '0 0 1 * *',
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
            console.log(updateResult)
            if (updateResult.modifiedCount === 1) {
                responseData(res, "File data restore successfully", 200, true);
            } else {
                // If the folder does not exist, create a new folder object

                const updateNewFolderResult = await fileuploadModel.updateOne(
                    { lead_id: existingFileUploadData.lead_id },
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
                    { lead_id: existingFileUploadData.lead_id },
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
            console.log(updateResult)
            if (updateResult.modifiedCount === 1) {
                responseData(res, "File data restore successfully", 200, true);
            } else {
                // If the folder does not exist, create a new folder object

                const updateNewFolderResult = await fileuploadModel.updateOne(
                    { project_id: existingFileUploadData.project_id },
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
                console.log(updateNewFolderResult)

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
            console.log(updateResult)
            if (updateResult.modifiedCount === 1) {
                responseData(res, "Folder restore successfully", 200, true);
            } else {
                // If the folder does not exist, create a new folder object

                const updateNewFolderResult = await fileuploadModel.updateOne(
                    { project_id: existingFileUploadData.project_id },
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
                console.log(updateNewFolderResult)

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
                    files: [
                        {
                            folder_name: existingFileUploadData.folder_name,
                            sub_folder_name_first: existingFileUploadData.sub_folder_name_first,
                            sub_folder_name_second: existingFileUploadData.sub_folder_name_second,
                            updated_date: existingFileUploadData.files[0].date,
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
        const restore_type = req.body.restore_type;


        if (!user_id) {
            responseData(res, "", 400, false, "User id is required", []);
        }
        else {
            const check_user = await registerModel.findById({ _id: user_id })
            if (!check_user) {
                responseData(res, "", 400, false, "User id is not valid", []);
            }
            if (type === 'template') {
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
                            "files.fileId": file_id
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
                                "files.fileId": file_id
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
                                "files.fileId": file_id
                            },
                        );
                    }


                }
                if (restore_type === 'folder') {
                    if (!filesData.project_id) {
                        await saveFileRestoreDataInLead(res, filesData)
                        await archiveModel.findOneAndDelete(
                            {
                                $or: [
                                    { project_id: project_id },
                                    { lead_id: lead_id },
                                ],
                                "folder_name": folder_name,
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
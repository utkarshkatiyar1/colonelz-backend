import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import Archive from "../../../models/adminModels/archive.model.js";
import { responseData } from "../../../utils/respounse.js";

export const deleteFile = async (req, res) => {
    const { lead_id, project_id, folder_name, file_id: fileIds, type } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return responseData(res, "", 400, false, "Please provide an array of fileIds");
    }

    if (!folder_name) {
        return responseData(res, "", 400, false, "Please Enter Folder Name");
    }

    try {
        let count = 0;
        for (let i = 0; i < fileIds.length; i++) {
            let data;
            let file;

            if (type === "template") {
                const filesData = await fileuploadModel.findOne(
                    {
                        "files.sub_folder_name_second": folder_name,
                        "files.files.fileId": fileIds[i]
                    },

                );
                file = filesData.files.find(fileGroup => fileGroup.files.some(file => file.fileId === fileIds[i])).files.find(file => file.fileId === fileIds[i]);

                data = await fileuploadModel.findOneAndUpdate(
                    {
                        "files.sub_folder_name_second": folder_name,
                        "files.files.fileId": fileIds[i]
                    },
                    {
                        $pull: {
                            "files.$.files": { fileId: fileIds[i] }
                        }
                    },
                    { new: true }
                );

            } else {
                const filesData = await fileuploadModel.findOne(
                    {
                        $or: [
                            { project_id: project_id },
                            { lead_id: lead_id },
                        ],
                        "files.folder_name": folder_name,
                        "files.files.fileId": fileIds[i]
                    },

                );
                file = filesData.files.find(fileGroup => fileGroup.files.some(file => file.fileId === fileIds[i])).files.find(file => file.fileId === fileIds[i]);


                data = await fileuploadModel.findOneAndUpdate(
                    {
                        $or: [
                            { project_id: project_id },
                            { lead_id: lead_id },
                        ],
                        "files.folder_name": folder_name,
                        "files.files.fileId": fileIds[i]
                    },
                    {
                        $pull: {
                            "files.$.files": { fileId: fileIds[i] }
                        }
                    },
                    { new: true }
                );
            }

            if (data) {

                await Archive.create({
                    lead_id,
                    project_id,
                    folder_name,
                    sub_folder_name_second: type === "template" ? folder_name : undefined,
                    files: [file],
                    type
                });
                count++;
            }
        }

        if (count > 0) {
            responseData(res, "Files moved to archive successfully", 200, true, "", []);
        } else {
            responseData(res, "No files found", 200, false, "", []);
        }

    } catch (error) {
        console.log(error);
        responseData(res, "", 500, false, "Something went wrong", []);
    }
};

export const deleteFolder = async (req, res) => {
    const { lead_id, project_id, folder_name, type } = req.body;

    if (!folder_name) {
        return responseData(res, "", 400, false, "Please Enter Folder Name");
    }

    try {
        let count = 0;
        let data;
        let folder;

        if (type === "template") {
            const folderData = await fileuploadModel.findOne(
                { "files.sub_folder_name_second": folder_name },

            );
            folder = folderData.files.find(fileGroup => fileGroup.folder_name === folder_name || fileGroup.sub_folder_name_second === folder_name),


                data = await fileuploadModel.findOneAndUpdate(
                    { "files.sub_folder_name_second": folder_name },
                    { $pull: { "files": { sub_folder_name_second: folder_name } } },
                    { new: true }
                );
        } else {
            const folderData = await fileuploadModel.findOne(
                {
                    $or: [
                        { project_id: project_id },
                        { lead_id: lead_id },
                    ],
                    "files.folder_name": folder_name,
                },
            );
           
            folder = folderData.files.find(fileGroup => fileGroup.folder_name === folder_name)
            console.log(folder)
            data = await fileuploadModel.findOneAndUpdate(
                {
                    $or: [
                        { project_id: project_id },
                        { lead_id: lead_id },
                    ],
                    "files.folder_name": folder_name,
                },
                { $pull: { "files": { folder_name: folder_name } } },
                { new: true }
            );
        }

        if (data) {
            await Archive.create({
                lead_id,
                project_id,
                folder_name,
                sub_folder_name_second: type === "template" ? folder_name : undefined,
                files: folder,
                type
            });
            count++;
        }

        if (count > 0) {
            responseData(res, "Folder moved to archive successfully", 200, true, "", []);
        } else {
            responseData(res, "No folder found", 200, false, "", []);
        }

    } catch (error) {
        console.log(error);
        responseData(res, "", 500, false, "Something went wrong", []);
    }
};

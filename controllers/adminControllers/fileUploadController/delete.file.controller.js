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
                let name;
                if (!lead_id && !type) {
                    name = data.project_name;
                   const check =  await Archive.create({
                        lead_id,
                        lead_name: type === "template" ? "" : "",
                        project_name: type === "template" ? "" : name,
                        project_id,
                        folder_name,
                        sub_folder_name_second: type === "template" ? folder_name : undefined,
                        files: [file],
                        type,
                        deleted_type:"file"
                    });
                  
                }
                if (!project_id && !type) {
                    name = data.lead_name;
                   
                    await Archive.create({
                        lead_id,
                        lead_name: type === "template" ? "" : name,
                        project_name: type === "template" ? "" : "",
                        project_id,
                        folder_name,
                        sub_folder_name_second: type === "template" ? folder_name : undefined,
                        files: [file],
                        type,
                        deleted_type: "file"
                    });
                }
                if (!lead_id && !project_id) {
                    await Archive.create({
                        lead_id,
                        lead_name: type === "template" ? "" : "",
                        project_name: type === "template" ? "" : "",
                        project_id,
                        folder_name: type === "template" ? data.files[0].folder_name : folder_name,
                        sub_folder_name_first: type === "template" ? data.files[0].sub_folder_name_first : undefined,
                        sub_folder_name_second: type === "template" ? data.files[0].sub_folder_name_second: undefined,
                        files: [file],
                        type,
                        deleted_type: "file"
                    });
                }


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
            const folder_name = req.body.folder_name;
            const sub_folder_name_first = req.body.sub_folder_name_first;
            const sub_folder_name_second = req.body.sub_folder_name_second;
            const folderData = await fileuploadModel.findOne(
                {
                    "files.folder_name": folder_name,
                    "files.sub_folder_name_first": sub_folder_name_first,
                     "files.sub_folder_name_second": sub_folder_name_second },

            );
           
            folder = folderData.files.find(fileGroup => fileGroup.folder_name === folder_name && fileGroup.sub_folder_name_first === sub_folder_name_first &&  fileGroup.sub_folder_name_second === sub_folder_name_second),


                data = await fileuploadModel.findOneAndDelete(
                    {
                        "files.folder_name": folder_name,
                        "files.sub_folder_name_first": sub_folder_name_first,
                        "files.sub_folder_name_second": sub_folder_name_second
},
                    // { $pull: { "files": { sub_folder_name_second: sub_folder_name_second } } },
                    // { new: true }
                );

        } 
        else {
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
            let name;
            if (!lead_id && !type) {
                name = data.project_name;
                await Archive.create({
                    lead_id,
                    lead_name: type === "template" ? "" : "",
                    project_name: type === "template" ? "" : name,
                    project_id,
                    folder_name: type === "template" ? folder.folder_name: folder_name ,
                    sub_folder_name_first: type ==="template" ? folder.sub_folder_name_first : undefined,
                    sub_folder_name_second: type === "template" ? folder.sub_folder_name_second : undefined,
                    files: [folder],
                    type,
                    deleted_type: "folder"
                    
                });
            }
            if (!project_id && !type) {
                name = data.lead_name;
                await Archive.create({
                    lead_id,
                    lead_name: type === "template" ? "" : name,
                    project_name: type === "template" ? "" : "",
                    project_id,
                    folder_name,
                    sub_folder_name_second: type === "template" ? folder_name : undefined,
                    files: [folder],
                    type,
                    deleted_type: "folder"
                });
            }
            if (!lead_id && !project_id)
                {
                name = data.project_name;
                await Archive.create({
                    lead_id,
                    lead_name: type === "template" ? "" : "",
                    project_name: type === "template" ? "" : name,
                    project_id,
                    folder_name: type === "template" ? folder.folder_name : folder_name,
                    sub_folder_name_first: type === "template" ? folder.sub_folder_name_first : undefined,
                    sub_folder_name_second: type === "template" ? folder.sub_folder_name_second: undefined,
                    files: [folder],
                    type,
                    deleted_type: "folder"
                });
                }
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

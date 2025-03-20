import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import Archive from "../../../models/adminModels/archive.model.js";
import { responseData } from "../../../utils/respounse.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import leadModel from "../../../models/adminModels/leadModel.js";


export const deleteFile = async (req, res) => {
    const { org_id, lead_id, project_id, folder_name, file_id: fileIds, type, sub_folder_name_second, sub_folder_name_first } = req.body;


    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return responseData(res, "", 400, false, "Please provide an array of fileIds");
    }

    if (!folder_name) {
        return responseData(res, "", 400, false, "Please Enter Folder Name");
    }
    if(!org_id)
    {
        return responseData(res, "", 400, false, "Org Id  required");
    }

    try {
        let count = 0;
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            responseData(res, "", 404, false, "Org not found!", []);
        }

        if(type === 'Drawing') {

            if(lead_id) {
                if(sub_folder_name_second && sub_folder_name_first) {
                    const document = await fileuploadModel.findOne({
                        lead_id,
                        org_id,
                        type: 'Drawing',
                        folder_name: 'Drawing',
                        "files.sub_folder_name_first": sub_folder_name_first,
                        "files.sub_folder_name_second": sub_folder_name_second
                    });
                    
                    if (!document) {
                        return responseData(res, "", 404, false, "No file found", []);
                    }
                    
                    // Step 2: Find the correct folder inside 'files'
                    let folder = document.files.find(f => 
                        f.sub_folder_name_first === sub_folder_name_first &&
                        f.sub_folder_name_second === sub_folder_name_second
                    );
                    
                    if (!folder) {
                        return responseData(res, "", 404, false, "No folder found", []);
                    }
                    
                    // Step 3: Separate files to remove
                    const removedFiles = folder.files.filter(file => fileIds.includes(file.fileId));
                    
                    if (removedFiles.length === 0) {
                        return responseData(res, "", 404, false, "No matching files found", []);
                    }
                    
                    // Step 4: Use $pull to remove files from the document
                    await fileuploadModel.updateOne(
                        {
                            lead_id,
                            org_id,
                            type: 'Drawing',
                            folder_name: 'Drawing',
                            "files.sub_folder_name_first": sub_folder_name_first,
                            "files.sub_folder_name_second": sub_folder_name_second
                        },
                        {
                            $pull: { "files.$[].files": { fileId: { $in: fileIds } } }
                        }
                    );
                    
                    // Step 5: Archive the removed files
                    await Archive.create({
                        lead_id,
                        org_id,
                        lead_name: document.lead_name || "",
                        project_id: document.project_id,
                        project_name: document.project_name,
                        folder_name: folder.folder_name,
                        sub_folder_name_first: folder.sub_folder_name_first,
                        sub_folder_name_second: folder.sub_folder_name_second,
                        files: removedFiles,
                        type: "Drawing",
                        deleted_type: "file",
                        deleted_at: new Date()
                    });
                    
                    return responseData(res, "", 200, true, "Files deleted and archived successfully", []);
                }
            } else if(project_id) {
                if(sub_folder_name_second && sub_folder_name_first) {
                    const document = await fileuploadModel.findOne({
                        project_id,
                        org_id,
                        type: 'Drawing',
                        folder_name: 'Drawing',
                        "files.sub_folder_name_first": sub_folder_name_first,
                        "files.sub_folder_name_second": sub_folder_name_second
                    });
                    
                    if (!document) {
                        return responseData(res, "", 404, false, "No file found", []);
                    }
                    
                    // Step 2: Find the correct folder inside 'files'
                    let folder = document.files.find(f => 
                        f.sub_folder_name_first === sub_folder_name_first &&
                        f.sub_folder_name_second === sub_folder_name_second
                    );
                    
                    if (!folder) {
                        return responseData(res, "", 404, false, "No folder found", []);
                    }
                    
                    // Step 3: Separate files to remove
                    const removedFiles = folder.files.filter(file => fileIds.includes(file.fileId));
                    
                    if (removedFiles.length === 0) {
                        return responseData(res, "", 404, false, "No matching files found", []);
                    }
                    
                    // Step 4: Use $pull to remove files from the document
                    await fileuploadModel.updateOne(
                        {
                            project_id,
                            org_id,
                            type: 'Drawing',
                            folder_name: 'Drawing',
                            "files.sub_folder_name_first": sub_folder_name_first,
                            "files.sub_folder_name_second": sub_folder_name_second
                        },
                        {
                            $pull: { "files.$[].files": { fileId: { $in: fileIds } } }
                        }
                    );
                    
                    // Step 5: Archive the removed files
                    await Archive.create({
                        project_id,
                        org_id,
                        lead_name: document.lead_name || "",
                        project_id: document.project_id,
                        project_name: document.project_name,
                        folder_name: folder.folder_name,
                        sub_folder_name_first: folder.sub_folder_name_first,
                        sub_folder_name_second: folder.sub_folder_name_second,
                        files: removedFiles,
                        type: "Drawing",
                        deleted_type: "file",
                        deleted_at: new Date()
                    });
                    
                    return responseData(res, "", 200, true, "Files deleted and archived successfully", []);
                }

            }

            
        }

        for (const fileId of fileIds) {
            const query = type === "template"
                ? { "files.sub_folder_name_second": folder_name, "files.files.fileId": fileId, org_id:org_id }
                : { $or: [{ project_id }, { lead_id }], "files.folder_name": folder_name, "files.files.fileId": fileId, org_id: org_id };

            const filesData = await fileuploadModel.findOne(query);

            if (!filesData) continue;

            const fileGroup = filesData.files.find(group => group.files.some(file => file.fileId === fileId));
            if (!fileGroup) continue;

            const file = fileGroup.files.find(file => file.fileId === fileId);
            const updateQuery = type === "template"
                ? { "files.sub_folder_name_second": folder_name, "files.files.fileId": fileId, org_id:org_id  }
                : { $or: [{ project_id }, { lead_id }], "files.folder_name": folder_name, 'files.files.fileId': fileId, org_id: org_id };

            // console.log(updateQuery);
            

            const filesDatas = await fileuploadModel.findOne(query);

            // console.log("Before Update:", filesDatas);
            const data = await fileuploadModel.findOneAndUpdate(
                updateQuery,
                { $pull: { "files.$[].files": { fileId } } },
                { new: true }
            );
            // console.log("After Update:", data.files[0].files);

            if (data) {
                const archiveData = {
                    lead_id,
                    org_id,
                    lead_name: type === "template" ? "" : (lead_id ? data.lead_name : ""),
                    project_name: type === "template" ? "" : (project_id ? data.project_name : ""),
                    project_id,
                    folder_name: type === "template" ? data.files[0]?.folder_name : folder_name,
                    sub_folder_name_first: type === "template" ? data.files[0]?.sub_folder_name_first : undefined,
                    sub_folder_name_second: type === "template" ? folder_name : undefined,
                    files: [file],
                    type,
                    deleted_type: "file"
                };

                await Archive.create(archiveData);
                count++;
            }
        }

        const message = count > 0 ? "Files moved to archive successfully" : "No files found";
        responseData(res, message, 200, count > 0, "", []);

    } catch (error) {
        console.error(error);
        responseData(res, "", 500, false, "Something went wrong", []);
    }
};


export const deleteFolder = async (req, res) => {
    const { lead_id, org_id, project_id, folder_name, type, sub_folder_name_first, sub_folder_name_second } = req.body;

    if (!folder_name) {
        return responseData(res, "", 400, false, "Please Enter Folder Name");
    }
    if(!org_id){
        return responseData(res, "", 400, false, "Org Id  required"); 
    }

    try {
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            responseData(res, "", 404, false, "Org not found!", []);
        }

       

        let folder, data;

        if(type === "Drawing") {

            if(lead_id) {
                const check_lead = await leadModel.findOne({ lead_id: lead_id, org_id:org_id })
                if (!check_lead) {
                    return responseData(res, "", 404, false, "lead not found!", []);
                }
                if(!sub_folder_name_first) {

                    const filesToArchive = await fileuploadModel.find({ lead_id: lead_id, org_id: org_id, type: "Drawing" });



                    const files = filesToArchive.map((data) => (data.files));


                    const archiveData = {
                        lead_id: lead_id,
                        org_id: org_id,
                        lead_name: check_lead.name,
                        project_name: "",
                        project_id: "",
                        folder_name: 'Drawing',
                        sub_folder_name_first:  '',
                        sub_folder_name_second: '',
                        files: files,
                        type: 'Drawing',
                        deleted_type: "folder"
                    }
            
                    // Insert into Archive collection
                    await Archive.create(archiveData);

                    const data = await fileuploadModel.deleteMany({
                        lead_id,
                        org_id: org_id,
                        type: "Drawing"
                    });

                    const pullFile = await fileuploadModel.findOneAndUpdate(
                        {
                             lead_id: lead_id,
                             org_id: org_id,
                             type: { $exists: false }
                        },
                        { $pull: { "files": { folder_name } } },
                        { new: true }
                    );


                    return responseData(res, "Folder is deleted", 200, false, "", []);
    
                } else {
    
                    if(!sub_folder_name_second) {

                        const filesToArchive = await fileuploadModel.find({
                            lead_id: lead_id,
                            org_id: org_id,
                            type: "Drawing",
                            "files.folder_name": "Drawing",
                            "files.sub_folder_name_first": sub_folder_name_first // Match inside the nested array
                        });

                        const files = filesToArchive.map((data) => (data.files));


                        const archiveData = {
                            lead_id: lead_id,
                            org_id: org_id,
                            lead_name: check_lead.name,
                            project_name: "",
                            project_id: "",
                            folder_name: 'Drawing',
                            sub_folder_name_first:  sub_folder_name_first,
                            sub_folder_name_second: '',
                            files: files,
                            type: 'Drawing',
                            deleted_type: "folder"
                        }
                
                        // Insert into Archive collection
                        await Archive.create(archiveData);
    
                        const data = await fileuploadModel.deleteMany({
                            lead_id: lead_id,
                            org_id: org_id,
                            type: "Drawing",
                            "files.folder_name": "Drawing",
                            "files.sub_folder_name_first": sub_folder_name_first,
                        });
                        return responseData(res, "Folder is deleted", 200, false, "", []);
    
                    } else {
    
                        const filesToArchive = await fileuploadModel.find({
                            lead_id: lead_id,
                            org_id: org_id,
                            type: "Drawing",
                            "files.folder_name": "Drawing",
                            "files.sub_folder_name_first": sub_folder_name_first, // Match inside the nested array
                            "files.sub_folder_name_second": sub_folder_name_second // Match inside the nested array
                        });

                        const files = filesToArchive.map((data) => (data.files));


                        const archiveData = {
                            lead_id: lead_id,
                            org_id: org_id,
                            lead_name: check_lead.name,
                            project_name: "",
                            project_id: "",
                            folder_name: 'Drawing',
                            sub_folder_name_first:  sub_folder_name_first,
                            sub_folder_name_second: sub_folder_name_second,
                            files: files,
                            type: 'Drawing',
                            deleted_type: "folder"
                        }
                
                        // Insert into Archive collection
                        await Archive.create(archiveData);
    
                        const data = await fileuploadModel.deleteMany({
                            lead_id: lead_id,
                            org_id: org_id,
                            type: "Drawing",
                            "files.folder_name": "Drawing",
                            "files.sub_folder_name_first": sub_folder_name_first,
                            "files.sub_folder_name_second": sub_folder_name_second,
                        });
                        return responseData(res, "Folder is deleted", 200, false, "", []);
                    }
    
                    
    
                }

            } else if (project_id) {

                if(!sub_folder_name_first) {
                    const data = await fileuploadModel.deleteMany({
                        project_id: project_id,
                        org_id: org_id,
                        type: "Drawing"
                    });
                    return responseData(res, "Folder is deleted", 200, false, "", []);
    
                } else {
    
                    if(!sub_folder_name_second) {
    
                        const data = await fileuploadModel.deleteMany({
                            project_id: project_id,
                            org_id: org_id,
                            type: "Drawing",
                            "files.folder_name": "Drawing",
                            "files.sub_folder_name_first": sub_folder_name_first,
                        });
                        return responseData(res, "Folder is deleted", 200, false, "", []);
    
                    } else {
    
                        const data = await fileuploadModel.deleteMany({
                            project_id: project_id,
                            org_id: org_id,
                            type: "Drawing",
                            "files.folder_name": "Drawing",
                            "files.sub_folder_name_first": sub_folder_name_first,
                            "files.sub_folder_name_second": sub_folder_name_second,
                        });
                        return responseData(res, "Folder is deleted", 200, false, "", []);
                    }
                }
            }
        }


        const query = type === "template"
            ? {
                org_id: org_id,
                "files.folder_name": folder_name,
                "files.sub_folder_name_first": req.body.sub_folder_name_first,
                "files.sub_folder_name_second": req.body.sub_folder_name_second
            }
            : {
                $or: [{ project_id }, { lead_id }],
                "files.folder_name": folder_name, org_id: org_id
            };

        const folderData = await fileuploadModel.findOne(query);
        if (!folderData) {
            return responseData(res, "No folder found", 200, false, "", []);
        }

        folder = folderData.files.find(fileGroup =>
            type === "template"
                ? fileGroup.folder_name === folder_name &&
                fileGroup.sub_folder_name_first === req.body.sub_folder_name_first &&
                fileGroup.sub_folder_name_second === req.body.sub_folder_name_second
                : fileGroup.folder_name === folder_name
        );

        data = await fileuploadModel.findOneAndUpdate(
            query,
            { $pull: { "files": { folder_name } } },
            { new: true }
        );

        if (data) {
            const archiveData = {
                lead_id,
                org_id,
                lead_name: type === "template" ? "" : (lead_id ? data.lead_name : ""),
                project_name: type === "template" ? "" : (project_id ? data.project_name : ""),
                project_id,
                folder_name: type === "template" ? folder.folder_name : folder_name,
                sub_folder_name_first: type === "template" ? folder.sub_folder_name_first : undefined,
                sub_folder_name_second: type === "template" ? folder.sub_folder_name_second : undefined,
                files: [folder],
                type,
                deleted_type: "folder"
            };

            await Archive.create(archiveData);
            return responseData(res, "Folder moved to archive successfully", 200, true, "", []);
        }

        responseData(res, "No folder found", 200, false, "", []);
    } catch (error) {
        console.error(error);
        responseData(res, "", 500, false, "Something went wrong", []);
    }
};


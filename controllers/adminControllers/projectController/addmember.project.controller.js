import registerModel from "../../../models/usersModels/register.model.js";
import projectModel from "../../../models/adminModels/project.model.js";
import { responseData } from "../../../utils/respounse.js";
import mongoose from "mongoose";

function generatedigitnumber() {
    const length = 6;
    const charset = "0123456789";
    let password = "";
    for (let i = 0; i < length; ++i) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}
export const addMember = async (req, res) => {
    const id = req.body.id;
    const project_id = req.body.project_id;
    const user_name = req.body.user_name;
    const role = req.body.role;

    if (!id) {
        responseData(res, "", 400, false, "Please provide Id");
    } else if (!project_id) {
        responseData(res, "", 400, false, "Please provide project Id");
    } else if (!user_name) {
        responseData(res, "", 400, false, "Please provide user name");
    } else {
        try {
            const find_user = await registerModel.findOne({ _id: id });
            if (find_user) {
                 
                    const find_project = await projectModel.findOne({ project_id: project_id });
                    if (find_project) {
                        const find_user_name = await registerModel.findOne({ username: user_name });
                        if (find_user_name) {
                            let projectDataIndex = find_user_name.data.findIndex(item => item.projectData);
                            if (projectDataIndex === -1) {
                                find_user_name.data.push({ projectData: [] });
                                projectDataIndex = find_user_name.data.length - 1;
                            }
                            const find_data = find_user_name.data[projectDataIndex].projectData.find(proj => proj.project_id === project_id);
                            if (find_data) {
                                responseData(res, "", 400, false, "User already exists in this project");
                            } else {
                                // Add new project details to projectData array
                                const add_project_in_user = await registerModel.findOneAndUpdate(
                                    { username: user_name },
                                    {
                                        $push: {
                                            "data.$[outer].projectData": {
                                                project_id: project_id,
                                                role: role,
                                            }
                                        }
                                    },
                                    {
                                        arrayFilters: [{ "outer.projectData": { $exists: true } }]
                                    }
                                );
                                await registerModel.updateOne(
                                    { username: user_name },
                                    {
                                        $push: {
                                            "data.$[elem].notificationData": {
                                                _id: new mongoose.Types.ObjectId(),
                                                itemId: project_id,
                                                notification_id: generatedigitnumber(),
                                                type: "project",
                                                status: false,
                                                message: `You are added in project ${find_project.project_name}`,
                                                createdAt: new Date()
                                            }
                                        }
                                    },
                                    { arrayFilters: [{ "elem.projectData": { $exists: true } }] }
                                );
                                responseData(res, "Member added successfully", 200, true, "");
                            }
                        } else {
                            responseData(res, "", 404, false, "User Name not found");
                        }
                    } else {
                        responseData(res, "", 404, false, "Project not found");
                    }
                
            } else {
                responseData(res, "", 404, false, "User not found");
            }
        } catch (err) {
            responseData(res, "", 500, false, err.message);
        }
    }
}

export const removeMemberInProject = async (req, res) => {
    try {


        const project_id = req.body.project_id;
        const username = req.body.username;

        if (!lead_id) {
            responseData(res, "", 400, false, "Project id is required");
        }
        else if (!username) {
            responseData(res, "", 400, false, "Username is required");
        }
        else {
            const find_lead = await projectModel.findOne({ project_id: project_id });
            if (find_lead) {
                const find_user = await registerModel.findOne({ username: username });
                // console.log(find_user)
                if (find_user) {
                    const find_user_in_lead = await registerModel.findOne({ username: username, "data.projectData.project_id":project_id });
                    if (find_user_in_lead) {
                        const remove_lead_in_user = await registerModel.findOneAndUpdate(
                            { username: username },
                            {
                                $pull: {
                                    "data.$[outer].projectData": {
                                        project_id: project_id,
                                    }
                                }
                            },
                            { arrayFilters: [{ "outer.projectData": { $exists: true } }] }
                        );
                        if (remove_lead_in_user) {
                            responseData(res, "Member removed successfully", 200, true, "");
                        } else {
                            responseData(res, "", 404, false, "Member not found");
                        }
                    } else {
                        responseData(res, "", 404, false, "Member not found");
                    }
                } else {
                    responseData(res, "", 404, false, "User not found");
                }
            } else {
                responseData(res, "", 404, false, "Project not found");
            }

        }
    }
    catch (err) {
        console.log(err)
        responseData(res, "", 500, false, "Invernal  Server Error")
    }
}


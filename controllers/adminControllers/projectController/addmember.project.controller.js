import registerModel from "../../../models/usersModels/register.model.js";
import projectModel from "../../../models/adminModels/project.model.js";
import { responseData } from "../../../utils/respounse.js";
import mongoose from "mongoose";
import orgModel from "../../../models/orgmodels/org.model.js";

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
    const org_id = req.body.org_id;

    if (!id) {
        responseData(res, "", 400, false, "Please provide Id");
    } else if (!project_id) {
        responseData(res, "", 400, false, "Please provide project Id");
    } else if (!user_name) {
        responseData(res, "", 400, false, "Please provide user name");
    } else if (!org_id) {
        responseData(res, "", 400, false, "org id is required", []);
    }
     else {
        try {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }
            const find_user = await registerModel.findOne({ _id: id, organization: org_id });
            if (find_user) {
                 
                    const find_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
                    if (find_project) {
                        const find_user_name = await registerModel.findOne({ username: user_name, organization: org_id });
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
                                    { username: user_name, organization: org_id },
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
                                    { username: user_name, organization: org_id },
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
        const org_id = req.body.org_id;

        if (!project_id) {
            responseData(res, "", 400, false, "Project id is required");
        }
        else if (!username) {
            responseData(res, "", 400, false, "Username is required");
        }
        else if (!org_id) {
            responseData(res, "", 400, false, "org id is required", []);
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }
            const find_lead = await projectModel.findOne({ project_id: project_id, org_id: org_id });
            if (find_lead) {
                const find_user = await registerModel.findOne({ username: username, organization: org_id });
                // console.log(find_user)
                if (find_user) {
                    const find_user_in_lead = await registerModel.findOne({ username: username, "data.projectData.project_id":project_id, organization: org_id });
                    if (find_user_in_lead) {
                        const remove_lead_in_user = await registerModel.findOneAndUpdate(
                            { username: username, organization: org_id },
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
        responseData(res, "", 500, false, "Internal  Server Error")
    }
}

export const listUserInProject = async (req, res) => {
    try {
        const project_id = req.query.project_id;
        const org_id = req.query.org_id;

        if (!project_id) {
            return responseData(res, "", 400, false, "Project ID is required");
        }
        if (!org_id) {
            return responseData(res, "", 400, false, "Organization ID is required");
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }

        const [findProject, findUser] = await Promise.all([
            projectModel.findOne({ project_id, org_id }, 'project_name project_id timeline_date project_type project_status designer').lean(),
            registerModel.find({ 'data.projectData.project_id': project_id, organization: org_id }, 'username role _id').lean(),
        ]);

        if (!findProject) {
            return responseData(res, "", 404, false, "Project not found");
        }

        if (!findUser || !findUser.length) {
            return responseData(res, "", 404, false, "User not found");
        }

        const response = findUser.map(user => ({
            user_name: user.username,
            role: user.role,
            project_name: findProject.project_name,
            project_id: findProject.project_id,
            user_id: user._id,
            project_enddate: findProject.timeline_date,
            project_type: findProject.project_type,
            project_status: findProject.project_status,
            project_incharge: findProject.designer,
        }));

        return responseData(res, "Found Data", 200, true, "", response);

    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal Server Error");
    }
};

// New bulk assignment function for projects
export const addBulkMembers = async (req, res) => {
    const { id, project_id, users, org_id } = req.body;

    // Input validation with detailed error messages
    if (!id) {
        return responseData(res, "", 400, false, "Please provide Id");
    }
    if (!project_id) {
        return responseData(res, "", 400, false, "Please provide project Id");
    }
    if (!users || !Array.isArray(users) || users.length === 0) {
        return responseData(res, "", 400, false, "Please provide users array");
    }
    if (!org_id) {
        return responseData(res, "", 400, false, "org id is required");
    }

    // Validate users array structure
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (!user || typeof user !== 'object') {
            return responseData(res, "", 400, false, `Invalid user object at index ${i}`);
        }
        if (!user.user_name || typeof user.user_name !== 'string' || user.user_name.trim() === '') {
            return responseData(res, "", 400, false, `Invalid or missing user_name at index ${i}`);
        }
        if (!user.role || typeof user.role !== 'string' || user.role.trim() === '') {
            return responseData(res, "", 400, false, `Invalid or missing role at index ${i}`);
        }
    }

    console.log(`[BULK_ASSIGN_PROJECT] Starting bulk assignment for project ${project_id} with ${users.length} users`);

    try {
        // Verify organization exists
        const check_org = await orgModel.findOne({ _id: org_id });
        if (!check_org) {
            console.log(`[BULK_ASSIGN_PROJECT] Organization not found: ${org_id}`);
            return responseData(res, "", 404, false, "Organization not found");
        }

        // Verify project exists
        const find_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
        if (!find_project) {
            console.log(`[BULK_ASSIGN_PROJECT] Project not found: ${project_id}`);
            return responseData(res, "", 404, false, "Project not found");
        }

        // Verify requesting user exists
        const find_user = await registerModel.findOne({ _id: id, organization: org_id });
        if (!find_user) {
            console.log(`[BULK_ASSIGN_PROJECT] Requesting user not found: ${id}`);
            return responseData(res, "", 404, false, "Requesting user not found");
        }

        const results = [];
        const errors = [];
        let processedCount = 0;

        // Process each user individually with comprehensive error handling
        for (const user of users) {
            const { user_name, role } = user;
            processedCount++;

            console.log(`[BULK_ASSIGN_PROJECT] Processing user ${processedCount}/${users.length}: ${user_name}`);

            try {
                // Find target user
                const find_user_name = await registerModel.findOne({
                    username: user_name.trim(),
                    organization: org_id
                });

                if (!find_user_name) {
                    const errorMsg = `User '${user_name}' not found in organization`;
                    console.log(`[BULK_ASSIGN_PROJECT] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }

                // Ensure user has proper data structure
                if (!find_user_name.data || !Array.isArray(find_user_name.data)) {
                    console.log(`[BULK_ASSIGN_PROJECT] Initializing data array for user: ${user_name}`);
                    const initResult = await registerModel.findOneAndUpdate(
                        { username: user_name.trim(), organization: org_id },
                        { $set: { data: [{ projectData: [], leadData: [], notificationData: [] }] } },
                        { new: true }
                    );
                    if (!initResult) {
                        const errorMsg = `Failed to initialize data structure for user '${user_name}'`;
                        console.log(`[BULK_ASSIGN_PROJECT] ${errorMsg}`);
                        errors.push(errorMsg);
                        continue;
                    }
                }

                // Check for duplicate assignment using direct query
                const existing_assignment = await registerModel.findOne({
                    username: user_name.trim(),
                    organization: org_id,
                    "data.projectData.project_id": project_id
                });

                if (existing_assignment) {
                    const errorMsg = `User '${user_name}' is already assigned to this project`;
                    console.log(`[BULK_ASSIGN_PROJECT] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }

                // Ensure projectData array exists for this user
                await registerModel.findOneAndUpdate(
                    {
                        username: user_name.trim(),
                        organization: org_id,
                        "data.projectData": { $exists: false }
                    },
                    {
                        $push: { data: { projectData: [], leadData: [], notificationData: [] } }
                    }
                );

                // Add user to project with robust atomic operation
                const projectUpdateResult = await registerModel.findOneAndUpdate(
                    {
                        username: user_name.trim(),
                        organization: org_id
                    },
                    {
                        $push: {
                            "data.$[elem].projectData": {
                                project_id: project_id,
                                role: role.trim(),
                                assignedAt: new Date()
                            }
                        }
                    },
                    {
                        arrayFilters: [{ "elem.projectData": { $exists: true } }],
                        new: true
                    }
                );

                if (!projectUpdateResult) {
                    const errorMsg = `Failed to add user '${user_name}' to project - database update failed`;
                    console.log(`[BULK_ASSIGN_PROJECT] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }

                // Verify the assignment was actually added
                const verifyAssignment = await registerModel.findOne({
                    username: user_name.trim(),
                    organization: org_id,
                    "data.projectData.project_id": project_id
                });

                if (!verifyAssignment) {
                    const errorMsg = `Failed to verify assignment for user '${user_name}' - assignment not found after update`;
                    console.log(`[BULK_ASSIGN_PROJECT] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }

                // Add notification with robust atomic operation
                try {
                    const notificationUpdateResult = await registerModel.findOneAndUpdate(
                        {
                            username: user_name.trim(),
                            organization: org_id
                        },
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
                        {
                            arrayFilters: [{ "elem.notificationData": { $exists: true } }],
                            new: true
                        }
                    );

                    if (!notificationUpdateResult) {
                        console.log(`[BULK_ASSIGN_PROJECT] Warning: Failed to add notification for user: ${user_name}`);
                        // Don't fail the assignment for notification failure, just log it
                    }
                } catch (notificationError) {
                    console.log(`[BULK_ASSIGN_PROJECT] Warning: Notification error for user ${user_name}: ${notificationError.message}`);
                    // Don't fail the assignment for notification failure
                }

                console.log(`[BULK_ASSIGN_PROJECT] Successfully assigned user: ${user_name}`);
                results.push({
                    user_name: user_name.trim(),
                    role: role.trim(),
                    status: "success",
                    assignedAt: new Date().toISOString(),
                    project_id: project_id
                });

            } catch (userError) {
                const errorMsg = `Error processing user '${user_name}': ${userError.message}`;
                console.error(`[BULK_ASSIGN_PROJECT] ${errorMsg}`, userError);
                errors.push(errorMsg);
            }
        }

        console.log(`[BULK_ASSIGN_PROJECT] Completed: ${results.length} successful, ${errors.length} failed`);

        // Return appropriate response
        if (results.length === 0) {
            return responseData(res, "", 400, false, "No users were added to the project", {
                errors,
                totalProcessed: processedCount,
                successful: 0,
                failed: errors.length
            });
        }

        const message = results.length === users.length
            ? "All members added successfully to project"
            : `${results.length} of ${users.length} members added successfully to project`;

        return responseData(res, message, 200, true, "", {
            successful: results,
            errors: errors.length > 0 ? errors : undefined,
            summary: {
                totalRequested: users.length,
                totalProcessed: processedCount,
                successfulAssignments: results.length,
                failedAssignments: errors.length
            }
        });

    } catch (err) {
        console.error(`[BULK_ASSIGN_PROJECT] Critical error:`, err);
        return responseData(res, "", 500, false, `Internal server error: ${err.message}`);
    }
};




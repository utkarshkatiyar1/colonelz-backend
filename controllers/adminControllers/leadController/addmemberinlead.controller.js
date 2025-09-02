import leadModel from "../../../models/adminModels/leadModel.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { responseData } from "../../../utils/respounse.js";
import Mongoose from "mongoose";
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

export const AddMemberInLead = async (req, res) => {

    const id = req.body.id;
    const lead_id = req.body.lead_id;
    const user_name = req.body.user_name;
    const role = req.body.role;
    const org_id = req.body.org_id;

    if (!id) {
        responseData(res, "", 400, false, "Please provide Id");
    } else if (!lead_id) {
        responseData(res, "", 400, false, "Please provide lead Id");
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

                const find_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id });
                if (find_lead) {
                    const find_user_name = await registerModel.findOne({ username: user_name, organization: org_id });
                    if (find_user_name) {
                        let leadDataIndex = find_user_name.data.findIndex(item => item.leadData);
                        if (leadDataIndex === -1) {
                            find_user_name.data.push({ leadData: [] });
                            leadDataIndex = find_user_name.data.length - 1;
                        }
                        const find_data = find_user_name.data[leadDataIndex].leadData.find(proj => proj.lead_id === lead_id);
                        if (find_data) {
                            responseData(res, "", 400, false, "User already exists in this lead");
                        } else {
                            // Add new project details to projectData array
                            const add_project_in_user = await registerModel.findOneAndUpdate(
                                { username: user_name, organization: org_id },
                                {
                                    $push: {
                                        "data.$[outer].leadData": {
                                            lead_id: lead_id,
                                            role: role,
                                        }
                                    }
                                },
                                {
                                    arrayFilters: [{ "outer.leadData": { $exists: true } }]
                                }
                            );
                            await registerModel.updateOne(
                                { username: user_name, organization: org_id },
                                {
                                    $push: {
                                        "data.$[elem].notificationData": {
                                            _id: new Mongoose.Types.ObjectId(),
                                            itemId: lead_id,
                                            notification_id: generatedigitnumber(),
                                            type: "lead",
                                            status: false,
                                            message: `You are added in lead ${find_lead.name}`,
                                            createdAt: new Date()
                                        }
                                    }
                                },
                                { arrayFilters: [{ "elem.leadData": { $exists: true } }] }
                            );
                            responseData(res, "Member added successfully", 200, true, "");
                        }
                    } else {
                        responseData(res, "", 404, false, "User Name not found");
                    }
                } else {
                    responseData(res, "", 404, false, "Lead not found");
                }

            } else {
                responseData(res, "", 404, false, "User not found");
            }
        }

        catch (err) {
            console.log(err)
            responseData(res, "", 500, false, "Internal  Server Error", err)
        }

    }
}


export const removeMemberInlead = async (req, res) => {
    try {


        const lead_id = req.body.lead_id;
        const username = req.body.username;
        const org_id = req.body.org_id;

        if (!lead_id) {
            responseData(res, "", 400, false, "Lead id is required");
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
            const find_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id });
            if (find_lead) {
                const find_user = await registerModel.findOne({ username: username, organization: org_id });
                // console.log(find_user)
                if (find_user) {
                    const find_user_in_lead = await registerModel.findOne({ username: username, "data.leadData.lead_id": lead_id, organization: org_id });
                    if (find_user_in_lead) {
                        const remove_lead_in_user = await registerModel.findOneAndUpdate(
                            { username: username, organization: org_id },
                            {
                                $pull: {
                                    "data.$[outer].leadData": {
                                        lead_id:lead_id,
                                    }
                                }
                            },
                            { arrayFilters: [{ "outer.leadData": { $exists: true } }] }
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
                responseData(res, "", 404, false, "Lead not found");
            }

        }
    }
    catch (err) {
        console.log(err)
        responseData(res, "", 500, false, "Internal  Server Error")
    }
}

export const listUserInLead = async (req, res) => {
    try {
        const lead_id = req.query.lead_id;
        const org_id = req.query.org_id;

        if (!lead_id) {
            return responseData(res, "", 400, false, "Lead ID is required");
        }
         if (!org_id) {
            responseData(res, "", 400, false, "org id is required", []);
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        //   const leadId = parseInt(lead_id)
        const [findlead, findUser] = await Promise.all([
            leadModel.findOne({lead_id:lead_id, org_id: org_id }).lean(),
            registerModel.find({
                $or: [
                    { 'data.leadData.lead_id': lead_id },
                    { role: { $in: ['Senior Architect', 'ADMIN'] }, status: true, organization: org_id }
                ]
            }).lean()
        ]);


        if (!findlead) {
            return responseData(res, "", 404, false, "Lead not found");
        }

        if (!findUser.length) {
            return responseData(res, "", 404, false, "User not found");
        }

        const response = findUser.map(user => ({
            user_name: user.username,
            role:user.role,
            lead_name: findlead.name,
            lead_id: findlead.lead_id,
            user_id: user._id,
            lead_created_date: findlead.date,
            lead_status: findlead.lead_status,
            lead_manager: findlead.lead_manager,
        }));

        return responseData(res, "Found Data", 200, true, "", response);

    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal Server Error");
    }
};

// New bulk assignment function for leads
export const addBulkMembersToLead = async (req, res) => {
    const { id, lead_id, users, org_id } = req.body;

    // Input validation with detailed error messages
    if (!id) {
        return responseData(res, "", 400, false, "Please provide Id");
    }
    if (!lead_id) {
        return responseData(res, "", 400, false, "Please provide lead Id");
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

    console.log(`[BULK_ASSIGN_LEAD] Starting bulk assignment for lead ${lead_id} with ${users.length} users`);

    try {
        // Verify organization exists
        const check_org = await orgModel.findOne({ _id: org_id });
        if (!check_org) {
            console.log(`[BULK_ASSIGN_LEAD] Organization not found: ${org_id}`);
            return responseData(res, "", 404, false, "Organization not found");
        }

        // Verify lead exists
        const find_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id });
        if (!find_lead) {
            console.log(`[BULK_ASSIGN_LEAD] Lead not found: ${lead_id}`);
            return responseData(res, "", 404, false, "Lead not found");
        }

        // Verify requesting user exists
        const find_user = await registerModel.findOne({ _id: id, organization: org_id });
        if (!find_user) {
            console.log(`[BULK_ASSIGN_LEAD] Requesting user not found: ${id}`);
            return responseData(res, "", 404, false, "Requesting user not found");
        }

        const results = [];
        const errors = [];
        let processedCount = 0;

        // Process each user individually with comprehensive error handling
        for (const user of users) {
            const { user_name, role } = user;
            processedCount++;

            console.log(`[BULK_ASSIGN_LEAD] Processing user ${processedCount}/${users.length}: ${user_name}`);

            try {
                // Find target user
                const find_user_name = await registerModel.findOne({
                    username: user_name.trim(),
                    organization: org_id
                });

                if (!find_user_name) {
                    const errorMsg = `User '${user_name}' not found in organization`;
                    console.log(`[BULK_ASSIGN_LEAD] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }

                // Ensure user has proper data structure
                if (!find_user_name.data || !Array.isArray(find_user_name.data)) {
                    console.log(`[BULK_ASSIGN_LEAD] Initializing data array for user: ${user_name}`);
                    const initResult = await registerModel.findOneAndUpdate(
                        { username: user_name.trim(), organization: org_id },
                        { $set: { data: [{ projectData: [], leadData: [], notificationData: [] }] } },
                        { new: true }
                    );
                    if (!initResult) {
                        const errorMsg = `Failed to initialize data structure for user '${user_name}'`;
                        console.log(`[BULK_ASSIGN_LEAD] ${errorMsg}`);
                        errors.push(errorMsg);
                        continue;
                    }
                }

                // Check for duplicate assignment using direct query
                const existing_assignment = await registerModel.findOne({
                    username: user_name.trim(),
                    organization: org_id,
                    "data.leadData.lead_id": lead_id
                });

                if (existing_assignment) {
                    const errorMsg = `User '${user_name}' is already assigned to this lead`;
                    console.log(`[BULK_ASSIGN_LEAD] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }

                // Ensure leadData array exists for this user
                await registerModel.findOneAndUpdate(
                    {
                        username: user_name.trim(),
                        organization: org_id,
                        "data.leadData": { $exists: false }
                    },
                    {
                        $push: { data: { projectData: [], leadData: [], notificationData: [] } }
                    }
                );

                // Add user to lead with robust atomic operation
                const leadUpdateResult = await registerModel.findOneAndUpdate(
                    {
                        username: user_name.trim(),
                        organization: org_id
                    },
                    {
                        $push: {
                            "data.$[elem].leadData": {
                                lead_id: lead_id,
                                role: role.trim(),
                                assignedAt: new Date()
                            }
                        }
                    },
                    {
                        arrayFilters: [{ "elem.leadData": { $exists: true } }],
                        new: true
                    }
                );

                if (!leadUpdateResult) {
                    const errorMsg = `Failed to add user '${user_name}' to lead - database update failed`;
                    console.log(`[BULK_ASSIGN_LEAD] ${errorMsg}`);
                    errors.push(errorMsg);
                    continue;
                }

                // Verify the assignment was actually added
                const verifyAssignment = await registerModel.findOne({
                    username: user_name.trim(),
                    organization: org_id,
                    "data.leadData.lead_id": lead_id
                });

                if (!verifyAssignment) {
                    const errorMsg = `Failed to verify assignment for user '${user_name}' - assignment not found after update`;
                    console.log(`[BULK_ASSIGN_LEAD] ${errorMsg}`);
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
                                    _id: new Mongoose.Types.ObjectId(),
                                    itemId: lead_id,
                                    notification_id: generatedigitnumber(),
                                    type: "lead",
                                    status: false,
                                    message: `You are added in lead ${find_lead.name}`,
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
                        console.log(`[BULK_ASSIGN_LEAD] Warning: Failed to add notification for user: ${user_name}`);
                        // Don't fail the assignment for notification failure, just log it
                    }
                } catch (notificationError) {
                    console.log(`[BULK_ASSIGN_LEAD] Warning: Notification error for user ${user_name}: ${notificationError.message}`);
                    // Don't fail the assignment for notification failure
                }

                console.log(`[BULK_ASSIGN_LEAD] Successfully assigned user: ${user_name}`);
                results.push({
                    user_name: user_name.trim(),
                    role: role.trim(),
                    status: "success",
                    assignedAt: new Date().toISOString(),
                    lead_id: lead_id
                });
            } catch (userError) {
                const errorMsg = `Error processing user '${user_name}': ${userError.message}`;
                console.error(`[BULK_ASSIGN_LEAD] ${errorMsg}`, userError);
                errors.push(errorMsg);
            }
        }

        console.log(`[BULK_ASSIGN_LEAD] Completed: ${results.length} successful, ${errors.length} failed`);

        // Return appropriate response
        if (results.length === 0) {
            return responseData(res, "", 400, false, "No users were added to the lead", {
                errors,
                totalProcessed: processedCount,
                successful: 0,
                failed: errors.length
            });
        }

        const message = results.length === users.length
            ? "All members added successfully to lead"
            : `${results.length} of ${users.length} members added successfully to lead`;

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
        console.error(`[BULK_ASSIGN_LEAD] Critical error:`, err);
        return responseData(res, "", 500, false, `Internal server error: ${err.message}`);
    }
};
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

    try {
        const check_org = await orgModel.findOne({ _id: org_id });
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }

        const find_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id });
        if (!find_lead) {
            return responseData(res, "", 404, false, "Lead not found");
        }

        const find_user = await registerModel.findOne({ _id: id, organization: org_id });
        if (!find_user) {
            return responseData(res, "", 404, false, "User not found");
        }

        const results = [];
        const errors = [];

        for (const user of users) {
            const { user_name, role } = user;

            if (!user_name || !role) {
                errors.push(`Missing user_name or role for user: ${JSON.stringify(user)}`);
                continue;
            }

            try {
                const find_user_name = await registerModel.findOne({ username: user_name, organization: org_id });
                if (!find_user_name) {
                    errors.push(`User ${user_name} not found`);
                    continue;
                }

                let leadDataIndex = find_user_name.data.findIndex(item => item.leadData);
                if (leadDataIndex === -1) {
                    find_user_name.data.push({ leadData: [] });
                    leadDataIndex = find_user_name.data.length - 1;
                }

                const find_data = find_user_name.data[leadDataIndex].leadData.find(lead => lead.lead_id === lead_id);
                if (find_data) {
                    errors.push(`User ${user_name} already exists in this lead`);
                    continue;
                }

                // Add user to lead
                await registerModel.findOneAndUpdate(
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

                // Add notification
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

                results.push({ user_name, role, status: "success" });
            } catch (userError) {
                errors.push(`Error adding user ${user_name}: ${userError.message}`);
            }
        }

        if (results.length === 0) {
            return responseData(res, "", 400, false, "No users were added", { errors });
        }

        const message = results.length === users.length
            ? "All members added successfully"
            : `${results.length} of ${users.length} members added successfully`;

        return responseData(res, message, 200, true, "", {
            successful: results,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (err) {
        return responseData(res, "", 500, false, err.message);
    }
};
import { responseData } from "../../../utils/respounse.js";
import registerModel from "../../../models/usersModels/register.model.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import { onlyAlphabetsValidation } from "../../../utils/validation.js";
import timerModel from "../../../models/adminModels/timer.Model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import leadModel from "../../../models/adminModels/leadModel.js";
import leadTaskModel from "../../../models/adminModels/leadTask.model.js";
import leadTimerModel from "../../../models/adminModels/leadTimer.Model.js";
import { send_mail_subtask } from "../../../utils/mailtemplate.js";


function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}
const createSubTaskAndTimer = async (data, res,req) => {
    try {
        const {org_id, lead_id, task_id, sub_task_name, sub_task_description, 
            estimated_sub_task_end_date, actual_sub_task_start_date, actual_sub_task_end_date,
            sub_task_status, sub_task_priority, sub_task_assignee, sub_task_reporter, check_user, check_task } = data;

        const sub_task_id = `STK-${generateSixDigitNumber()}`;

        const update_task = await leadTaskModel.findOneAndUpdate({ task_id: task_id, lead_id: lead_id, org_id: org_id }, {
            $push: {
                subtasks: {
                    sub_task_id, sub_task_name, sub_task_description,
                    estimated_sub_task_end_date,
                    actual_sub_task_start_date, actual_sub_task_end_date,
                    sub_task_status, sub_task_priority, sub_task_assignee,
                    sub_task_createdBy: check_user.username, sub_task_createdOn: new Date(),
                    sub_task_reporter
                }
            }
        }, { new: true, useFindAndModify: false });

        if (update_task) {
            await leadTimerModel.findOneAndUpdate({ lead_id: lead_id, task_id: task_id, org_id:org_id }, {
                $push: {
                    subtaskstime: {
                        sub_task_id, sub_task_name, sub_task_assignee, sub_task_time: ''
                    }
                }
            });

            const lead_data = await leadModel.findOneAndUpdate({ lead_id: lead_id , org_id:org_id}, {
                $push: {
                    lead_update_track: {
                        username: check_user.username, role: check_user.role,
                        message: `has created new subtask ${sub_task_name} in task ${check_task.task_name}.`,
                        updated_date: new Date()
                    }
                }
            });
            
             if (sub_task_assignee !== '') {
                    const find_user = await registerModel.findOne({ organization: lead_data.org_id, username: sub_task_assignee });
                    const find_reporter = await registerModel.find({organization:lead_data.org_id, username: sub_task_reporter})
                 await send_mail_subtask(find_user.email, sub_task_assignee, sub_task_name, lead_data.name, estimated_sub_task_end_date, sub_task_priority, sub_task_status, sub_task_reporter,find_reporter.email ,req.user.username, check_task.task_name,"lead");
                }
            responseData(res, "Sub Task added successfully", 200, true, "", []);
        } else {
            responseData(res, "", 404, false, "Sub Task not added", []);
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

export const createLeadSubTask = async (req, res) => {
    try {
        const org_id = req.body.org_id;
        const user_id = req.body.user_id;
        const lead_id = req.body.lead_id;
        const task_id = req.body.task_id;
        const sub_task_name = req.body.sub_task_name;
        const sub_task_description = req.body.sub_task_description; 
        const actual_sub_task_start_date = req.body.actual_sub_task_start_date;
        // const estimated_sub_task_start_date = req.body.estimated_sub_task_start_date;   
        const estimated_sub_task_end_date = req.body.estimated_sub_task_end_date;
        const actual_sub_task_end_date = req.body.actual_sub_task_end_date;
        const sub_task_status = req.body.sub_task_status;
        const sub_task_priority = req.body.sub_task_priority;
        const sub_task_assignee = req.body.sub_task_assignee;
        const sub_task_reporter = req.body.sub_task_reporter;

        // if(sub_task_assignee === sub_task_reporter)
        // {
        //     return responseData(res, "", 404, false, "The  subtask assignee and the person who reported the  subtask should not be the same.", []);
        // }

        if (!user_id) return responseData(res, "", 404, false, "User Id required", []);
        if (!lead_id) return responseData(res, "", 404, false, "Lead Id required", []);
        if (!task_id) return responseData(res, "", 404, false, "Task Id required", []);
        if (!sub_task_name || !onlyAlphabetsValidation(sub_task_name) || sub_task_name.length <= 3)
            return responseData(res, "", 404, false, "Subtask Name should be alphabets and more than 3 characters", []);
        if (!sub_task_priority) return responseData(res, "", 404, false, "Subtask priority required", []);
        // if (!estimated_sub_task_start_date) return responseData(res, "", 404, false, "Subtask start date required", []);
        if (!estimated_sub_task_end_date) return responseData(res, "", 404, false, "Subtask end date required", []);
        if (!sub_task_status) return responseData(res, "", 404, false, "Subtask status required", []);
        if (!org_id) return responseData(res, "", 404, false, "Org Id required", []);
        // Check if user exists
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const check_user = await registerModel.findOne({ _id: user_id, organization: org_id });
        if (!check_user) return responseData(res, "", 404, false, "User not found", []);

        // Check if lead exists
        const check_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id });
        if (!check_lead) return responseData(res, "", 404, false, "Lead not found", []);

        // Check if task exists
        const check_task = await leadTaskModel.findOne({ task_id: task_id, lead_id: lead_id, org_id:  org_id });
        if (!check_task) return responseData(res, "", 404, false, "Task not found", []);
        if (check_task.task_status === 'Cancelled') return responseData(res, "", 400, false, "The task has been canceled", []);

        // Ensure user is authorize
        const isNotAssigneeOrCreator = ![check_task.task_assignee, check_task.task_createdBy].includes(check_user.username);
        const isNotAdminOrSuperadmin = !['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);

        if (isNotAssigneeOrCreator && isNotAdminOrSuperadmin) {
            return responseData(res, "", 400, false, "You are not authorized to create this subtask", []);
        }

        // Check if subtask assignee exists
        let check_assignee = {};

        if(sub_task_assignee !== '') {
            check_assignee = await registerModel.findOne({ username: sub_task_assignee, status: true, organization:org_id });
            if (!check_assignee) return responseData(res, "", 404, false, "Subtask assignee is not a registered user", []);
        }

        // Check if subtask reporter exists
        let check_reporter = {}

        if(sub_task_reporter !== '') {
            check_reporter = await registerModel.findOne({ username: sub_task_reporter, status: true, organization: org_id });
            if (!check_reporter) return responseData(res, "", 404, false, "Subtask reporter is not a registered user", []);
        }

        // Handle role-based project assignment checks
        const isSeniorOrAdmin = (user) => {
            if(!user || user == {}) {
                return false;
            }
            return ['Senior Architect', 'ADMIN'].includes(user.role)
        };

        if (isSeniorOrAdmin(check_assignee) && isSeniorOrAdmin(check_reporter)) {
            // Subtask can be created directly
            await createSubTaskAndTimer({
                org_id, lead_id, task_id, sub_task_name, sub_task_description,
                estimated_sub_task_end_date,
                actual_sub_task_start_date, actual_sub_task_end_date,
                sub_task_status, sub_task_priority, sub_task_assignee,
                sub_task_reporter, check_user, check_task
            }, res, req);
        }

        else if (isSeniorOrAdmin(check_assignee) && !isSeniorOrAdmin(check_reporter)) {
            if(sub_task_reporter !== '') {
                const isReporterInLead = check_reporter.data[0].leadData.some(item => item.lead_id === lead_id);
                if (!isReporterInLead) return responseData(res, "", 404, false, "Subtask reporter is not part of this lead", []);
            }
            await createSubTaskAndTimer({
                org_id, lead_id, task_id, sub_task_name, sub_task_description,
                estimated_sub_task_end_date,
                actual_sub_task_start_date, actual_sub_task_end_date,
                sub_task_status, sub_task_priority, sub_task_assignee,
                sub_task_reporter, check_user, check_task
            }, res, req);
        }

        else if (!isSeniorOrAdmin(check_assignee) && isSeniorOrAdmin(check_reporter)) {
            if(sub_task_assignee !== '') {
                const isAssigneeInLead = check_assignee.data[0].leadData.some(item => item.lead_id === lead_id);
                if (!isAssigneeInLead) return responseData(res, "", 404, false, "Subtask assignee is not part of this lead", []);
            }
            await createSubTaskAndTimer({
                org_id, lead_id, task_id, sub_task_name, sub_task_description,
                estimated_sub_task_end_date,
                actual_sub_task_start_date, actual_sub_task_end_date,
                sub_task_status, sub_task_priority, sub_task_assignee,
                sub_task_reporter, check_user, check_task
            }, res,req);
        }
        else {
            // Ensure both assignee and reporter are part of the lead
            if(sub_task_assignee !== '') {
                const isAssigneeInLead= check_assignee.data[0].leadData.some(item => item.lead_id === lead_id);
                if (!isAssigneeInLead) return responseData(res, "", 404, false, "Subtask assignee is not part of this lead", []);
            }

            if(sub_task_reporter !== '') {
                const isReporterInLead = check_reporter.data[0].leadData.some(item => item.lead_id === lead_id);
                if (!isReporterInLead) return responseData(res, "", 404, false, "Subtask reporter is not part of this lead", []);
            }
            await createSubTaskAndTimer({
                org_id, lead_id, task_id, sub_task_name, sub_task_description,
                estimated_sub_task_end_date,
                actual_sub_task_start_date, actual_sub_task_end_date,
                sub_task_status, sub_task_priority, sub_task_assignee,
                sub_task_reporter, check_user, check_task
            }, res,req);
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

export const getAllLeadSubTask = async (req, res) => {

    try {
        const user_id = req.query.user_id;
        const lead_id = req.query.lead_id;
        const task_id = req.query.task_id;
        const org_id =req.query.org_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!lead_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }

        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        else {

            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }
            const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id })
                if (!check_lead) {
                    responseData(res, "", 404, false, "Lead not found", [])
                }
                else {
                    const check_task = await leadTaskModel.findOne({ task_id: task_id, org_id: org_id })
                    if (!check_task) {
                        responseData(res, "Task not found", 200, false, "", [])
                    }
                    else {
                        let response = []
                        let count = 0;
                        for (let i = 0; i < check_task.subtasks.length; i++) {


                            response.push({
                                task_id: task_id,
                                sub_task_id: check_task.subtasks[i].sub_task_id,
                                sub_task_name: check_task.subtasks[i].sub_task_name,
                                sub_task_description: check_task.subtasks[i].sub_task_description,
                                actual_sub_task_start_date: check_task.subtasks[i].actual_sub_task_start_date ?? null,
                                actual_sub_task_end_date: check_task.subtasks[i].actual_sub_task_end_date ?? null,
                                // estimated_sub_task_start_date: check_task.subtasks[i].estimated_sub_task_start_date ?? null,
                                estimated_sub_task_end_date: check_task.subtasks[i].estimated_sub_task_end_date,
                                sub_task_status: check_task.subtasks[i].sub_task_status,
                                sub_task_priority: check_task.subtasks[i].sub_task_priority,
                                sub_task_assignee: check_task.subtasks[i].sub_task_assignee,
                                sub_task_createdBy: check_task.subtasks[i].sub_task_createdBy,
                                sub_task_createdOn: check_task.subtasks[i].sub_task_createdOn,
                                sub_task_reporter: check_task.subtasks[i].sub_task_reporter,
                                remark: check_task.subtasks[i].remark

                            })
                        }
                        responseData(res, "All sub task fetch successfully", 200, false, "", response)
                    }
                }
            }

        }
    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}

export const getSingleLeadSubTask = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        const lead_id = req.query.lead_id;
        const task_id = req.query.task_id;
        const sub_task_id = req.query.sub_task_id;
        const org_id = req.query.org_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!lead_id) {
            responseData(res, "", 404, false, "Lead Id required", [])
        }

        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!sub_task_id) {
            responseData(res, "", 404, false, "Sub-task Id required", [])
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        else {
            const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id })
                if (!check_lead) {
                    responseData(res, "", 404, false, "Lead not found", [])
                }
                else {
                    const check_task = await leadTaskModel.findOne({ task_id: task_id, org_id: org_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const sub_task = check_task.subtasks.find(item => item.sub_task_id == sub_task_id);

                        if (!sub_task) {
                            return responseData(res, "Sub-task not found", 200, false, "", []);
                        }
                        else {
                            return responseData(res, "Sub-task fetched successfully", 200, true, "", sub_task);
                        }

                    }
                }
            }
        }

    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}


export const updateLeadSubTask = async (req, res) => {
    try {
        const {
            org_id,
            user_id,
            lead_id,
            task_id,
            sub_task_id,
            sub_task_name,
            sub_task_description,
            actual_sub_task_start_date,
            // estimated_sub_task_start_date,
            estimated_sub_task_end_date,
            actual_sub_task_end_date,
            sub_task_status,
            sub_task_priority,
            sub_task_assignee,
            sub_task_reporter,
            remark
        } = req.body;

        // Validation checks
        const requiredFields = [
            {key:org_id, message:"Org Id required"},
            { key: user_id, message: "User Id required" },
            { key: lead_id, message: "Lead Id required" },
            { key: task_id, message: "Task Id required" },
            { key: sub_task_id, message: "Sub-task Id required" },
            { key: sub_task_name && onlyAlphabetsValidation(sub_task_name) && sub_task_name.length > 3, message: "Sub task Name should be alphabets and longer than 3 characters" },
            { key: sub_task_priority, message: "Sub task priority required" },
            // { key: estimated_sub_task_start_date, message: "Sub task start date required" },
            { key: estimated_sub_task_end_date, message: "Sub task end date required" },
            { key: sub_task_status, message: "Sub task status required" },
            // { key: sub_task_assignee, message: "Sub task assignee required" },
            // { key: sub_task_reporter, message: "Sub task reporter required" }
        ];

        for (let field of requiredFields) {
            if (!field.key) {
                return responseData(res, "", 404, false, field.message, []);
            }
        }

        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const check_user = await registerModel.findOne({_id:user_id, organization: org_id});
        if (!check_user) {
            return responseData(res, "", 404, false, "User not found", []);
        }

        const check_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id });
        if (!check_lead) {
            return responseData(res, "", 404, false, "Lead not found", []);
        }

        const check_task = await leadTaskModel.findOne({ task_id, lead_id, org_id });
        if (!check_task) {
            return responseData(res, "", 404, false, "Task not found", []);
        }

        const check_sub_task = check_task.subtasks.find((subtask) => subtask.sub_task_id === sub_task_id);

        if (!check_sub_task) {
            return responseData(res, "", 404, false, "Sub task not found", []);
        }

        if (check_task.task_status === 'Cancelled') {
            return responseData(res, "", 400, false, "The task has been canceled");
        }

        let isTask_assigneeAuthorized = true;

        if(check_task.task_assignee) {
            isTask_assigneeAuthorized = [check_task.task_assignee].includes(check_user.username) || ['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);
            if(!isTask_assigneeAuthorized && check_sub_task.sub_task_assignee) {
                isTask_assigneeAuthorized = [check_sub_task.sub_task_assignee].includes(check_user.username) || ['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);
            }
            // if (!isTask_assigneeAuthorized) {
            //     return responseData(res, "", 404, false, "You are not authorized to update this sub-task", []);
            // }
        }

        let isTask_createdByAuthorized = true;

        if(check_task.task_createdBy) {
            isTask_createdByAuthorized = [check_task.task_createdBy].includes(check_user.username) || ['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);
            if(!isTask_createdByAuthorized && check_sub_task.sub_task_createdBy) {
                isTask_createdByAuthorized = [check_sub_task.sub_task_createdBy].includes(check_user.username) || ['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);
            }
            // if (!isTask_createdByAuthorized) {
            //     return responseData(res, "", 404, false, "You are not authorized to update this sub-task", []);
            // }
        }

        if (!isTask_createdByAuthorized && !isTask_assigneeAuthorized) {
            return responseData(res, "", 404, false, "You are not authorized to update this sub-task", []);
        }
        

        // Use ternary operator to set `date` based on the conditions
        let date = (sub_task_status === 'Completed' && (estimated_sub_task_end_date === '' || estimated_sub_task_end_date == null))
            ? new Date()
            : estimated_sub_task_end_date;

      
        const previous_sub_task_assignee = check_task.subtasks.find(item => item.sub_task_id === sub_task_id).sub_task_assignee;

        const updateFields = {
            "subtasks.$.sub_task_name": sub_task_name,
            "subtasks.$.sub_task_description": sub_task_description,
            // "subtasks.$.estimated_sub_task_start_date": estimated_sub_task_start_date,
            "subtasks.$.estimated_sub_task_end_date": date,
            "subtasks.$.actual_sub_task_start_date": actual_sub_task_start_date,
            "subtasks.$.actual_sub_task_end_date": actual_sub_task_end_date,
            "subtasks.$.sub_task_status": sub_task_status,
            "subtasks.$.sub_task_priority": sub_task_priority,
            "subtasks.$.sub_task_assignee": sub_task_assignee,
            "subtasks.$.sub_task_reporter": sub_task_reporter
        };

        const updatePushFields = {
            "subtasks.$.sub_task_updatedBy": {
                sub_task_updatedBy: check_user.username,
                role: check_user.role,
                sub_task_updatedOn: new Date()
            }
        };

        if (sub_task_status === 'Under Revision' && !remark) {
            return responseData(res, "", 404, false, "Please enter a remark", []);
        }

        if (remark) {
            updatePushFields["subtasks.$.remark"] = {
                remark,
                remark_by: check_user.username,
                remark_date: new Date()
            };
        }

        const update_subtask = await leadTaskModel.findOneAndUpdate(
            { task_id, lead_id, org_id, "subtasks.sub_task_id": sub_task_id },
            { $set: updateFields, $push: updatePushFields },
            { new: true, useFindAndModify: false }
        );

        if (!update_subtask) {
            return responseData(res, "", 404, false, "Sub Task Not Updated", []);
        }

        const lead_data=await leadModel.findOneAndUpdate(
            { lead_id, org_id },
            {
                $push: {
                    lead_update_track: {
                        username: check_user.username,
                        role: check_user.role,
                        message: ` has updated subtask ${sub_task_name} in task ${check_task.task_name}.`,
                        updated_date: new Date()
                    }
                }
            }
        );
        if (sub_task_assignee && sub_task_assignee !== previous_sub_task_assignee) {
                    const find_user = await registerModel.findOne({ organization: org_id, username: sub_task_assignee });
                    const find_reporter = await registerModel.findOne({organization: org_id, username: sub_task_reporter})
            await send_mail_subtask(find_user.email, sub_task_assignee, sub_task_name, lead_data.name, estimated_sub_task_end_date, sub_task_priority, sub_task_status, sub_task_reporter,find_reporter.email ,req.user.username, check_task.task_name,"lead");
        
                }

        if (['Completed', 'Cancelled'].includes(sub_task_status)) {
            const find_timer = await leadTimerModel.findOne({
                task_id,
                lead_id,
                org_id,
                'subtaskstime.sub_task_id': sub_task_id
            });

            if (find_timer) {
                for (let subtask of find_timer.subtaskstime) {
                    if (subtask.sub_task_id.toString() === sub_task_id.toString() && subtask.sub_task_isrunning) {
                        const current_time = new Date().getTime();
                        const diff = parseInt(current_time) - parseInt(subtask.sub_task_current);
                        const total_time =parseInt(subtask.sub_task_time) + diff;

                        await leadTimerModel.findOneAndUpdate(
                            {
                                task_id,
                                lead_id,
                                org_id,
                                'subtaskstime.sub_task_id': sub_task_id
                            },
                            {
                                $set: {
                                    'subtaskstime.$.sub_task_isrunning': false,
                                    'subtaskstime.$.sub_task_current': current_time,
                                    'subtaskstime.$.sub_task_time': total_time
                                }
                            },
                            { new: true, useFindAndModify: false }
                        );
                        break;
                    }
                }
            }
        }

        responseData(res, "Sub Task Updated Successfully", 200, true, "", []);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};



export const deleteLeadSubTask = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const lead_id = req.body.lead_id;
        const task_id = req.body.task_id;
        const sub_task_id = req.body.sub_task_id;
        const org_id= req.body.org_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!lead_id) {
            responseData(res, "", 404, false, "Lead Id required", [])
        }

        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!sub_task_id) {
            responseData(res, "", 404, false, "Sub-task Id required", [])
        }
        else if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        else {
            const check_org = await orgModel.findOne({ _id: org_id })
            if (!check_org) {
                return responseData(res, "", 404, false, "Org not found");
            }
            const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
            if (!check_user) {
                responseData(res, "", 404, false, "User not found", [])
            }
            else {
                const check_lead = await leadModel.findOne({ lead_id: lead_id, org_id:org_id })
                if (!check_lead) {
                    responseData(res, "", 404, false, "Lead not found", [])
                }
                else {
                    const check_task = await leadTaskModel.findOne({ task_id: task_id, lead_id: lead_id,org_id: org_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const check_subtask = check_task.subtasks.find((subtask) => subtask.sub_task_id == sub_task_id)
                        await leadModel.findOneAndUpdate({ lead_id: lead_id },
                            {
                                $push: {
                                    lead_update_track: {
                                        username: check_user.username,
                                        role: check_user.role,
                                        message: ` has deleted subtask ${check_subtask.sub_task_name} in task ${check_task.task_name}.`,
                                        updated_date: new Date()
                                    }
                                }
                            }
                        )
                        const delete_subtask = await leadTaskModel.findOneAndUpdate({
                            task_id: task_id,
                            lead_id: lead_id,
                            org_id:org_id,
                            "subtasks.sub_task_id": sub_task_id
                        },
                            {
                                $pull: { "subtasks": { "sub_task_id": sub_task_id } },


                            },


                            { new: true }
                        )
                        if (delete_subtask) {
                            responseData(res, "Sub Task Deleted Successfully", 200, true, "", [])
                        }
                        else {
                            responseData(res, "", 404, false, "Sub Task Not Deleted", [])
                        }
                    }
                }
            }
        }


    }
    catch (err) {
        console.log(err);
        res.send(err);
    }
}
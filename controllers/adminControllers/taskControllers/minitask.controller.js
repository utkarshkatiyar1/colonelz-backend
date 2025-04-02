import { responseData } from "../../../utils/respounse.js";
import registerModel from "../../../models/usersModels/register.model.js";
import projectModel from "../../../models/adminModels/project.model.js";
import taskModel from "../../../models/adminModels/task.model.js";
import { onlyAlphabetsValidation } from "../../../utils/validation.js";
import timerModel from "../../../models/adminModels/timer.Model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import {send_mail_minitask } from "../../../utils/mailtemplate.js";


function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}
const createMiniTaskAndTimer = async (data, res, req) => {
    try {
        const {org_id, project_id, task_id, mini_task_name, mini_task_description,
             estimated_mini_task_end_date,
             mini_task_status, mini_task_priority, mini_task_assignee, mini_task_reporter, check_user, check_task } = data;

        const mini_task_id = `STK-${generateSixDigitNumber()}`;


        // console.log(task_id)
        // console.log(project_id)
        // console.log(org_id)

        const update_task = await taskModel.findOneAndUpdate({ task_id: task_id, project_id: project_id, org_id: org_id }, {
            $push: {
                minitasks: {
                    mini_task_id, mini_task_name, mini_task_description,
                    estimated_mini_task_end_date,
                    
                    mini_task_status, mini_task_priority, mini_task_assignee,
                    mini_task_createdBy: check_user.username, mini_task_createdOn: new Date(),
                    mini_task_reporter
                }
            }
        }, { new: true, useFindAndModify: false });
        // console.log(update_task)

        if (update_task) {
            await timerModel.findOneAndUpdate({ project_id: project_id, task_id: task_id, org_id:org_id }, {
                $push: {
                    minitaskstime: {
                        mini_task_id, mini_task_name, mini_task_assignee, mini_task_time: ''
                    }
                }
            });

            const project_data = await projectModel.findOneAndUpdate({ project_id: project_id , org_id:org_id}, {
                $push: {
                    project_updated_by: {
                        username: check_user.username, role: check_user.role,
                        message: `has created new minitask ${mini_task_name} in task ${check_task.task_name}.`,
                        updated_date: new Date()
                    }
                }
            });

            if (mini_task_assignee !== '') {
                    const find_user = await registerModel.findOne({ organization: project_data.org_id, username: mini_task_assignee });
                    const find_reporter = await registerModel.findOne({organization: project_data.org_id, username: mini_task_reporter})
                await send_mail_minitask(find_user.email, mini_task_assignee, mini_task_name, project_data.project_name, estimated_mini_task_end_date, mini_task_priority, mini_task_status, mini_task_reporter, find_reporter.email,req.user.username, check_task.task_name,"project");
                }

            responseData(res, "mini Task added successfully", 200, true, "", []);
        } else {
            responseData(res, "", 404, false, "mini Task not added", []);
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

export const createMiniTask = async (req, res) => {
    try {
        const org_id = req.body.org_id;
        const user_id = req.body.user_id;
        const project_id = req.body.project_id;
        const task_id = req.body.task_id;
        const mini_task_name = req.body.mini_task_name;
        const mini_task_description = req.body.mini_task_description;
        const estimated_mini_task_end_date = req.body.estimated_mini_task_end_date;
        const mini_task_status = req.body.mini_task_status;
        const mini_task_priority = req.body.mini_task_priority;
        const mini_task_assignee = req.body.mini_task_assignee;
        const mini_task_reporter = req.body.mini_task_reporter;

        // if(mini_task_assignee === mini_task_reporter)
        // {
        //     return responseData(res, "", 404, false, "The  minitask assignee and the person who reported the  minitask should not be the same.", []);
        // }

        if (!user_id) return responseData(res, "", 404, false, "User Id required", []);
        if (!project_id) return responseData(res, "", 404, false, "Project Id required", []);
        if (!task_id) return responseData(res, "", 404, false, "Task Id required", []);
        if (!mini_task_name || !onlyAlphabetsValidation(mini_task_name) || mini_task_name.length <= 3)
            return responseData(res, "", 404, false, "minitask Name should be alphabets and more than 3 characters", []);
        if (!estimated_mini_task_end_date) return responseData(res, "", 404, false, "minitask end date required", []);
        // if (!mini_task_status) return responseData(res, "", 404, false, "minitask status required", []);
        if (!org_id) return responseData(res, "", 404, false, "Org Id required", []);
        // Check if user exists
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const check_user = await registerModel.findOne({ _id: user_id, organization: org_id });
        if (!check_user) return responseData(res, "", 404, false, "User not found", []);

        // Check if project exists
        const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
        if (!check_project) return responseData(res, "", 404, false, "Project not found", []);

        // Check if task exists
        const check_task = await taskModel.findOne({ task_id: task_id, project_id: project_id, org_id:  org_id });
        if (!check_task) return responseData(res, "", 404, false, "Task not found", []);
        if (check_task.task_status === 'Cancelled') return responseData(res, "", 400, false, "The task has been canceled", []);

        // Ensure user is authorize
        const isNotAssigneeOrCreator = ![check_task.task_assignee, check_task.task_createdBy].includes(check_user.username);
        const isNotAdminOrSuperadmin = !['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);

        if (isNotAssigneeOrCreator && isNotAdminOrSuperadmin) {
            return responseData(res, "", 400, false, "You are not authorized to create this minitask", []);
        }

        // Check if minitask assignee exist
        let check_assignee = {};

        if(mini_task_assignee && mini_task_assignee !== '') {
            check_assignee = await registerModel.findOne({ username: mini_task_assignee, status: true, organization:org_id });
            if (!check_assignee) return responseData(res, "", 404, false, "minitask assignee is not a registered user", []);
        }
       

        // Handle role-based project assignment checks
        const isSeniorOrAdmin = (user) => {
            if(!user || user == {}) {
                return false;
            }
            return ['Senior Architect', 'SUPERADMIN', 'ADMIN'].includes(user.role)
        };

        if (isSeniorOrAdmin(check_assignee)) {
            // minitask can be created directly

            await createMiniTaskAndTimer({
                org_id, project_id, task_id, mini_task_name, mini_task_description,
                 
                estimated_mini_task_end_date,
                mini_task_status, mini_task_priority, mini_task_assignee,
                mini_task_reporter, check_user, check_task
            }, res, req);
        }

        else {
            if(mini_task_assignee !== '') {
                const isAssigneeInProject = check_assignee.data[0].projectData.some(item => item.project_id === project_id);
                if (!isAssigneeInProject) return responseData(res, "", 404, false, "minitask assignee is not part of this project", []);
            }
            await createMiniTaskAndTimer({
               org_id, project_id, task_id, mini_task_name, mini_task_description,
                
                estimated_mini_task_end_date,
                mini_task_status, mini_task_priority, mini_task_assignee,
                mini_task_reporter, check_user, check_task
            }, res,req);
        }
       
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

export const getAllMiniTask = async (req, res) => {

    try {
        const user_id = req.query.user_id;
        const project_id = req.query.project_id;
        const task_id = req.query.task_id;
        const org_id =req.query.org_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
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
                const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id, org_id: org_id })
                    if (!check_task) {
                        responseData(res, "Task not found", 200, false, "", [])
                    }
                    else {
                        let response = []
                        let count = 0;
                        for (let i = 0; i < check_task.minitasks.length; i++) {


                            response.push({
                                task_id: task_id,
                                mini_task_id: check_task.minitasks[i].mini_task_id,
                                mini_task_name: check_task.minitasks[i].mini_task_name,
                                mini_task_description: check_task.minitasks[i].mini_task_description,
                                estimated_mini_task_end_date: check_task.minitasks[i].estimated_mini_task_end_date,
                                mini_task_status: check_task.minitasks[i].mini_task_status,
                                mini_task_priority: check_task.minitasks[i].mini_task_priority,
                                mini_task_assignee: check_task.minitasks[i].mini_task_assignee,
                                mini_task_createdBy: check_task.minitasks[i].mini_task_createdBy,
                                mini_task_createdOn: check_task.minitasks[i].mini_task_createdOn,
                                mini_task_reporter: check_task.minitasks[i].mini_task_reporter,
                                mini_task_note: check_task.minitasks[i]?.mini_task_note || '',
                                remark: check_task.minitasks[i].remark

                            })
                        }
                        responseData(res, "All Mini task fetch successfully", 200, false, "", response)
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

export const getSingleMiniTask = async (req, res) => {
    try {
        const user_id = req.query.user_id;
        const project_id = req.query.project_id;
        const task_id = req.query.task_id;
        const mini_task_id = req.query.mini_task_id;
        const org_id = req.query.org_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }

        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!mini_task_id) {
            responseData(res, "", 404, false, "Mini-task Id required", [])
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
                const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id, org_id: org_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const mini_task = check_task.minitasks.find(item => item.mini_task_id == mini_task_id);

                        if (!mini_task) {
                            return responseData(res, "mini-task not found", 200, false, "", []);
                        }
                        else {
                            return responseData(res, "mini-task fetched successfully", 200, true, "", mini_task);
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


export const updateMiniTask = async (req, res) => {
    try {
        const {
            org_id,
            user_id,
            project_id,
            task_id,
            mini_task_id,
            mini_task_name,
            mini_task_description,
            mini_task_note,
            estimated_mini_task_end_date,
            mini_task_status,
            mini_task_priority,
            mini_task_assignee,
            mini_task_reporter,
            remark
        } = req.body;

        // Validation checks
        const requiredFields = [
            {key:org_id, message:"Org Id required"},
            { key: user_id, message: "User Id required" },
            { key: project_id, message: "Project Id required" },
            { key: task_id, message: "Task Id required" },
            { key: mini_task_id, message: "mini-task Id required" },
            { key: mini_task_name && onlyAlphabetsValidation(mini_task_name) && mini_task_name.length > 3, message: "mini task Name should be alphabets and longer than 3 characters" },
            { key: mini_task_priority, message: "mini task priority required" },
            { key: estimated_mini_task_end_date, message: "mini task end date required" },
            { key: mini_task_status, message: "mini task status required" },
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

        const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
        if (!check_project) {
            return responseData(res, "", 404, false, "Project not found", []);
        }

        const check_task = await taskModel.findOne({ task_id, project_id, org_id });

        
        
        if (!check_task) {
            return responseData(res, "", 404, false, "Task not found", []);
        }
        const check_mini_task = check_task.minitasks.find((minitask) => minitask.mini_task_id === mini_task_id);

        if (!check_mini_task) {
            return responseData(res, "", 404, false, "mini task not found", []);
        }

        if (check_task.task_status === 'Cancelled') {
            return responseData(res, "", 400, false, "The task has been canceled");
        }

        let isTask_assigneeAuthorized = true;

        if(check_task.task_assignee) {

            isTask_assigneeAuthorized = [check_task.task_assignee].includes(check_user.username) || ['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);
            if(!isTask_assigneeAuthorized && check_mini_task.mini_task_assignee) {
                isTask_assigneeAuthorized = [check_mini_task.mini_task_assignee].includes(check_user.username) || ['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);
            }
            // if (!isTask_assigneeAuthorized) {
            //     return responseData(res, "", 404, false, "You are not authorized to update this mini-task", []);
            // }
        }

        let isTask_createdByAuthorized = true;

        if(check_task.task_createdBy) {
             isTask_createdByAuthorized = [check_task.task_createdBy].includes(check_user.username) || ['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);


             if(!isTask_createdByAuthorized && check_mini_task.mini_task_createdBy) {
                isTask_createdByAuthorized = [check_mini_task.mini_task_createdBy].includes(check_user.username) || ['ADMIN', 'SUPERADMIN', 'Senior Architect',].includes(check_user.role);
            }

            // if (!isTask_createdByAuthorized) {
            //     return responseData(res, "", 404, false, "You are not authorized to update this mini-task", []);
            // }
        }

        

        if (!isTask_createdByAuthorized && !isTask_assigneeAuthorized) {
            return responseData(res, "", 404, false, "You are not authorized to update this mini-task", []);
        }


        const previous_mini_task_assignee = check_task.minitasks.find(item => item.mini_task_id === mini_task_id).mini_task_assignee;


      


        const updateFields = {
            "minitasks.$.mini_task_name": mini_task_name,
            "minitasks.$.mini_task_description": mini_task_description,
            "minitasks.$.mini_task_note": mini_task_note || "",
            "minitasks.$.estimated_mini_task_end_date": estimated_mini_task_end_date,
            "minitasks.$.mini_task_status": mini_task_status,
            "minitasks.$.mini_task_priority": mini_task_priority,
            "minitasks.$.mini_task_assignee": mini_task_assignee,
            "minitasks.$.mini_task_reporter": mini_task_reporter
        };

        const updatePushFields = {
            "minitasks.$.mini_task_updatedBy": {
                mini_task_updatedBy: check_user.username,
                role: check_user.role,
                mini_task_updatedOn: new Date()
            }
        };

        if (mini_task_status === 'Under Revision' && !remark) {
            return responseData(res, "", 404, false, "Please enter a remark", []);
        }

        if (remark) {
            updatePushFields["minitasks.$.remark"] = {
                remark,
                remark_by: check_user.username,
                remark_date: new Date()
            };
        }

        const update_minitask = await taskModel.findOneAndUpdate(
            { task_id, project_id, org_id, "minitasks.mini_task_id": mini_task_id },
            { $set: updateFields, $push: updatePushFields },
            { new: true, useFindAndModify: false }
        );

        if (!update_minitask) {
            return responseData(res, "", 404, false, "mini Task Not Updated", []);
        }

       const project_data= await projectModel.findOneAndUpdate(
            { project_id, org_id },
            {
                $push: {
                    project_updated_by: {
                        username: check_user.username,
                        role: check_user.role,
                        message: ` has updated minitask ${mini_task_name} in task ${check_task.task_name}.`,
                        updated_date: new Date()
                    }
                }
            }
        );
      

        if (mini_task_assignee && mini_task_assignee !== previous_mini_task_assignee) {
            const find_user = await registerModel.findOne({ organization: project_data.org_id, username: mini_task_assignee });
            const find_reporter = await registerModel.findOne({organization:project_data.org_id, username:mini_task_reporter})

            await send_mail_minitask(find_user.email, mini_task_assignee, mini_task_name, project_data.project_name, estimated_mini_task_end_date, mini_task_priority, mini_task_status, mini_task_reporter, find_reporter.email,req.user.username, check_task.task_name,"project");

        }

        if (['Completed', 'Cancelled'].includes(mini_task_status)) {
            const find_timer = await timerModel.findOne({
                task_id,
                project_id,
                org_id,
                'minitaskstime.mini_task_id': mini_task_id
            });

            if (find_timer) {
                for (let minitask of find_timer.minitaskstime) {
                    if (minitask.mini_task_id.toString() === mini_task_id.toString() && minitask.mini_task_isrunning) {
                        const current_time = new Date().getTime();
                        const diff = parseInt(current_time) - parseInt(minitask.mini_task_current);
                        const total_time =parseInt(minitask.mini_task_time) + diff;

                        await timerModel.findOneAndUpdate(
                            {
                                task_id,
                                project_id,
                                org_id,
                                'minitaskstime.mini_task_id': mini_task_id
                            },
                            {
                                $set: {
                                    'minitaskstime.$.mini_task_isrunning': false,
                                    'minitaskstime.$.mini_task_current': current_time,
                                    'minitaskstime.$.mini_task_time': total_time
                                }
                            },
                            { new: true, useFindAndModify: false }
                        );
                        break;
                    }
                }
            }
        }


        responseData(res, "mini Task Updated Successfully", 200, true, "", []);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};



export const deleteMiniTask = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const project_id = req.body.project_id;
        const task_id = req.body.task_id;
        const mini_task_id = req.body.mini_task_id;
        const org_id= req.body.org_id;
        if (!user_id) {
            responseData(res, "", 404, false, "User Id required", [])
        }
        else if (!project_id) {
            responseData(res, "", 404, false, "Project Id required", [])
        }

        else if (!task_id) {
            responseData(res, "", 404, false, "Task Id required", [])
        }
        else if (!mini_task_id) {
            responseData(res, "", 404, false, "mini-task Id required", [])
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
                const check_project = await projectModel.findOne({ project_id: project_id, org_id:org_id })
                if (!check_project) {
                    responseData(res, "", 404, false, "Project not found", [])
                }
                else {
                    const check_task = await taskModel.findOne({ task_id: task_id, project_id: project_id,org_id: org_id })
                    if (!check_task) {
                        responseData(res, "", 404, false, "Task not found", [])
                    }
                    else {
                        const check_minitask = check_task.minitasks.find((minitask) => minitask.mini_task_id == mini_task_id)
                        await projectModel.findOneAndUpdate({ project_id: project_id },
                            {
                                $push: {
                                    project_updated_by: {
                                        username: check_user.username,
                                        role: check_user.role,
                                        message: ` has deleted minitask ${check_minitask.mini_task_name} in task ${check_task.task_name}.`,
                                        updated_date: new Date()
                                    }
                                }
                            }
                        )
                        const delete_minitask = await taskModel.findOneAndUpdate({
                            task_id: task_id,
                            project_id: project_id,
                            org_id:org_id,
                            "minitasks.mini_task_id": mini_task_id
                        },
                            {
                                $pull: { "minitasks": { "mini_task_id": mini_task_id } },


                            },


                            { new: true }
                        )
                        if (delete_minitask) {
                            responseData(res, "mini Task Deleted Successfully", 200, true, "", [])
                        }
                        else {
                            responseData(res, "", 404, false, "mini Task Not Deleted", [])
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
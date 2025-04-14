import projectModel from "../../../models/adminModels/project.model.js";
import projectExecutionModel from "../../../models/adminModels/project_execution_model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import { responseData } from "../../../utils/respounse.js";


function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}

export const createProjectExecutionSubtask = async (req, res) => {
    try {
        const { org_id, project_id, task_id, subtask_name, subtask_start_date, subtask_end_date, color } = req.body;
        if (!org_id) {
            return responseData(res, "", 400, false, "Org id is required", []);
        }
        else if (!project_id) {
            return responseData(res, "", 400, false, "Project id is required", []);
        }
        else if (!task_id) {
            return responseData(res, "", 400, false, "Task id is required", []);
        }
        else if (!subtask_name) {
            return responseData(res, "", 400, false, "Subtask name is required", []);
        }
        else if (!subtask_start_date) {
            return responseData(res, "", 400, false, "Subtask start date is required", []);
        }
        else if (!subtask_end_date) {
            return responseData(res, "", 400, false, "Subtask end date is required", []);
        }
        else {
            const subtask_id = `STK${generateSixDigitNumber()}`;
            const check_org = await orgModel.findOne({ _id: org_id });
            if (!check_org) {
                return responseData(res, "", 400, false, "Org not found", []);
            }
            const check_project = await projectModel.findOne({ project_id: project_id, org_id: org_id });
            if (!check_project) {
                return responseData(res, "", 400, false, "Project not found", []);
            }
            const check_task = await projectExecutionModel.findOne({ task_id: task_id, project_id: project_id, org_id: org_id });
            if (!check_task) {
                return responseData(res, "", 400, false, "Task not found", []);
            }
            const create_subtask = await projectExecutionModel.updateOne({ task_id: task_id, project_id: project_id, org_id: org_id }, { $push: { subtasks: { sub_task_id: subtask_id, sub_task_name: subtask_name, sub_task_start_date: subtask_start_date, sub_task_end_date: subtask_end_date, color:color } } });
            if (create_subtask) {
                return responseData(res, "Subtask created successfully", 200, true, "", []);
            }
            else {
                return responseData(res, "", 400, false, "Subtask not created", []);
            }
        }
    }
    catch (err) {
        console.log(err)
        responseData(res, "", 500, false, "Internal server error", []);
    }
}


export const updateProjectExecutionSubtask = async (req, res) => {
    try {
        const {
            org_id,
            project_id,
            task_id,
            subtask_id,
            subtask_name,
            subtask_start_date,
            subtask_end_date,
            color,


            subtask_details_start_date,
            subtask_details_end_date,
            subtask_comment,
            subtask_type,
            detail_color
        } = req.body;

        if (!org_id || !project_id || !task_id || !subtask_id || !subtask_name || !subtask_start_date || !subtask_end_date) {
            return responseData(res, "", 400, false, "All required fields must be provided", []);
        }

        const check_org = await orgModel.findOne({ _id: org_id });
        if (!check_org) return responseData(res, "", 400, false, "Org not found", []);

        const check_project = await projectModel.findOne({ project_id, org_id });
        if (!check_project) return responseData(res, "", 400, false, "Project not found", []);

        const check_task = await projectExecutionModel.findOne({ task_id, project_id, org_id });
        if (!check_task) return responseData(res, "", 400, false, "Task not found", []);

        const updateObject = {
            $set: {
                'subtasks.$.sub_task_name': subtask_name,
                'subtasks.$.sub_task_start_date': subtask_start_date,
                'subtasks.$.sub_task_end_date': subtask_end_date,
                'subtasks.$.color': color
            }
        };
        if (subtask_details_start_date && subtask_details_end_date && subtask_comment && subtask_type) {
            const d_id = `DSTK-${generateSixDigitNumber()}`;
            updateObject.$push = {
                'subtasks.$.sub_task_details': {
                    subtask_details_id: d_id,
                    subtask_details_start_date,
                    subtask_details_end_date,
                    subtask_comment,
                    subtask_type,
                    color: detail_color
                }
            };
        }

        const updateSubtask = await projectExecutionModel.updateOne(
            {
                task_id,
                project_id,
                org_id,
                'subtasks.sub_task_id': subtask_id
            },
            updateObject
        );

        if (updateSubtask.modifiedCount > 0) {
            return responseData(res, "Subtask updated successfully", 200, true, "", []);
        } else {
            return responseData(res, "", 400, false, "Subtask not updated", []);
        }

    } catch (err) {
        console.error("Error updating subtask:", err);
        return responseData(res, "", 500, false, "Internal server error", []);
    }
};


export const deleteProjectExecutionSubtask = async (req, res) => {
    try {
        const { org_id, project_id, task_id, subtask_id } = req.body;

        if (!org_id || !project_id || !task_id || !subtask_id) {
            return responseData(res, "", 400, false, "All required fields must be provided", []);
        }
        const check_org = await orgModel.findOne({ _id: org_id });
        if (!check_org) return responseData(res, "", 400, false, "Org not found", []);

        const check_project = await projectModel.findOne({ project_id, org_id });
        if (!check_project) return responseData(res, "", 400, false, "Project not found", []);
        const check_task = await projectExecutionModel.findOne({ task_id, project_id, org_id });
        if (!check_task) return responseData(res, "", 400, false, "Task not found", []);

        const deleteSubtask = await projectExecutionModel.updateOne(
            { task_id, project_id, org_id },
            { $pull: { subtasks: { sub_task_id: subtask_id } } }
        );

        if (deleteSubtask.modifiedCount > 0) {

            return responseData(res, "Subtask deleted successfully", 200, true, "", []);
        }
        else {
            return responseData(res, "", 400, false, "Subtask not deleted", []);
        }

    } catch (err) {
        console.error("Error deleting subtask:", err);
        return responseData(res, "", 500, false, "Internal server error", []);
    }
}

export const deleteProjectExecutionSubtaskDetails = async (req, res) => {
    try {
        const { org_id, project_id, task_id, subtask_id, subtask_details_id } = req.body;

        if (!org_id || !project_id || !task_id || !subtask_id || !subtask_details_id) {

            return responseData(res, "", 400, false, "All required fields must be provided", []);
        }

        const check_org = await orgModel.findOne({ _id: org_id });
        if (!check_org) return responseData(res, "", 400, false, "Org not found", []);

        const check_project = await projectModel.findOne({ project_id, org_id });
        if (!check_project) return responseData(res, "", 400, false, "Project not found", []);

        const check_task = await projectExecutionModel.findOne({ task_id, project_id, org_id });
        if (!check_task) return responseData(res, "", 400, false, "Task not found", []);

        const deleteSubtaskDetails = await projectExecutionModel.updateOne(
            { task_id, project_id, org_id, 'subtasks.sub_task_id': subtask_id },
            { $pull: { 'subtasks.$.sub_task_details': { subtask_details_id } } }
        );
        if (deleteSubtaskDetails.modifiedCount > 0) {
            return responseData(res, "Subtask details deleted successfully", 200, true, "", []);
        } else {
            return responseData(res, "", 400, false, "Subtask details not deleted", []);
        }

    } catch (err) {
        console.error("Error deleting subtask details:", err);
        return responseData(res, "", 500, false, "Internal server error", []);
    }
}

export const updateProjectExecutionSubtaskDetails = async (req, res) => {
    try {
        const {
            org_id,
            project_id,
            task_id,
            subtask_id,
            subtask_details_id,
            subtask_details_start_date,
            subtask_details_end_date,
            subtask_comment,
            subtask_type,
            detail_color,
        } = req.body;

        if (!org_id || !project_id || !task_id || !subtask_id || !subtask_details_id || !subtask_details_start_date || !subtask_details_end_date) {
            return responseData(res, "", 400, false, "All required fields must be provided", []);
        }

        const check_org = await orgModel.findOne({ _id: org_id });
        if (!check_org) return responseData(res, "", 400, false, "Org not found", []);

        const check_project = await projectModel.findOne({ project_id, org_id });
        if (!check_project) return responseData(res, "", 400, false, "Project not found", []);

        const check_task = await projectExecutionModel.findOne({ task_id, project_id, org_id });
        if (!check_task) return responseData(res, "", 400, false, "Task not found", []);

        // Update with arrayFilters to access nested sub_task_details
        const updateSubtaskDetails = await projectExecutionModel.updateOne(
            {
                task_id,
                project_id,
                org_id
            },
            {
                $set: {
                    'subtasks.$[subtask].sub_task_details.$[detail].subtask_details_start_date': subtask_details_start_date,
                    'subtasks.$[subtask].sub_task_details.$[detail].subtask_details_end_date': subtask_details_end_date,
                    'subtasks.$[subtask].sub_task_details.$[detail].subtask_comment': subtask_comment,
                    'subtasks.$[subtask].sub_task_details.$[detail].subtask_type': subtask_type,
                    'subtasks.$[subtask].sub_task_details.$[detail].color': detail_color
                }
            },
            {
                arrayFilters: [
                    { 'subtask.sub_task_id': subtask_id },
                    { 'detail.subtask_details_id': subtask_details_id }
                ]
            }
        );

        if (updateSubtaskDetails.modifiedCount > 0) {
            return responseData(res, "Subtask details updated successfully", 200, true, "", []);
        } else {
            return responseData(res, "", 400, false, "Subtask details not updated", []);
        }

    } catch (err) {
        console.error("Error updating subtask details:", err);
        return responseData(res, "", 500, false, "Internal server error", []);
    }
};











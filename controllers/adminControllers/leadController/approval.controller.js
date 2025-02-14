import Approval from "../../../models/adminModels/approval.model.js";
import { responseData } from "../../../utils/respounse.js";

export const addUserToFile = async (req, res) => {
    try {
        const { user_id, org_id, lead_id, file_id } = req.body;

        if (!user_id || !org_id || !lead_id || !file_id) {
            return responseData(res, "", 400, false, "Missing required fields", []);
        }

        // Find the approval document that matches lead_id
        const approval = await Approval.findOne({ lead_id, org_id });

        if (!approval) {
            return responseData(res, "", 400, false, "Approval document not found", []);
        }

        // Find the file inside the files array that matches file_id
        const file = approval.files.find(f => f.file_id === file_id);

        if (!file) {
            return responseData(res, "", 400, false, "File not found in approval document", []);
        }

        // Add user_id to the file's users list if not already present
        if (!file.users.includes(user_id)) {
            file.users.push(user_id);
        }

        // Save the updated approval document
        await approval.save();

        return responseData(res, "", 200, true, "User added successfully", []);
    } catch (error) {
        return responseData(res, "", 500, false, "Server error", []);
    }
};

export const getFilesForUser = async (req, res) => {
    try {
        const { lead_id, org_id, user_id } = req.query;

        if (!lead_id || !org_id || !user_id) {
            return responseData(res, "", 400, true, "Missing required fields", []);
        }

        // Find the approval document that matches lead_id and org_id
        const approval = await Approval.findOne({ lead_id, org_id });

        if (!approval) {
            return responseData(res, "", 404, true, "Approval document not found", []);
        }

        // Filter files that contain the given user_id in their users list
        // const userFiles = approval.files.filter(file => file.users.includes(user_id));
        const fileIds = approval.files
            .filter(file => file.users.includes(user_id))
            .map(file => file.file_id);

        return responseData(res, "", 200, true, "Files retrieved successfully", fileIds);
    } catch (error) {
        return responseData(res, "", 500, true, "Server error", []);
    }
};
import { responseData } from "../../../utils/respounse.js";
import googleSheetsService from "../../../utils/googleSheets.service.js";
import registerModel from "../../../models/usersModels/register.model.js";
import jwt from "jsonwebtoken";

/**
 * Helper function to get user from JWT token
 */
const getUserFromToken = async (req) => {
    const token = req.cookies?.auth || req.header("Authorization")?.replace("Bearer", "").trim();
    if (!token) {
        throw new Error("No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await registerModel.findById(decodedToken?.id);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

/**
 * Get all available date sheets
 */
export const getDateSheets = async (req, res) => {
    try {
        const sheets = await googleSheetsService.getSheetTabs();
        
        // Filter out any non-date sheets (if any)
        const dateSheets = sheets.filter(sheet => {
            // Check if sheet title matches date format (YYYY-MM-DD)
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            return dateRegex.test(sheet.title);
        });

        return responseData(res, dateSheets, 200, true, "Date sheets retrieved successfully");
    } catch (error) {
        console.error("Error getting date sheets:", error);
        return responseData(res, "", 500, false, "Failed to retrieve date sheets");
    }
};

/**
 * Get data for a specific date sheet
 */
export const getSheetData = async (req, res) => {
    try {
        const { date } = req.params;
        
        if (!date) {
            return responseData(res, "", 400, false, "Date parameter is required");
        }

        const sheetData = await googleSheetsService.getSheetData(date);
        
        return responseData(res, sheetData, 200, true, "Sheet data retrieved successfully");
    } catch (error) {
        console.error("Error getting sheet data:", error);
        return responseData(res, "", 500, false, "Failed to retrieve sheet data");
    }
};

/**
 * Update a specific cell in the sheet
 */
export const updateCell = async (req, res) => {
    try {
        const { date } = req.params;
        const { row, column, value } = req.body;

        if (!date || row === undefined || column === undefined || value === undefined) {
            return responseData(res, "", 400, false, "Date, row, column, and value are required");
        }

        const user = await getUserFromToken(req);

        // Get sheet data to check column headers for permission validation
        const sheetData = await googleSheetsService.getSheetData(date);
        const headers = sheetData.headers;
        
        if (column >= headers.length) {
            return responseData(res, "", 400, false, "Invalid column index");
        }

        const columnHeader = headers[column];
        
        // Check if user has permission to edit this column
        const hasPermission = googleSheetsService.checkEditPermission(user.role, user.username, columnHeader);
        
        if (!hasPermission) {
            return responseData(res, "", 403, false, "You can only edit your own column");
        }

        const result = await googleSheetsService.updateCell(date, row, column, value);
        
        return responseData(res, result, 200, true, "Cell updated successfully");
    } catch (error) {
        console.error("Error updating cell:", error);
        return responseData(res, "", 500, false, "Failed to update cell");
    }
};

/**
 * Batch update multiple cells
 */
export const batchUpdateCells = async (req, res) => {
    try {
        const { date } = req.params;
        const { updates } = req.body;

        if (!date || !updates || !Array.isArray(updates)) {
            return responseData(res, "", 400, false, "Date and updates array are required");
        }

        const user = await getUserFromToken(req);

        // Get sheet data to check column headers for permission validation
        const sheetData = await googleSheetsService.getSheetData(date);
        const headers = sheetData.headers;

        // Validate permissions for all updates
        for (const update of updates) {
            if (update.column >= headers.length) {
                return responseData(res, "", 400, false, `Invalid column index: ${update.column}`);
            }

            const columnHeader = headers[update.column];
            const hasPermission = googleSheetsService.checkEditPermission(user.role, user.username, columnHeader);
            
            if (!hasPermission) {
                return responseData(res, "", 403, false, `You can only edit your own column. Unauthorized column: ${columnHeader}`);
            }
        }

        const result = await googleSheetsService.batchUpdateCells(date, updates);
        
        return responseData(res, result, 200, true, "Cells updated successfully");
    } catch (error) {
        console.error("Error batch updating cells:", error);
        return responseData(res, "", 500, false, "Failed to update cells");
    }
};

/**
 * Create a new date sheet (SUPERADMIN only)
 */
export const createDateSheet = async (req, res) => {
    try {
        const { date } = req.body;

        if (!date) {
            return responseData(res, "", 400, false, "Date is required");
        }

        const user = await getUserFromToken(req);

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return responseData(res, "", 400, false, "Date must be in YYYY-MM-DD format");
        }

        // Get team members from the organization
        const teamMembers = await getTeamMembersFromOrg(user.organization);
        
        if (teamMembers.length === 0) {
            return responseData(res, "", 400, false, "No team members found in organization");
        }

        const result = await googleSheetsService.createDateSheet(date, teamMembers);
        
        return responseData(res, result, 201, true, "Date sheet created successfully");
    } catch (error) {
        console.error("Error creating date sheet:", error);
        if (error.message.includes("already exists")) {
            return responseData(res, "", 409, false, error.message);
        }
        return responseData(res, "", 500, false, "Failed to create date sheet");
    }
};

/**
 * Get team members from organization
 */
const getTeamMembersFromOrg = async (orgId) => {
    try {
        const users = await registerModel.find({ 
            organization: orgId, 
            status: true 
        }).select('username');
        
        return users.map(user => user.username);
    } catch (error) {
        console.error("Error getting team members:", error);
        return [];
    }
};

/**
 * Delete a date sheet (SUPERADMIN only)
 */
export const deleteDateSheet = async (req, res) => {
    try {
        const { date } = req.params;

        if (!date) {
            return responseData(res, "", 400, false, "Date parameter is required");
        }

        const result = await googleSheetsService.deleteSheet(date);
        
        return responseData(res, result, 200, true, "Date sheet deleted successfully");
    } catch (error) {
        console.error("Error deleting date sheet:", error);
        return responseData(res, "", 500, false, "Failed to delete date sheet");
    }
};

/**
 * Get team members for the current organization
 */
export const getTeamMembers = async (req, res) => {
    try {
        const user = await getUserFromToken(req);
        const teamMembers = await getTeamMembersFromOrg(user.organization);

        return responseData(res, teamMembers, 200, true, "Team members retrieved successfully");
    } catch (error) {
        console.error("Error getting team members:", error);
        return responseData(res, "", 500, false, "Failed to retrieve team members");
    }
};

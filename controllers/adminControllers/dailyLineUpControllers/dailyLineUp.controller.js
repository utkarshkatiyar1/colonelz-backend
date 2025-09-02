import { responseData } from "../../../utils/respounse.js";
import googleSheetsService from "../../../utils/googleSheets.service.js";
import mockGoogleSheetsService from "../../../utils/mockSheets.service.js";
import registerModel from "../../../models/usersModels/register.model.js";
import jwt from "jsonwebtoken";

// Determine which service to use based on environment or credentials availability
let sheetsService = googleSheetsService;
let usingMockService = false;

// Test Google Sheets connection on startup
(async () => {
    try {
        await googleSheetsService.testConnection();
        console.log('Using real Google Sheets service');
    } catch (error) {
        console.warn('Google Sheets service unavailable, falling back to mock service:', error.message);
        sheetsService = mockGoogleSheetsService;
        usingMockService = true;
    }
})();

/**
 * Helper function to get user from JWT token
 */
const getUserFromToken = async (req) => {
    const token = req.cookies?.auth || req.header("Authorization")?.replace("Bearer ", "").trim();
    if (!token) {
        throw new Error("No token provided");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (jwtError) {
        throw new Error(`Invalid token: ${jwtError.message}`);
    }

    if (!decodedToken?.id) {
        throw new Error("Invalid token payload");
    }

    const user = await registerModel.findById(decodedToken.id);

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.status) {
        throw new Error("User account is inactive");
    }

    return user;
};

/**
 * Get all available date sheets
 */
export const getDateSheets = async (req, res) => {
    try {
        const sheets = await sheetsService.getSheetTabs();
        
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

        const sheetData = await sheetsService.getSheetData(date);
        
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
        const sheetData = await sheetsService.getSheetData(date);
        const headers = sheetData.headers;
        
        if (column >= headers.length) {
            return responseData(res, "", 400, false, "Invalid column index");
        }

        const columnHeader = headers[column];
        
        // Check if user has permission to edit this column
        const hasPermission = sheetsService.checkEditPermission(user.role, user.username, columnHeader);
        
        if (!hasPermission) {
            return responseData(res, "", 403, false, "You can only edit your own column");
        }

        const result = await sheetsService.updateCell(date, row, column, value);
        
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
        const sheetData = await sheetsService.getSheetData(date);
        const headers = sheetData.headers;

        // Validate permissions for all updates
        for (const update of updates) {
            if (update.column >= headers.length) {
                return responseData(res, "", 400, false, `Invalid column index: ${update.column}`);
            }

            const columnHeader = headers[update.column];
            const hasPermission = sheetsService.checkEditPermission(user.role, user.username, columnHeader);
            
            if (!hasPermission) {
                return responseData(res, "", 403, false, `You can only edit your own column. Unauthorized column: ${columnHeader}`);
            }
        }

        const result = await sheetsService.batchUpdateCells(date, updates);
        
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

        // Get user from token
        let user;
        try {
            user = await getUserFromToken(req);
        } catch (tokenError) {
            console.error("Token validation error:", tokenError);
            return responseData(res, "", 401, false, "Invalid or expired token");
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return responseData(res, "", 400, false, "Date must be in YYYY-MM-DD format");
        }

        // Check if user has organization
        if (!user.organization) {
            return responseData(res, "", 400, false, "User organization not found");
        }

        // Get team members from the organization
        let teamMembers;
        try {
            teamMembers = await getTeamMembersFromOrg(user.organization);
        } catch (dbError) {
            console.error("Database error getting team members:", dbError);
            return responseData(res, "", 500, false, "Failed to retrieve team members from database");
        }
        
        if (!teamMembers || teamMembers.length === 0) {
            return responseData(res, "", 400, false, "No active team members found in organization");
        }

        // Create the date sheet
        let result;
        try {
            result = await sheetsService.createDateSheet(date, teamMembers);
            
            // Add warning if using mock service
            if (usingMockService) {
                result.warning = "Using mock service - Google Sheets credentials not available";
            }
        } catch (sheetsError) {
            console.error("Sheets service error:", sheetsError);
            if (sheetsError.message.includes("already exists")) {
                return responseData(res, "", 409, false, sheetsError.message);
            }
            if (sheetsError.message.includes("authentication") || sheetsError.message.includes("credentials")) {
                return responseData(res, "", 500, false, "Google Sheets authentication failed");
            }
            if (sheetsError.message.includes("permission") || sheetsError.message.includes("access")) {
                return responseData(res, "", 403, false, "Insufficient permissions to access Google Sheets");
            }
            return responseData(res, "", 500, false, `Sheets service error: ${sheetsError.message}`);
        }
        
        return responseData(res, result, 201, true, "Date sheet created successfully");
    } catch (error) {
        console.error("Unexpected error creating date sheet:", error);
        return responseData(res, "", 500, false, `Failed to create date sheet: ${error.message}`);
    }
};

/**
 * Get team members from organization
 */
const getTeamMembersFromOrg = async (orgId) => {
    try {
        if (!orgId) {
            throw new Error("Organization ID is required");
        }

        const users = await registerModel.find({ 
            organization: orgId, 
            status: true 
        }).select('username');
        
        if (!users || users.length === 0) {
            console.log(`No active users found for organization: ${orgId}`);
            return [];
        }

        const usernames = users.map(user => user.username).filter(username => username && username.trim());
        console.log(`Found ${usernames.length} team members for organization ${orgId}:`, usernames);
        
        return usernames;
    } catch (error) {
        console.error("Error getting team members:", error);
        throw error;
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

        const result = await sheetsService.deleteSheet(date);
        
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
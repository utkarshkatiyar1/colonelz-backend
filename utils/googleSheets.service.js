import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

class GoogleSheetsService {
    constructor() {
        this.auth = null;
        this.sheets = null;
        this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
        this.initializeAuth();
    }

    async initializeAuth() {
        try {
            let credentials;
            const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

            // Check if it's a file path or inline JSON
            if (serviceAccountKey.startsWith('./') || serviceAccountKey.startsWith('/') || serviceAccountKey.includes('.json')) {
                // It's a file path - read the file
                const credentialsPath = path.resolve(serviceAccountKey);
                console.log('Reading Google Service Account credentials from file:', credentialsPath);

                if (!fs.existsSync(credentialsPath)) {
                    throw new Error(`Google Service Account file not found: ${credentialsPath}`);
                }

                const credentialsFile = fs.readFileSync(credentialsPath, 'utf8');
                credentials = JSON.parse(credentialsFile);
            } else {
                // It's inline JSON - parse directly
                console.log('Using inline Google Service Account credentials');
                credentials = JSON.parse(serviceAccountKey);
            }

            // Validate required fields
            if (!credentials.client_email || !credentials.private_key) {
                throw new Error('Invalid Google Service Account credentials: missing client_email or private_key');
            }

            console.log('Initializing Google Sheets API with service account:', credentials.client_email);

            this.auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            this.sheets = google.sheets({ version: 'v4', auth: this.auth });
            console.log('Google Sheets API initialized successfully');
        } catch (error) {
            console.error('Error initializing Google Sheets auth:', error);
            throw error;
        }
    }

    /**
     * Get all sheet tabs in the spreadsheet
     */
    async getSheetTabs() {
        try {
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });

            return response.data.sheets.map(sheet => ({
                title: sheet.properties.title,
                sheetId: sheet.properties.sheetId,
            }));
        } catch (error) {
            console.error('Error getting sheet tabs:', error);
            throw error;
        }
    }

    /**
     * Create a new sheet tab for a specific date
     */
    async createDateSheet(date, teamMembers) {
        try {
            // Check if sheet already exists
            const existingSheets = await this.getSheetTabs();
            const sheetExists = existingSheets.some(sheet => sheet.title === date);
            
            if (sheetExists) {
                throw new Error(`Sheet for date ${date} already exists`);
            }

            // Create new sheet
            const addSheetRequest = {
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: date,
                                gridProperties: {
                                    rowCount: 100,
                                    columnCount: teamMembers.length + 2, // +2 for time column and tasks for tomorrow
                                },
                            },
                        },
                    }],
                },
            };

            await this.sheets.spreadsheets.batchUpdate(addSheetRequest);

            // Initialize the sheet with headers and time slots
            await this.initializeSheetStructure(date, teamMembers);

            return { success: true, message: `Sheet for ${date} created successfully` };
        } catch (error) {
            console.error('Error creating date sheet:', error);
            throw error;
        }
    }

    /**
     * Initialize sheet structure with headers and time slots
     */
    async initializeSheetStructure(sheetName, teamMembers) {
        try {
            // Define time slots
            const timeSlots = ['10:00 AM', '2:15 PM', '6:45 PM'];
            
            // Prepare headers: Time, Team Members, Tasks For Tomorrow
            const headers = ['Time', ...teamMembers, 'Tasks For Tomorrow'];
            
            // Prepare data with time slots
            const data = [
                headers,
                ...timeSlots.map(time => [time, ...new Array(teamMembers.length + 1).fill('')])
            ];

            // Write data to sheet
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}${timeSlots.length + 1}`,
                valueInputOption: 'RAW',
                resource: {
                    values: data,
                },
            });

            // Format the sheet (freeze first row and first column)
            await this.formatSheet(sheetName, headers.length);

        } catch (error) {
            console.error('Error initializing sheet structure:', error);
            throw error;
        }
    }

    /**
     * Format the sheet with frozen rows/columns
     */
    async formatSheet(sheetName, columnCount) {
        try {
            // Get sheet ID
            const sheets = await this.getSheetTabs();
            const sheet = sheets.find(s => s.title === sheetName);
            
            if (!sheet) {
                throw new Error(`Sheet ${sheetName} not found`);
            }

            const requests = [
                // Freeze first row and first column
                {
                    updateSheetProperties: {
                        properties: {
                            sheetId: sheet.sheetId,
                            gridProperties: {
                                frozenRowCount: 1,
                                frozenColumnCount: 1,
                            },
                        },
                        fields: 'gridProperties.frozenRowCount,gridProperties.frozenColumnCount',
                    },
                },
                // Format header row
                {
                    repeatCell: {
                        range: {
                            sheetId: sheet.sheetId,
                            startRowIndex: 0,
                            endRowIndex: 1,
                            startColumnIndex: 0,
                            endColumnIndex: columnCount,
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                                textFormat: { bold: true },
                                horizontalAlignment: 'CENTER',
                            },
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
                    },
                },
                // Format time column
                {
                    repeatCell: {
                        range: {
                            sheetId: sheet.sheetId,
                            startRowIndex: 1,
                            endRowIndex: 4, // 3 time slots + 1
                            startColumnIndex: 0,
                            endColumnIndex: 1,
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.95, green: 0.95, blue: 0.95 },
                                textFormat: { bold: true },
                                horizontalAlignment: 'CENTER',
                            },
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
                    },
                },
            ];

            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: { requests },
            });

        } catch (error) {
            console.error('Error formatting sheet:', error);
            throw error;
        }
    }

    /**
     * Get data from a specific sheet
     */
    async getSheetData(sheetName) {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A:Z`, // Get all data
            });

            const rows = response.data.values || [];
            if (rows.length === 0) {
                return { headers: [], data: [] };
            }

            const headers = rows[0];
            const data = rows.slice(1);

            return { headers, data };
        } catch (error) {
            console.error('Error getting sheet data:', error);
            throw error;
        }
    }

    /**
     * Update a specific cell in the sheet
     */
    async updateCell(sheetName, row, column, value) {
        try {
            const cellAddress = `${String.fromCharCode(65 + column)}${row + 1}`;

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!${cellAddress}`,
                valueInputOption: 'RAW',
                resource: {
                    values: [[value]],
                },
            });

            return { success: true, message: 'Cell updated successfully' };
        } catch (error) {
            console.error('Error updating cell:', error);
            throw error;
        }
    }

    /**
     * Update multiple cells in batch
     */
    async batchUpdateCells(sheetName, updates) {
        try {
            const data = updates.map(update => ({
                range: `${sheetName}!${String.fromCharCode(65 + update.column)}${update.row + 1}`,
                values: [[update.value]],
            }));

            await this.sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    valueInputOption: 'RAW',
                    data,
                },
            });

            return { success: true, message: 'Cells updated successfully' };
        } catch (error) {
            console.error('Error batch updating cells:', error);
            throw error;
        }
    }

    /**
     * Get team members from organization
     */
    async getTeamMembers(orgId) {
        // This would typically fetch from your user database
        // For now, returning a placeholder - you'll need to integrate with your user model
        try {
            // Import your user model here and fetch active users for the organization
            // const users = await registerModel.find({ organization: orgId, status: true });
            // return users.map(user => user.username);

            // Placeholder return
            return ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
        } catch (error) {
            console.error('Error getting team members:', error);
            throw error;
        }
    }

    /**
     * Check if user has permission to edit specific column
     */
    checkEditPermission(userRole, userName, columnHeader) {
        // Superadmins can edit all columns
        if (userRole === 'SUPERADMIN') {
            return true;
        }

        // Other users can only edit their own column
        return columnHeader === userName;
    }

    /**
     * Delete a sheet tab
     */
    async deleteSheet(sheetName) {
        try {
            const sheets = await this.getSheetTabs();
            const sheet = sheets.find(s => s.title === sheetName);

            if (!sheet) {
                throw new Error(`Sheet ${sheetName} not found`);
            }

            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [{
                        deleteSheet: {
                            sheetId: sheet.sheetId,
                        },
                    }],
                },
            });

            return { success: true, message: `Sheet ${sheetName} deleted successfully` };
        } catch (error) {
            console.error('Error deleting sheet:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;

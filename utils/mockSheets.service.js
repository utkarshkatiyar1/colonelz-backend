/**
 * Mock Google Sheets Service for Development/Testing
 * Use this when Google Sheets credentials are not available
 */

class MockGoogleSheetsService {
    constructor() {
        this.mockSheets = new Map();
        console.log('Using Mock Google Sheets Service - for development only');
    }

    async initializeAuth() {
        console.log('Mock: Google Sheets auth initialized');
        return true;
    }

    async testConnection() {
        console.log('Mock: Google Sheets connection test successful');
        return true;
    }

    async getSheetTabs() {
        const mockTabs = [
            { title: '2025-01-01', sheetId: 1 },
            { title: '2025-01-02', sheetId: 2 },
            { title: '2025-01-03', sheetId: 3 }
        ];
        
        // Add dynamically created sheets
        for (const [date, sheet] of this.mockSheets) {
            mockTabs.push({ title: date, sheetId: sheet.sheetId });
        }
        
        console.log('Mock: Returning sheet tabs:', mockTabs.map(t => t.title));
        return mockTabs;
    }

    async createDateSheet(date, teamMembers) {
        if (!date) {
            throw new Error('Date is required');
        }

        if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
            throw new Error('Team members array is required and must not be empty');
        }

        // Check if sheet already exists
        const existingSheets = await this.getSheetTabs();
        const sheetExists = existingSheets.some(sheet => sheet.title === date);
        
        if (sheetExists) {
            throw new Error(`Sheet for date ${date} already exists`);
        }

        // Simulate sheet creation
        const newSheet = {
            title: date,
            sheetId: Date.now(),
            teamMembers: teamMembers,
            timeSlots: ['10:00 AM', '2:15 PM', '6:45 PM'],
            data: this.createMockSheetData(teamMembers)
        };

        this.mockSheets.set(date, newSheet);

        console.log(`Mock: Created sheet for ${date} with team members:`, teamMembers);
        
        return { 
            success: true, 
            message: `Mock sheet for ${date} created successfully`,
            data: newSheet
        };
    }

    createMockSheetData(teamMembers) {
        const headers = ['Time', ...teamMembers, 'Tasks For Tomorrow'];
        const timeSlots = ['10:00 AM', '2:15 PM', '6:45 PM'];
        
        const data = [
            headers,
            ...timeSlots.map(time => [time, ...new Array(teamMembers.length + 1).fill('')])
        ];

        return {
            headers,
            data: data.slice(1) // Remove headers from data
        };
    }

    async initializeSheetStructure(sheetName, teamMembers) {
        console.log(`Mock: Initialized sheet structure for ${sheetName}`);
        return true;
    }

    async formatSheet(sheetName, columnCount) {
        console.log(`Mock: Formatted sheet ${sheetName} with ${columnCount} columns`);
        return true;
    }

    async getSheetData(sheetName) {
        const sheet = this.mockSheets.get(sheetName);
        
        if (!sheet) {
            // Return default structure
            const defaultData = this.createMockSheetData(['User1', 'User2', 'User3']);
            console.log(`Mock: Returning default data for ${sheetName}`);
            return defaultData;
        }

        console.log(`Mock: Returning data for ${sheetName}`);
        return sheet.data;
    }

    async updateCell(sheetName, row, column, value) {
        console.log(`Mock: Updated cell ${sheetName}[${row}][${column}] = "${value}"`);
        return { success: true, message: 'Mock cell updated successfully' };
    }

    async batchUpdateCells(sheetName, updates) {
        console.log(`Mock: Batch updated ${updates.length} cells in ${sheetName}`);
        updates.forEach(update => {
            console.log(`  - [${update.row}][${update.column}] = "${update.value}"`);
        });
        return { success: true, message: 'Mock cells updated successfully' };
    }

    checkEditPermission(userRole, userName, columnHeader) {
        // Superadmins can edit all columns
        if (userRole === 'SUPERADMIN') {
            return true;
        }

        // Other users can only edit their own column
        return columnHeader === userName;
    }

    async deleteSheet(sheetName) {
        const existed = this.mockSheets.has(sheetName);
        this.mockSheets.delete(sheetName);
        
        console.log(`Mock: ${existed ? 'Deleted' : 'Attempted to delete'} sheet ${sheetName}`);
        
        if (!existed) {
            throw new Error(`Sheet ${sheetName} not found`);
        }

        return { success: true, message: `Mock sheet ${sheetName} deleted successfully` };
    }
}

// Create and export a singleton instance
const mockGoogleSheetsService = new MockGoogleSheetsService();
export default mockGoogleSheetsService;
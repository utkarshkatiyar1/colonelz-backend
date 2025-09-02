import mockGoogleSheetsService from './utils/mockSheets.service.js';

async function testCreateSheet() {
    console.log('=== Testing Create Date Sheet ===\n');
    
    try {
        const testDate = '2025-01-30';
        const testTeamMembers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
        
        console.log(`Creating sheet for date: ${testDate}`);
        console.log(`Team members:`, testTeamMembers);
        console.log();
        
        const result = await mockGoogleSheetsService.createDateSheet(testDate, testTeamMembers);
        
        console.log('✓ SUCCESS: Date sheet created successfully!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
        // Test getting the created sheet data
        console.log('\n--- Testing Sheet Data Retrieval ---');
        const sheetData = await mockGoogleSheetsService.getSheetData(testDate);
        console.log('Sheet data:', JSON.stringify(sheetData, null, 2));
        
        // Test duplicate creation (should fail)
        console.log('\n--- Testing Duplicate Creation (should fail) ---');
        try {
            await mockGoogleSheetsService.createDateSheet(testDate, testTeamMembers);
            console.log('✗ ERROR: Duplicate creation should have failed');
        } catch (error) {
            console.log('✓ SUCCESS: Duplicate creation properly rejected:', error.message);
        }
        
    } catch (error) {
        console.log('✗ ERROR:', error.message);
        console.log('Stack:', error.stack);
    }
}

testCreateSheet();
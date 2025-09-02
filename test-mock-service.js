import dotenv from 'dotenv';
import mockGoogleSheetsService from './utils/mockSheets.service.js';
import mongoose from 'mongoose';
import registerModel from './models/usersModels/register.model.js';

dotenv.config();

async function testMockService() {
    console.log('=== Mock Service Test ===\n');
    
    // Test MongoDB connection
    console.log('1. Testing MongoDB Connection:');
    try {
        await mongoose.connect(process.env.MONGO);
        console.log('   ✓ MongoDB connected successfully');
        
        // Get sample organization
        const sampleUser = await registerModel.findOne({ status: true }).select('organization username');
        if (sampleUser) {
            console.log(`   ✓ Sample user: ${sampleUser.username}, org: ${sampleUser.organization}`);
            
            // Get team members for this org
            const teamMembers = await registerModel.find({ 
                organization: sampleUser.organization, 
                status: true 
            }).select('username');
            console.log(`   ✓ Team members in org ${sampleUser.organization}:`, teamMembers.map(u => u.username));
            
            // Test mock service
            console.log('\n2. Testing Mock Service:');
            
            // Test connection
            await mockGoogleSheetsService.testConnection();
            console.log('   ✓ Mock service connection successful');
            
            // Test getting sheets
            const sheets = await mockGoogleSheetsService.getSheetTabs();
            console.log(`   ✓ Found ${sheets.length} mock sheets:`, sheets.map(s => s.title));
            
            // Test creating a date sheet
            const testDate = '2025-01-30';
            const testTeamMembers = teamMembers.map(u => u.username).slice(0, 5); // Limit to 5 members
            
            console.log(`\n3. Testing Date Sheet Creation:`);
            console.log(`   Date: ${testDate}`);
            console.log(`   Team members:`, testTeamMembers);
            
            const result = await mockGoogleSheetsService.createDateSheet(testDate, testTeamMembers);
            console.log('   ✓ Date sheet creation successful:', result);
            
            // Test getting sheet data
            const sheetData = await mockGoogleSheetsService.getSheetData(testDate);
            console.log('   ✓ Sheet data retrieved:', {
                headers: sheetData.headers,
                dataRows: sheetData.data.length
            });
            
            // Test updating a cell
            const updateResult = await mockGoogleSheetsService.updateCell(testDate, 1, 1, 'Test task');
            console.log('   ✓ Cell update successful:', updateResult);
            
        } else {
            console.log('   ✗ No users found in database');
        }
    } catch (error) {
        console.log('   ✗ Error:', error.message);
    }
    
    await mongoose.disconnect();
    console.log('\n=== Test Complete ===');
}

testMockService().catch(console.error);
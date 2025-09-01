/**
 * Migration script to add status field to existing projects
 * This script adds the 'status' field with default value 'Active' to all existing projects
 * Run this script after deploying the updated project model
 */

import mongoose from 'mongoose';
import projectModel from '../models/adminModels/project.model.js';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Update all projects that don't have a status field
    const result = await projectModel.updateMany(
      { status: { $exists: false } },
      { $set: { status: "Active" } }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Updated ${result.modifiedCount} projects with status field`);

    // Create index on status field for better query performance
    await projectModel.collection.createIndex({ status: 1 });
    console.log('Created index on status field');

    // Create compound index for org_id and status for efficient filtering
    await projectModel.collection.createIndex({ org_id: 1, status: 1 });
    console.log('Created compound index on org_id and status');

    // Verify the migration
    const activeCount = await projectModel.countDocuments({ status: "Active" });
    const inactiveCount = await projectModel.countDocuments({ status: "Inactive" });
    
    console.log(`Verification: ${activeCount} active projects, ${inactiveCount} inactive projects`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;

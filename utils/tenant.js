import mongoose from 'mongoose';

export const getTenantModel = (tenantId, schemaDefinition, collectionName) => {
    const schema = new mongoose.Schema(schemaDefinition);
    return mongoose.model(`${tenantId}_${collectionName}`, schema, `${tenantId}_${collectionName}`);
};

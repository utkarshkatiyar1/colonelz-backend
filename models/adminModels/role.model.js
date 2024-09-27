import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    role:{type: String, require:true},
    access: { type: Object, require:true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Roles', roleSchema);



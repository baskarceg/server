import mongoose from 'mongoose';

const swotSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    college: String,
    degree: String,
    swotAnalysis: Object
}, { timestamps: true });

export default mongoose.model('Swot', swotSchema);

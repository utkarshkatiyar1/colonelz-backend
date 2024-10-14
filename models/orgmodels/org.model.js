import mongoose from "mongoose";

const orgSchema = new mongoose.Schema({


    org_phone: {
        type: String,
        // required: true,
    },

    org_email: {
        type: String,
        // required: true,
    },
    org_website: {
        type: String,
        // required: true,
    },
    org_address_line1: {
        type: String,
        // required: true,
    },
    org_address_line2: {
        type: String,
        // required: true,
    },
    org_city: {
        type: String,
        // required: true,
    },
    org_state: {
        type: String,
        // required: true,
    },
    org_country: {
        type: String,
        // required: true,
    },
    org_zipcode: {
        type: String,
        // required: true,
    },
    org_status: {
        type: Boolean,
        required: true,
    },
    organization: {
        type: String,
        required: true,
    },

    org_logo: {
        type: String,
        // required:true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.model("organisation", orgSchema, "organisation");

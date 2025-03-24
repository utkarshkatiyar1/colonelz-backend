import mongoose from "mongoose";

const orgSchema = new mongoose.Schema({


    org_phone: {
        type: Number,
        // required: true,
    },

    org_email: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        // required: true,
    },
    currency: {
        type: String,
        // required: true,
    },

    vat_tax_gst_number: [
       
    ],

    org_website: {
        type: String,
        // required: true,
    },
    org_address: {
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

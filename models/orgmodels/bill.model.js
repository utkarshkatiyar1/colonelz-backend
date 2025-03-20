import mongoose from "mongoose";

const billSchema = new mongoose.Schema({

    org_id: {
        type: String,
        // required: true,
    },
    billing_address: {
        type: String,
        // required: true,
    },
    billing_city: {
        type: String,
        // required: true,
    },
    billing_state: {
        type: String,
        // required: true,
    },
    billing_country: {
        type: String,
        // required: true,
    },
    billing_zipcode: {
        type: String,
        // required: true,
    },

    shipping_address: {
        type: String,
        // required: true,
    },
    shipping_city: {
        type: String,
        // required: true,
    },
    shipping_state: {
        type: String,
        // required: true,
    },
    shipping_country: {
        type: String,
        // required: true,
    },
    shipping_zipcode: {
        type: String,
        // required: true,
    },

    sameAsBilling: {
        type: Boolean,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.model("bill", billSchema, "bill");

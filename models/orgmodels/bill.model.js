import mongoose from "mongoose";

const billSchema = new mongoose.Schema({

    org_id: {
        type: String,
        // required: true,
    },
    billing_shipping_address: {
        type: String,
        // required: true,
    },
    city: {
        type: String,
        // required: true,
    },
    state: {
        type: String,
        // required: true,
    },
    country: {
        type: String,
        // required: true,
    },
    zipcode: {
        type: String,
        // required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.model("bill", billSchema, "bill");

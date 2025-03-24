import registerModel from "../../models/usersModels/register.model.js";
import { responseData } from "../../utils/respounse.js";
import orgModel from "../../models/orgmodels/org.model.js";
import billModel from "../../models/orgmodels/bill.model.js";


export const updateBillingShippingDetails = async (req, res) => {
    const userId = req.body.userId;
    const org_id = req.body.org_id;

    if (!userId) {
        return responseData(res, "", 400, false, "UserId is required");
    }

    try {

        if (!org_id) {
            return responseData(res, "", 400, false, "OrgId is required");

        } else {

            const check_org = await orgModel.findOne({ _id: org_id, status: true })

            if (!check_org) {
                return responseData(res, "", 400, false, "Please provide valid Organization id");
            }

            const user = await registerModel.findOne({ _id: userId });
            if (!user) {
                return responseData(res, "", 404, false, "User not found");

            } else {
                if (user.role !== 'SUPERADMIN') {
                    return responseData(res, "", 400, false, "You are not allowed to update Billing Shipping details!");

                } else {
                    const existingBill = await billModel.findOne({ org_id: org_id })

                    if (existingBill) {

                        let updates = {
                            billing_address: req.body.billing_address,
                            billing_country: req.body.billing_country,
                            billing_state: req.body.billing_state,
                            billing_city: req.body.billing_city,
                            billing_zipcode: req.body.billing_zipcode,

                            sameAsBilling: req.body.sameAsBilling,

                            shipping_address: req.body.shipping_address,
                            shipping_country: req.body.shipping_country,
                            shipping_state: req.body.shipping_state,
                            shipping_city: req.body.shipping_city,
                            shipping_zipcode: req.body.shipping_zipcode,
                        };

                        const result = await billModel.findOneAndUpdate(
                            { org_id: org_id },
                            { $set: updates }, 
                            { new: true }
                        );

                        if (!result) {
                            return responseData(res, "", 404, false, "Organization does not exist");
                        }

                        return responseData(res, "Billing and Shipping details updated successfully", 200, true, "", []);
                    } else {

                        const newBill = new billModel({
                            org_id: req.body.org_id,  
                            billing_shipping_address: req.body.billing_shipping_address, 
                            city: req.body.city,  
                            state: req.body.state,  
                            country: req.body.country,
                            zipcode: req.body.zipcode,
                        });

                         await newBill.save();

                        responseData(
                            res,
                            "Billing and Shipping details saved successfully!",
                            200,
                            true,
                            ""
                        );



                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
        return responseData(res, "", 500, false, "Server error");
    }
};


export const getBillingShippingDetails = async (req, res) => {
    try {

        const org_id = req.query.org_id;
        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        const org = await orgModel.findOne({ _id: org_id })
        if (!org) {
            return responseData(res, "", 404, false, "Organization does not exists");

        }
        const bill = await billModel.findOne({ org_id: org_id })
        if (!bill) {
            return responseData(res, "", 200, true, "Billing Shipping details not found");

        }
        responseData(res, "Billing and Shipping details found successfully", 200, true, "", bill);

    } catch (err) {
        responseData(res, "", 500, false, "Internal Server Error");
        console.error(err);
    }
};
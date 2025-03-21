import { s3 } from "../../utils/function.js";
import registerModel from "../../models/usersModels/register.model.js";
import { responseData } from "../../utils/respounse.js";
import { onlyAlphabetsValidation } from "../../utils/validation.js";
import orgModel from "../../models/orgmodels/org.model.js";

const uploadImage = async (req, fileName, org_id, key) => {
    try {
        const data = await s3
            .upload({
                Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/logo/`,
                Key: fileName,
                Body: req.files[key].data,
                ContentType: req.files[key].mimetype,

            })
            .promise();
        const signedUrl = s3.getSignedUrl('getObject', {
            Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/logo/`,
            Key: fileName,
            Expires: 157680000 // URL expires in 5 year
        });
        return { status: true, data, signedUrl };
    } catch (err) {
        return { status: false, err };
    }
};

const updateProfileInDB = async (org_id, updates) => {
    try {
        const result = await orgModel.findByIdAndUpdate(org_id, { $set: updates }, { new: true });
        return result;
    } catch (err) {
        console.error(err);
        throw new Error('Database update failed');
    }
};

const setProfileUrlInDB = async (res, response, org_id, req) => {
    try {

        const listOfObjects = JSON.parse(req.body.vat_tax_gst_number);


        const updates = { 
            org_phone: req.body.org_phone,
            org_email: req.body.org_email,
            email: req.body.email,
            currency: req.body.currency,
            vat_tax_gst_number: listOfObjects,
            org_website: req.body.org_website,
            org_address: req.body.org_address,
            org_city: req.body.org_city,
            org_state: req.body.org_state,
            org_country: req.body.org_country,
            org_zipcode: req.body.org_zipcode,
            org_status: req.body.org_status,
            organization: req.body.organization,
            org_logo: req.body.org_logo,
        };
        if (response) updates.org_logo = response.signedUrl;
        // console.log(response)

        const updatedUser = await updateProfileInDB(org_id, updates);
        if (!updatedUser) {
            return responseData(res, "", 404, false, "Organization does not exist");
        }

        return responseData(res, "Organization updated successfully", 200, true, "", []);
    } catch (error) {
        return responseData(res, "", 403, false, "Server problem");
    }
};

export const updateOrg = async (req, res) => {
    const userId = req.body.userId;
    const org_id = req.body.org_id;

    // const user_name = req.body.user_name;

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
                    return responseData(res, "", 400, false, "You are not allowed to update organization");

                } else {
                    const existingOrg = orgModel.findOne({ _id: org_id })

                    if (existingOrg) {

                        const file = req.files ? req.files.file : null;

                        if (!file) {
                            return await setProfileUrlInDB(res, null, org_id, req);
                        }

                        const fileName = `${Date.now()}_${file.name}`;
                        // console.log(fileName);
                        const response = await uploadImage(req, fileName, org_id, "file");

                        if (response.status) {
                            await setProfileUrlInDB(res, response, org_id, req);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error(error);
        return responseData(res, "", 500, false, "Server error");
    }
};

export const getOrg = async (req, res) => {
    try {
        const org_id = req.query.org_id;
        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        const org = await orgModel.findOne({ _id: org_id })
        if (!org) {
            responseData(res, "", 404, false, "Organization does not exists");

        }
        responseData(res, "Organization found successfully", 200, true, "", org);

    } catch (err) {
        responseData(res, "", 500, false, "Internal Server Error");
        console.error(err);
    }
};

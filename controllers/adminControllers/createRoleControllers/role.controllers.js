import roleModel from "../../../models/adminModels/role.model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { responseData } from "../../../utils/respounse.js";



export const createRole = async (req, res) => {
    try {
        let role = req.body.role;
        const access = req.body.access;
        const org_id = req.body.org_id;

        const tempRole = role.toUpperCase();  
        if(tempRole === "ADMIN") {
            role = tempRole
        }


        const isEmpty = (obj) => {
            return Object.entries(obj).length === 0;
        };

        if (!role) {
            responseData(res, "", 400, false, "Role is required")

        }
        else if (isEmpty(access)) {
            responseData(res, "", 400, false, "Access is required")

        }
        else if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        
        else {

                const check_org = await orgModel.findOne({ _id: org_id })
                if (!check_org) {
                    return responseData(res, "", 404, false, "Org not found");
                }
                const checkRole = await roleModel.findOne({ role: role, org_id: org_id });
                if (checkRole) {
                    responseData(res, "", 400, false, "Role already exists")

                }
                else {
                    const newRole = await roleModel.create({ role, access, org_id });
                    responseData(res, "Role created successfully", 200, true, "")
                }
            

        }
    }
    catch (err) {
        responseData(res, "", 500, false, "Internal Server Error")
        console.log(err)
    }
}

export const getRole = async (req, res) => {
    try {
        const org_id = req.query.org_id;
        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        // Use aggregation to join roles and users in a single query
        // const rolesWithUsers = await roleModel.aggregate([
        //     {
        //         $lookup: {
        //             from: 'users', // The name of your user collection
        //             localField: 'role',
        //             foreignField: 'role',
        //             as: 'users'
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             role: 1,
        //             createdAt: 1,
        //             access: 1,
        //             existUser: { $gt: [{ $size: '$user' }, 0] }
        //         }
        //     }
        // ]);
        const rolesWithUsers = await roleModel.find({org_id:org_id})

        responseData(res, "Roles found successfully", 200, true, "", rolesWithUsers);
    } catch (err) {
        responseData(res, "", 500, false, "Internal Server Error");
        console.error(err);
    }
};




export const UpdateRole = async (req, res) => {
    try {
        const { role, access } = req.body;
        const { id, org_id } = req.query;

        if (!id) {
            return responseData(res, "", 400, false, "Role id is required");
        }

        if (!role) {
            return responseData(res, "", 400, false, "Role is required");
        }

        if (!access) {
            return responseData(res, "", 400, false, "Access is required");
        }
        if (!org_id) {
            responseData(res, "", 400, false, "org id is required", []);
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }

        const existingRole = await roleModel.findOne({_id:id, org_id: org_id});
        if (!existingRole) {
            return responseData(res, "", 404, false, "Role not found for this id");
        }

        const updatedRole = await roleModel.findOneAndUpdate({_id:id, org_id: org_id}, { role, access }, { new: true });

        if (updatedRole) {
            const usersToUpdate = await registerModel.find({ role: existingRole.role, organization:org_id });

            if (usersToUpdate.length > 0) {
                await Promise.all(usersToUpdate.map(user =>
                    registerModel.findByIdAndUpdate(user._id, {
                        $set: { access, role }
                    })
                ));
            }

            return responseData(res, "Role updated successfully", 200, true, "");
        }

    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal Server Error");
    }
};


export const DeleteRole = async (req, res) => {
    try {
        const id = req.query.id;
        const org_id = req.query.org_id;

        if (!id) {
            return responseData(res, "", 400, false, "Role id is required");
        }
         if (!org_id) {
            responseData(res, "", 400, false, "org id is required", []);
        }

        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const check_role = await roleModel.findOne({_id:id, org_id: org_id});
        if (!check_role) {
            return responseData(res, "", 404, false, "Role not found for this id");
        }
        const users = await registerModel.find({ role: check_role.role, organization: org_id });
        if (users.length > 0) {
            return responseData(res, "", 400, false, "This role cannot be deleted as it is assigned to the user.");
        }

        await roleModel.findOneAndDelete({_id:id, org_id: org_id});
        responseData(res, `${check_role.role} role has been deleted`, 200, true, "");

    } catch (err) {
        console.error(err);
        responseData(res, "", 500, false, "Internal Server Error");
    }
};



export const roleWiseAccess = async (req, res) => {
    try {
        const org_id = req.query.org_id;
        if (!org_id) {
            return responseData(res, "", 404, false, "Org Id required", []);
        }
        // Use lean to get plain JavaScript objects and only fetch the 'role' field
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const access = await roleModel.find({org_id: org_id}).lean(); // Use lean for better performance

        if (access.length < 1) {
            return responseData(res, "No role found", 200, true, "");
        }

        const transformedData = {};

        // Use a single loop with flatMap to structure the data efficiently
        access.forEach(user => {
            Object.entries(user.access).forEach(([resource, actions]) => {
                actions.forEach(action => {
                    if (!transformedData[resource]) {
                        transformedData[resource] = {};
                    }
                    // Use the shorthand for initializing arrays
                    transformedData[resource][action] = transformedData[resource][action] || [];
                    transformedData[resource][action].push(user.role);
                });
            });
        });

        responseData(res, "Roles found successfully", 200, true, "", transformedData);
    } catch (err) {
        console.error(err);
        responseData(res, "", 500, false, "Internal Server Error");
    }
};



export const roleName = async (req, res) => {
    try {
        const org_id = req.query.org_id;
        if(!org_id)
        {
            return responseData(res, "", 404, false, "Org Id required", []);
        }
        // Use lean to get plain JavaScript objects and only fetch the 'role' field
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        const roles = await roleModel.find({org_id: org_id}, 'role').lean();

        if (!roles.length) {
            return responseData(res, "No role found", 200, true, "");
        }

        // Directly extract role names using map
        const response = roles.map(({ role }) => role);

        return responseData(res, "Roles found successfully", 200, true, "", response);
    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal Server Error");
    }
};




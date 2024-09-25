import roleModel from "../../../models/adminModels/role.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { responseData } from "../../../utils/respounse.js";



export const createRole = async(req,res) =>{
    try{
        const role = req.body.role;
        const access = req.body.access;


        const isEmpty = (obj) => {
            return Object.entries(obj).length === 0;
        };

        if(!role)
        {
            responseData(res, "", 400, false, "Role is required")
        
        }
        else if(isEmpty(access))
        {
            responseData(res, "", 400, false, "Access is required")
        
        }
        else{

            if (role === 'ADMIN'
                || role === 'Site Supervisor'
                || role === 'Jr.Interior Designer'
                || role === '3D Visualizer'
                || role === 'Jr. Executive HR & Marketing'
                || role === 'Executive Assistant'
                || role === 'Project Architect'
                || role === 'Senior Architect'
                
            )
            {
                // console.log("Role already exists")
                responseData(res, "", 400, false, "This role is predefine")
            }
            else{
                const checkRole = await roleModel.findOne({role});
                if(checkRole)
                {
                    responseData(res, "", 400, false, "Role already exists")

            }
            else{
                 const newRole = await roleModel.create({role, access});
            responseData(res,"Role created successfully", 200, true, "")
            }
        }
           
        }
    }
    catch(err)
    {
        responseData(res, "", 500, false, "Internal Server Error")
        console.log(err)
    }
}

export const getRole = async (req, res) => {
    try {
        // Fetch all roles with lean for better performance
        const roles = await roleModel.find().lean();

        // Get all users in one query
        const users = await registerModel.find({ role: { $in: roles.map(role => role.role) } }).lean();

        // Create a lookup for quick access to user existence
        const userLookup = {};
        users.forEach(user => {
            userLookup[user.role] = true;
        });

        // Build the response based on the role existence in the user lookup
        const response = roles.map(role => ({
            _id: role._id,
            role: role.role,
            createdAt: role.createdAt,
            access: role.access,
            existUser: !!userLookup[role.role],
        }));

        responseData(res, "Roles found successfully", 200, true, "", response);
    } catch (err) {
        responseData(res, "", 500, false, "Internal Server Error");
        console.error(err);
    }
};



export const UpdateRole = async (req, res) => {
    try {
        const { role, access } = req.body;
        const { id } = req.query;

        if (!id) {
            return responseData(res, "", 400, false, "Role id is required");
        }

        if (!role) {
            return responseData(res, "", 400, false, "Role is required");
        }

        if (!access) {
            return responseData(res, "", 400, false, "Access is required");
        }

        const existingRole = await roleModel.findById(id);
        if (!existingRole) {
            return responseData(res, "", 404, false, "Role not found for this id");
        }

        const updatedRole = await roleModel.findByIdAndUpdate(id, { role, access }, { new: true });

        if (updatedRole) {
            const usersToUpdate = await registerModel.find({ role: existingRole.role });

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

        if (!id) {
            return responseData(res, "", 400, false, "Role id is required");
        }

        const check_role = await roleModel.findById(id);
        if (!check_role) {
            return responseData(res, "", 404, false, "Role not found for this id");
        }
        const users = await registerModel.find({ role: check_role.role });
        if (users.length > 0) {
            return responseData(res, "", 400, false, "This role cannot be deleted as it is assigned to the user.");
        }

        await roleModel.findByIdAndDelete(id);
        responseData(res, `${check_role.role} role has been deleted`, 200, true, "");

    } catch (err) {
        console.error(err);
        responseData(res, "", 500, false, "Internal Server Error");
    }
};



export const roleWiseAccess = async(req,res) =>{
try{
    const access = await roleModel.find({});
    if(access.length<1)
    {
        responseData(res, "No role found", 200, true, "")
    }
    else
    {
       const transformedData = {};

        access.forEach(user => {
            Object.keys(user.access).forEach(resource => {
                user.access[resource].forEach(action => {
                    if (!transformedData[resource]) {
                        transformedData[resource] = {};
                    }
                    if (!transformedData[resource][action]) {
                        transformedData[resource][action] = [];
                    }
                    transformedData[resource][action].push(user.role);
                });
            });
        });

        responseData(res, "Role found successfully", 200, true, "", transformedData)
    }



}
catch(err)
{
    responseData(res, "", 500, false, "Internal Server Error")
    console.log(err)
}
}


export const roleName = async (req, res) => {
    try {
        const roles = await roleModel.find({}, 'role'); 
        if (roles.length === 0) {
            return responseData(res, "No role found", 200, true, "");
        }
        const response = roles.map(role => role.role); 

        return responseData(res, "Role found successfully", 200, true, "", response);
    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal Server Error");
    }
}



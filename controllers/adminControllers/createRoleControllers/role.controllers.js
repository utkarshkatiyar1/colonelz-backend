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

export const getRole = async(req,res) =>{
    try{
        const role = await roleModel.find();
        responseData(res, "role found successfully", 200, true, "", role)
    }
    catch(err)
    {
        responseData(res, "", 500, false, "Internal Server Error")
        console.log(err)
    
    }
}

export const UpdateRole = async(req,res) =>{
    try{
        const role = req.body.role;
        const access = req.body.access;
        const id = req.query.id;

        if(!id)
        {
            responseData(res, "", 400, false, "Role id is required")
        }

        if(!role)
        {
            responseData(res, "", 400, false, "Role is required")

        }
        else if(!access)
        {
            responseData(res, "", 400, false, "Access is required")
        }
        else{
            const check_id = await roleModel.findById(id)
            if(!check_id)
            {
                responseData(res,"",404, false, "Role not found for this id")

            }
            else
            {

                const updatedRole = await roleModel.findByIdAndUpdate(id, { role, access });

                if (updatedRole) {
                  const find_user =   await registerModel.find({role:role})
                  if(find_user.length>0)
                  {
                    find_user.forEach(async(user)=>{
                        await registerModel.findByIdAndUpdate(user._id, {access:access})
                    })
                    
                }
                responseData(res, "Role updated successfully", 200, true, "")
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
            return responseData(res, "", 400, false, "This role cannot be deleted because it is assigned to some users. Please remove the users from this role.");
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



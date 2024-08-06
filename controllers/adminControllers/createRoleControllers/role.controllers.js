import roleModel from "../../../models/adminModels/role.model.js";
import { responseData } from "../../../utils/respounse.js";



export const createRole = async(req,res) =>{
    try{
        const role = req.body.role;
        const access = req.body.access;

        if(!role)
        {
            responseData(res, "", 400, false, "Role is required")
        
        }
        else if(!access)
        {
            responseData(res, "", 400, false, "Access is required")
        
        }
        else{
            
            
                const checkRole = await roleModel.findOne({role});
                if(checkRole)
                {
                    responseData(res, "", 400, false, "Role already exists")

            }
            else{
                    const newRole = await roleModel.create({ role, access });
                    responseData(res, "Role created successfully", 200, true, "")
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

        if(!role)
        {
            responseData(res, "", 400, false, "Role is required")

        }
        else if(!access)
        {
            responseData(res, "", 400, false, "Access is required")
        }
        else{

            console.log(access)
            const updatedRole = await roleModel.findByIdAndUpdate(id, {role, access});
            responseData(res,"Role updated successfully", 200, true, "")
        }

    }
    catch(err)
    {
        responseData(res, "", 500, false, "Internal Server Error")
        console.log(err)
    }
}


export const DeleteRole = async(req,res) =>{
    try{
        const id = req.query.id;
        const deletedRole = await roleModel.findByIdAndDelete(id);
        responseData(res,"Role deleted successfully", 200, true, "")
    }
    catch(err)
    {
        responseData(res, "", 500, false, "Internal Server Error")
        console.log(err)
    
    }
}
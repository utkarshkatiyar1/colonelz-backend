import orgModel from "../../../models/orgmodels/org.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { responseData } from "../../../utils/respounse.js";


export const getUserList = async (req, res) => {
    try {
        const userId = req.query.user_id;


        // Validate user ID
        if (!userId) {
            return responseData(res, "", 400, false, "User Id is required");
        }

        // Fetch user and their organization in a single query using lean for better performance
        const check_user = await registerModel.findById(userId).lean();

        if (!check_user) {
            return responseData(res, "", 404, false, "No User Found");
        }

        // Fetch users belonging to the same organization in a single query
        const users = await registerModel.find(
            { status: true, organization: check_user.organization },
            { username: 1, role: 1 } // Only select necessary fields
        ).lean();

        if (!users.length) {
            return responseData(res, "", 404, false, "No Users Found");
        }

        // Construct response with filtered users
        const filteredUsers = users.map(user => ({
            username: user.username,
            role: user.role,
        }));

        return responseData(res, "All users found", 200, true, "", filteredUsers);

    } catch (err) {
        console.error(err);
        return responseData(res, "", 500, false, "Internal server error");
    }
};



// export const userAcessLeadOrProjectList = async(req,res) =>{
//     try{
//         const find_user = await registerModel.find({status:true})
//         for(let i=0;find_user.length;i++){

//         }



//     }
//     catch(err)
//     {
//         console.log(err)
//         responseData(res, "", 500, false, "Invernal  Server Error")
//     }
// }


export const getProjectUser = async (req, res) => {
    try {
        const project_id = req.query.project_id;
        const org_id= req.query.org_id;


        if (!project_id) {
            return responseData(res, "", 400, false, "Project ID is required", []);
        }
        if(!org_id)
        {
            return responseData(res, "", 404, false, "Org Id required", []);
        }

        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        // Fetch project users and senior admins in a single query
        const users = await registerModel.find({
            $or: [
                { 'data.projectData.project_id': project_id },
                { role: { $in: ['Senior Architect', 'ADMIN'] }, status: true, organization: org_id }
            ]
        }).lean(); // Use lean for better performance

        // Extract unique usernames using a Set
        const userList = [...new Set(users.map(user => user.username))];

        responseData(res, "List of Users in Project", 200, true, "", userList);
    } catch (err) {
        console.error(err);
        responseData(res, "", 500, false, "Internal Server Error", []);
    }
};

export const getProjectUserList = async (req, res) => {
    try {
        const project_id = req.query.project_id;
        const org_id= req.query.org_id;


        if (!project_id) {
            return responseData(res, "", 400, false, "Project ID is required", []);
        }
        if(!org_id)
        {
            return responseData(res, "", 404, false, "Org Id required", []);
        }

        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }
        // Fetch project users and senior admins in a single query
        const users = await registerModel.find({
            $or: [
                { 'data.projectData.project_id': project_id },
                { role: { $in: ['Senior Architect', 'ADMIN'] }, status: true, organization: org_id }
            ]
        }).lean(); // Use lean for better performance

        // Extract unique usernames using a Set
        const userList = [...new Set(users.map(user => user.username))];

        responseData(res, "List of Users in Project", 200, true, "", users);
    } catch (err) {
        console.error(err);
        responseData(res, "", 500, false, "Internal Server Error", []);
    }
};



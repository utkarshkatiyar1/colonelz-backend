import registerModel from "../../../models/usersModels/register.model.js";
import { responseData } from "../../../utils/respounse.js";


export const getUserList = async (req, res) => {
    try {
        const userId = req.query.user_id;
        if (!userId) {
            return responseData(res, "", 400, false, "User Id is required");
        }
        else {
            const check_user = await registerModel.findById(userId);
       if(check_user)
       {
           const users = await registerModel.find({ $and: [{ status: true }, { organization: check_user.organization }] })

           if (users) {
               const filteredUsers = users.reduce((acc, user) => {
                   if (user) {
                       acc.push({ username: user.username, role: user.role });
                   }
                   return acc;
               }, []);


               return responseData(res, "all user found", 200, true, "", filteredUsers);

           }
           else {
               return responseData(res, "", 404, false, "No User Found");
           }
       }
       else{
           return responseData(res, "", 404, false, "No User Found");
       }
            
            
          
        }

    }
    catch (err) {
        return responseData(res, "", 500, false, err.message);
    }

}



export const userAcessLeadOrProjectList = async(req,res) =>{
    try{
        const find_user = await registerModel.find({status:true})
        for(let i=0;find_user.length;i++){
            
        }



    }
    catch(err)
    {
        console.log(err)
        responseData(res, "", 500, false, "Invernal  Server Error")
    }
}



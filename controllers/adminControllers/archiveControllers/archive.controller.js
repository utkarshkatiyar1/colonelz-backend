
import { check } from "express-validator";
import arvhiveModel from "../../../models/adminModels/archive.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { responseData } from "../../../utils/respounse.js";

export const archive = async (req, res) => {
    try{
        const user_id = req.query.user_id;
        if(!user_id)
            {
                responseData(res, "", 400, false, "user_id is required", []);
            }
            else{
               const check_user = await registerModel.findById({_id:user_id})
               if(!check_user)
                {
                    responseData(res, "", 400, false, "user not found", []);
                }
            if (check_user.role === "ADMIN" || check_user.role ==="Senior Architect")
                {
                    const archive = await arvhiveModel.find({})
                    if(archive.length <1)
                        {
                            responseData(res, "", 400, false, "No data found", []);
                        }
                        if(archive.length>0)
                            {
                                let response =[]
                               
                                for(let i=0;i<archive.length;i++)
                                    {
                                      response.push({lead_id:archive[i].lead_id,
                                        project_id:archive[i].project_id,
                                        folder_name:archive[i].folder_name,
                                        files:archive[i].files,
                                        type:archive[i].type,
                                        created_at:archive[i].archivedAt,

                                      })
                                    }
                            responseData(res, "Data found", 200, true, "", response);
                            }

                }
                else
                {
                    responseData(res, "", 400, false, "You are not authorized to access this page", []);
                }
            }

    }
    catch (err)
    {
        console.log(error);
        responseData(res, "", 500, false, "Something went wrong", []);
    }

}
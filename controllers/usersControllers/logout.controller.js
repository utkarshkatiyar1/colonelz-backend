import loginModel from "../../models/usersModels/login.model.js";
import registerModel from "../../models/usersModels/register.model.js";
import { responseData } from "../../utils/respounse.js";

export const logout = async (req, res) => {
  const { userId} = req.body;

  try {
    await registerModel.findByIdAndUpdate(userId, { $set: { refreshToken: "" } });

    res.clearCookie("auth");
    res.clearCookie("refreshToken");
    return responseData(res, "Logout successfully", 200, true, "");

  } catch (err) {
    console.error(err);
    return responseData(res, "", 500, false, "Internal Server Error");
  }
};

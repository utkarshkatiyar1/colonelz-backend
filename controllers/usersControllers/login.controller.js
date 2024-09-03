import loginModel from "../../models/usersModels/login.model.js";
import registerModel from "../../models/usersModels/register.model.js";
import { responseData } from "../../utils/respounse.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const generateToken = (userId) => {
  return Jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
};

const insertLogInData = async (res, user) => {
  try {
    const token = generateToken(user._id);

    res.cookie("auth", token, { maxAge: 604800000, httpOnly: true });

    const loginUserData = new loginModel({
      userID: user._id,
      token,
      logInDate: new Date(),
    });

    await loginUserData.save();

    responseData(res, "Login successfully", 200, true, "", {
      userID: user._id,
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("Error saving login data:", error);
    responseData(res, "", 500, false, "Something went wrong, please try again");
  }
};

export const login = async (req, res) => {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return responseData(res, "", 400, false, `${!user_name ? "Username" : "Password"} is required`);
  }

  try {
    const user = await registerModel.findOne({ username: user_name, status: true });

    if (!user) {
      return responseData(res, "", 404, false, "Username or password does not match");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return responseData(res, "", 401, false, "Username or password does not match");
    }

    await insertLogInData(res, user);
  } catch (error) {
    console.error("Internal server error:", error);
    responseData(res, "", 500, false, "Internal server error");
  }
};

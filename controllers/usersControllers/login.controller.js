import loginModel from "../../models/usersModels/login.model.js";
import registerModel from "../../models/usersModels/register.model.js";
import { responseData } from "../../utils/respounse.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const insertLogInData = async (res, user, io) => {
  const token = Jwt.sign(
    { id: user[0]._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("auth", token, { maxAge: 604800000, httpOnly: true });

  const loginUserData = new loginModel({
    userID: user[0]._id,
    token: token,
    logInDate: new Date(),
  });

  loginUserData
    .save()
    .then((_result) => {

      responseData(res, "Login successfully", 200, true, "", {
        userID: user[0]._id,
        token,
        role: user[0].role,
      });
    })
    .catch((_err) => {
      responseData(res, "", 500, false, "Something went wrong, please try again");
    });
};

export const login = async (req, res) => {
  const { user_name, password } = req.body;
  const io = req.io;

  if (!user_name) {
    responseData(res, "", 400, false, "Username is required");
    return;
  }

  if (!password) {
    responseData(res, "", 400, false, "Password is required");
    return;
  }

  try {
    const user = await registerModel.find({ username: user_name, status: true });

    if (user.length < 1) {
      responseData(res, "", 404, false, "Username or password does not match");
      return;
    }
    console

    bcrypt.compare(password, user[0].password, async (_err, result) => {

      if (!result) {
        responseData(res, "", 401, false, "Username or password does not match");
        return;
      }
      insertLogInData(res, user);

     
    });
  } catch (err) {
    responseData(res, "", 500, false, "Internal server error");
    console.log(err);
  }
};

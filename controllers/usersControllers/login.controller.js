import loginModel from "../../models/usersModels/login.model.js";
import registerModel from "../../models/usersModels/register.model.js";
import { responseData } from "../../utils/respounse.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const insertLogInData = async (res, user, io) => {
  const token = Jwt.sign(
    { id: user[0]._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
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
      // Emit login event
      io.emit("login", user[0]._id);

      responseData(res, "login successfully", 200, true, "", {
        userID: user[0]._id,
        token,
        role: user[0].role,
      });
    })
    .catch((_err) => {
      responseData(res, "", 500, false, "Something is wrong please try again");
    });
};

export const login = async (req, res) => {
  const user_name = req.body.user_name;
  const password = req.body.password;
  const io = req.io;
 

  if (!user_name) {
    responseData(res, "", 400, false, "user_name is required");
  } else if (!password) {
    responseData(res, "", 400, false, "Password is required");
  } else {
    try {
      const user = await registerModel.find({ username: user_name, status: true });

      if (user.length < 1) {
        responseData(res, "", 404, false, "user name or password not match");
      } else {
        bcrypt.compare(password, user[0].password, async (_err, result) => {
          if (!result) {
            responseData(res, "", 401, false, "user name or password not match");
          } else {
            try {
              const GetlogToken = await loginModel.find({ userID: user[0]._id });

              if (GetlogToken.length < 2) {
                insertLogInData(res, user, io);
              } else {
                const firstObjGet = GetlogToken[0]._id;
                await loginModel.deleteOne({ _id: firstObjGet });

                io.to(user[0]._id.toString()).emit("loggedOut", { message: "You have been logged out due to multiple logins." });
                console.log(io.to(user[0]._id.toString()).emit)
                insertLogInData(res, user, io);
              }
            } catch (error) {
              responseData(res, "", 500, false, "Something is wrong tokens not get.");
            }
          }
        });
      }
    } catch (err) {
      res.send(err);
      console.log(err);
    }
  }
};

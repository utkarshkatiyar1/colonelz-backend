import { s3 } from "../../utils/function.js"
import registerModel from "../../models/usersModels/register.model.js";
import { responseData } from "../../utils/respounse.js";
import { onlyAlphabetsValidation } from "../../utils/validation.js";



const uploadImage = async (req, fileName, userId, key) => {
  let response = s3
    .upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${userId}/profile`,
      Key: fileName,
      Body: req.files[key].data,
      ContentType: req.files[key].mimetype,
      // ACL: "public-read",
    })
    .promise();
  return response
    .then((data) => {
      return { status: true, data };
    })
    .catch((err) => {
      return { status: false, err };
    });
};

const setProfileUrlInDB = async (res, response, userId, user_name) => {
  registerModel
    .find({ _id: userId })
    .exec()
    .then((result) => {
      if (result.length < 1) {
        responseData(res, "", 404, false, "user not exist");
      }
      if (result.length > 0) {
        registerModel.findByIdAndUpdate(
          result[0]._id,
          { $set: { userProfile: response.data.Location,
            username:user_name
           } },
          (err, docs) => {
            if (err) {
              console.log(err);
            } else {
              console.log("profile url update successfull");
              responseData(
                res,
                "profile update successfully",
                200,
                true,
                "",
                response.data.Location
              );
            }
          }
        );
      }
    })
    .catch((err) => {
      responseData(res, "", 403, false, "server problem");
    });
};

export const profileupload = async (req, res) => {
  const userId = req.body.userId;
  const user_name = req.body.user_name;
  if (!userId) {
    responseData(res, "", 400, false, "userId is required");
  }
  else if (!onlyAlphabetsValidation(user_name) && user_name.length > 3) {
    return responseData(res, "", 400, false, "User Name is not valid");
  }
   else {
    try {
      const file = req.files.file;
      const fileName = Date.now() + "_" + file.name;

      console.log(fileName);
      let response = await uploadImage(req, fileName, userId, "file");
      if (response.status) {
        //  res.send({response})
        setProfileUrlInDB(res, response, userId, user_name);
        //  console.log("data",response.data.Location)
      } else {
        //  res.send({ response });
        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

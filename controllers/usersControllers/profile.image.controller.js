import { s3 } from "../../utils/function.js";
import registerModel from "../../models/usersModels/register.model.js";
import { responseData } from "../../utils/respounse.js";
import { onlyAlphabetsValidation } from "../../utils/validation.js";
import orgModel from "../../models/orgmodels/org.model.js";

const uploadImage = async (req, fileName, userId,org_id, key) => {
  try {
    // Upload the image to S3
    const data = await s3.upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${userId}/profile`,
      Key: fileName,
      Body: req.files[key].data,
      ContentType: req.files[key].mimetype,
      // ACL: 'public-read', // Uncomment if you want the file to be publicly accessible
    }).promise();

    // Create a signed URL for the uploaded image
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${userId}/profile`,
      Key: fileName,
      Expires: 157680000 // URL expires in 5 year
    });
    return { status: true, data, signedUrl };
  } catch (err) {
    return { status: false, err };
  }
};


const updateProfileInDB = async (userId, updates) => {
  try {
    const result = await registerModel.findByIdAndUpdate(userId, { $set: updates }, { new: true });
    return result;
  } catch (err) {
    console.error(err);
    throw new Error('Database update failed');
  }
};

const setProfileUrlInDB = async (res, response, userId, user_name) => {
  try {
    const updates = {};
    if (response) updates.userProfile = response.signedUrl;
    if (user_name) updates.username = user_name;

    const updatedUser = await updateProfileInDB(userId, updates);
    if (!updatedUser) {
      return responseData(res, "", 404, false, "User does not exist");
    }

    return responseData(res, "Profile updated successfully", 200, true, "", updates || response.signedUrl);
  } catch (error) {
    return responseData(res, "", 403, false, "Server problem");
  }
};

export const profileUpload = async (req, res) => {
  const userId = req.body.userId;
  const user_name = req.body.user_name;
  const org_id = req.body.org_id;

  // console.log(req.body)

  if (!userId) {
    return responseData(res, "", 400, false, "UserId is required");
  }
  if(!org_id)
  {
    return responseData(res, "", 400, false, "Org id is required");
  }

  try {
    const check_org = await orgModel.findOne({ _id: org_id })
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }
    const file = req.files ? req.files.file : null; 
let data = []
    if (!file) {
      if (!onlyAlphabetsValidation(user_name) || user_name.length <= 3) {
        return responseData(res, "", 400, false, "User Name is not valid");
      }
      return await setProfileUrlInDB(res, null, userId, user_name);
    }

    const fileName = `${Date.now()}_${file.name}`;
    // console.log(fileName);
    const response = await uploadImage(req, fileName, userId, org_id, "file");
    if (response.status) {
      if(!user_name)
      {
        await setProfileUrlInDB(res, response, userId, null);
      }
      else{
        await setProfileUrlInDB(res, response, userId, user_name);
        console.log
      }
     
    } else {
      // console.log(response);
      return responseData(res, "", 500, false, "Image upload failed");
    }

  } catch (error) {
    console.error(error);
    return responseData(res, "", 500, false, "Server error");
  }
};

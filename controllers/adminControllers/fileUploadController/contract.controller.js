// import { responseData } from "../../../utils/respounse.js";
// import nodemailer from "nodemailer";
// import { s3 } from "../../../utils/function.js"
// import fs from "fs";
// import path from "path"
// import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
// import registerModel from "../../../models/usersModels/register.model.js";
// import leadModel from "../../../models/adminModels/leadModel.js"
// import orgModel from "../../../models/orgmodels/org.model.js";
// import Approval from "../../../models/adminModels/approval.model.js";
// import { createOrUpdateTimeline } from "../../../utils/timeline.utils.js";
// function generateSixDigitNumber() {
//   const min = 100000;
//   const max = 999999;
//   const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

//   return randomNumber;
// }

// const storeOrUpdateContract = async (res, existingContractData, fileUrls, isFirst = false) => {
//   console.log("existing contract data : ",existingContractData)
//   try {
//       let approval = await Approval.findOne({ lead_id: existingContractData.lead_id, org_id: existingContractData.org_id });

//       if (isFirst) {
//           await leadModel.findOneAndUpdate(
//               { lead_id: existingContractData.lead_id, org_id: existingContractData.org_id },
//               { $push: { "contract": existingContractData.contractData } },
//               { new: true }
//           );

//           if (!approval) {
//               approval = new Approval({
//                   lead_id: existingContractData.lead_id,
//                   org_id: existingContractData.org_id,
//                   files: fileUrls.map(file => ({
//                       file_id: file.fileId,
//                       file_name: file.fileName,
//                       file_url: file.fileUrl,
//                       status: "notsend",
//                       users: []
//                   }))
//               });
//           } else {
//               fileUrls.forEach(file => {
//                   if (!approval.files.some(f => f.file_id === file.fileId)) {
//                       approval.files.push({
//                           file_id: file.fileId,
//                           file_name: file.fileName,
//                           file_url: file.fileUrl,
//                           status: "notsend",
//                           users: []
//                       });
//                   }
//               });
//           }

//           await approval.save();
//           return responseData(res, "Contract shared successfully", 200, true, "");
//       }

//       const check_lead = await leadModel.findOne({ lead_id: existingContractData.lead_id, org_id: existingContractData.org_id });

//       if (check_lead) {
//           await leadModel.findOneAndUpdate(
//               { lead_id: existingContractData.lead_id, org_id: existingContractData.org_id },
//               { $push: { "contract": existingContractData.contractData } }
//           );

//           if (approval) {
//               fileUrls.forEach(file => {
//                   if (!approval.files.some(f => f.file_id === file.fileId)) {
//                       approval.files.push({
//                           file_id: file.fileId,
//                           file_name: file.fileName,
//                           file_url: file.fileUrl,
//                           status: "notsend",
//                           users: []
//                       });
//                   }
//               });

//               await approval.save();
//           }

//           return responseData(res, "Contract shared successfully", 200, true, "");
//       }

//       return responseData(res, "Lead not found", 404, false, "");
//   } catch (err) {
//       return responseData(res, "Error occurred while storing contract", 403, false, err.message);
//   }
// };

// const uploadImage = async (req, filePath, lead_id, org_id, fileName) => {

//   if (typeof fileName !== 'string') {
//     fileName = String(fileName);
//   }
//   const data = await s3
//     .upload({
//       Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Contract`,
//       Key: fileName,
//       Body: fs.createReadStream(filePath),
//       ContentType: 'application/pdf',

//     })
//     .promise();

//       const signedUrl = s3.getSignedUrl('getObject', {
//         Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Contract`,
//         Key: fileName,
//         Expires: 157680000 // URL expires in 5 year
//       });
//       return { status: true, data, signedUrl };

// };

const saveFileUploadData = async (res, existingFileUploadData) => {
  try {
    // Use update query to push data
    const updateResult = await fileuploadModel.updateOne(
      {
        lead_id: existingFileUploadData.lead_id,
        org_id: existingFileUploadData.org_id,
        "files.folder_name": existingFileUploadData.folder_name,
      },
      {
        $set: {
          "files.$.updated_date": existingFileUploadData.updated_Date,
        },
        $push: {
          "files.$.files": { $each: existingFileUploadData.files },
        },
      },
      {
        arrayFilters: [
          { "folder.folder_name": existingFileUploadData.folder_name },
        ],
      }
    );

    if (updateResult.modifiedCount === 1) {
      console.log("File Upload Data Updated Successfully");
    } else {
      // If the folder does not exist, create a new folder object
      const updateNewFolderResult = await fileuploadModel.updateOne(
        {
          lead_id: existingFileUploadData.lead_id,
          org_id: existingFileUploadData.org_id,
        },
        {
          $push: {
            files: {
              folder_name: existingFileUploadData.folder_name,
              updated_date: existingFileUploadData.updated_date,
              files: existingFileUploadData.files,
            },
          },
        }
      );

      if (updateNewFolderResult.modifiedCount === 1) {
        console.log(
          "New Folder Created and File Upload Data Updated Successfully"
        );
      } else {
        console.log("Lead not found or file data already updated");
        responseData(
          res,
          "",
          404,
          false,
          "Lead not found or file data already updated"
        );
      }
    }
  } catch (error) {
    console.error("Error saving file upload data:", error);
    responseData(
      res,
      "",
      500,
      false,
      "Something went wrong. File data not updated"
    );
  }
};

// export const contractShare = async (req, res) => {
//   const lead_id = req.body.lead_id;
//   const userId = req.body.user_id;
//   const org_id = req.body.org_id;

//   // ✅ New fields from form
//   const project_type = req.body.project_type;
//   const contract_type = req.body.contract_type;
//   const client_name = req.body.client_name;   // expecting array
//   const client_email = req.body.client_email; // expecting array
//   const client_phone = req.body.client_phone; // expecting array
//   const project_name = req.body.project_name;
//   const site_address = req.body.site_address;
//   const date = req.body.date;
//   const city = req.body.city;
//   const quotation = req.body.quotation;
//   const design_stage = req.body.design_stage; // expecting array
//   const number = req.body.number;             // expecting [string, string, string]
//   const design_charges = req.body.design_charges;
//   const discount = req.body.discount;
//   const design_charges_per_sft = req.body.design_charges_per_sft;
//   const design_cover_area_in_sft = req.body.design_cover_area_in_sft;
//   const balcony_charges_per_sft = req.body.balcony_charges_per_sft;
//   const balcony_area_in_sft = req.body.balcony_area_in_sft;
//   const terrace_covered_charges_per_sft = req.body.terrace_covered_charges_per_sft;
//   const terrace_covered_area_in_sft = req.body.terrace_covered_area_in_sft;
//   const terrace_open_charges_per_sft = req.body.terrace_open_charges_per_sft;
//   const terrace_open_area_in_sft = req.body.terrace_open_area_in_sft;
//   const additional_note = req.body.additional_note;

//   if (!lead_id) {
//     return responseData(res, "", 400, false, "lead_id is required");
//   } else if (!userId) {
//     return responseData(res, "", 400, false, "user_id is required");
//   } else if (!org_id) {
//     return responseData(res, "", 400, false, "Org Id is required");
//   }

//   try {
//     const check_org = await orgModel.findOne({ _id: org_id });
//     if (!check_org) {
//       return responseData(res, "", 404, false, "Org not found");
//     }

//     const find_user = await registerModel.findOne({ _id: userId, organization: org_id });
//     if (!find_user) {
//       return responseData(res, "", 400, false, "You are not a registered User");
//     }

// const lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id });
// if (!lead) {
//   return responseData(res, "", 400, false, "Lead Not Found");
// }

// const check_lead = await fileuploadModel.findOne({ lead_id: lead_id, org_id: org_id });
// if (!check_lead) {
//   return responseData(res, "", 400, false, "This Lead Converted Into Project");
// }

//     const contract_pdf = req.files.file;
//     const filePath = path.join("contract", contract_pdf.name);

//     contract_pdf.mv(filePath, async (err) => {
//       if (err) {
//         console.error("Error saving file:", err);
//         return responseData(res, "", 500, false, "Failed to save file");
//       }

//       try {
//         const response = await uploadImage(req, filePath, lead_id, org_id, contract_pdf.name);

//         if (response.status) {
//           const fileId = `FL-${generateSixDigitNumber()}`;
//           const fileName = decodeURIComponent(response.data.Location.split("/").pop().replace(/\+/g, " "));
// let fileUrls = [
//   {
//     fileUrl: response.signedUrl,
//     fileName,
//     fileId,
//     fileSize: `${contract_pdf.size / 1024} KB`,
//     date: new Date(),
//   },
// ];

//         const contractData = {
//           itemId: fileId,
//           admin_status: "notsend",
//           file_name: fileName,
//           files: response.signedUrl,
//           remark: "",
//           // ✅ Added project fields
//           project_type,
//           contract_type,
//           client_name,  // expecting array
//           client_email, // expecting array
//           client_phone,// expecting array
//           project_name,
//           site_address,
//           date,
//           city,
//           quotation,
//           design_stage,// expecting array
//           number,           // expecting [string, string, string]
//           design_charges,
//           discount,
//           design_charges_per_sft,
//           design_cover_area_in_sft,
//           balcony_charges_per_sft,
//           balcony_area_in_sft,
//           terrace_covered_charges_per_sft,
//           terrace_covered_area_in_sft,
//           terrace_open_charges_per_sft,
//           terrace_open_area_in_sft,
//           additional_note,
//           // ✅ Automatically store creation timestamp
//           createdAt: new Date().toISOString(),
//         };

// const existingFile = await fileuploadModel.findOne({ lead_id: lead_id, org_id: org_id });
// const folder_name = `Contract`;
// const lead_Name = existingFile.name;

// if (existingFile) {
//   await saveFileUploadData(res, {
//     lead_id,
//     org_id,
//     lead_Name,
//     folder_name,
//     updated_date: new Date(),
//     files: fileUrls,
//   });
// }

//           await leadModel.findOneAndUpdate(
//             { lead_id: lead_id, org_id: org_id },
//             {
//               $set: { lead_status: "contract", contract_Status: true },
//               $push: {
//                 lead_update_track: {
//                   username: find_user.username,
//                   role: find_user.role,
//                   message: ` has created contract in lead ${check_lead.lead_name} .`,
//                   updated_date: new Date(),
//                 },
//               },
//             }
//           );

//           const leadUpdate = {
//             username: find_user.username,
//             role: find_user.role,
//             message: ` has created contract (${contractData.file_name}) in lead ${check_lead.lead_name} .`,
//             updated_date: new Date(),
//             type: "contract creation",
//             tags: [],
//           };

//           await createOrUpdateTimeline(lead_id, "", org_id, leadUpdate, {}, res);

//           responseData(res, "contract create successfully", 200, true, "", response.signedUrl);

//           fs.unlink(filePath, (unlinkErr) => {
//             if (unlinkErr) {
//               console.error("Error deleting local PDF file:", unlinkErr);
//             } else {
//               console.log("Local PDF file deleted successfully");
//             }
//           });

//           if (lead.contract.length < 1) {
//             const createObj = { lead_id, org_id, contractData };
//             await storeOrUpdateContract(res, createObj, fileUrls, true);
//           } else {
//             const createObj = { lead_id, org_id, contractData };
//             await storeOrUpdateContract(res, createObj, fileUrls);
//           }
//         } else {
//           responseData(res, "", 400, false, "contract create failed", "");
//         }
//       } catch (error) {
//         console.error("Error uploading image:", error);
//         responseData(res, "", 500, false, "contract create failed", "");
//       }
//     });
//   } catch (err) {
//     console.log(err);
//     return responseData(res, "", 500, false, "Internal Server Error");
//   }
// };

import { responseData } from "../../../utils/respounse.js";
import nodemailer from "nodemailer";
import { s3 } from "../../../utils/function.js";
import fs from "fs";
import path from "path";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import registerModel from "../../../models/usersModels/register.model.js";
import leadModel from "../../../models/adminModels/leadModel.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import Approval from "../../../models/adminModels/approval.model.js";
import { createOrUpdateTimeline } from "../../../utils/timeline.utils.js";

// ✅ Generate random ID for files
function generateSixDigitNumber() {
  return Math.floor(100000 + Math.random() * 900000);
}

// ✅ Upload to S3
const uploadImage = async (filePath, lead_id, org_id, fileName) => {
  const data = await s3
    .upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Contract`,
      Key: fileName,
      Body: fs.createReadStream(filePath),
      ContentType: "application/pdf",
    })
    .promise();

  const signedUrl = s3.getSignedUrl("getObject", {
    Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Contract`,
    Key: fileName,
    Expires: 157680000, // 5 years
  });

  return { data, signedUrl };
};

// ✅ Save contract reference inside Approval & Lead
const storeOrUpdateContract = async (contractData, fileUrls, isFirst) => {
  let approval = await Approval.findOne({
    lead_id: contractData.lead_id,
    org_id: contractData.org_id,
  });

  if (isFirst && !approval) {
    approval = new Approval({
      lead_id: contractData.lead_id,
      org_id: contractData.org_id,
      files: fileUrls.map((file) => ({
        file_id: file.fileId,
        file_name: file.fileName,
        file_url: file.fileUrl,
        status: "notsend",
        users: [],
      })),
    });
  } else {
    fileUrls.forEach((file) => {
      if (!approval.files.some((f) => f.file_id === file.fileId)) {
        approval.files.push({
          file_id: file.fileId,
          file_name: file.fileName,
          file_url: file.fileUrl,
          status: "notsend",
          users: [],
        });
      }
    });
  }
  await approval.save();

  await leadModel.findOneAndUpdate(
    { lead_id: contractData.lead_id, org_id: contractData.org_id },
    { $push: { contract: contractData.contractData } }
  );
};

export const contractShare = async (req, res) => {
  try {
    const { lead_id, user_id, org_id, project_type, project_name } = req.body;

    if (!lead_id || !user_id || !org_id) {
      return responseData(
        res,
        "",
        400,
        false,
        "lead_id, user_id, org_id are required"
      );
    }

    // ✅ Check org, user, lead
    const check_org = await orgModel.findById(org_id);
    if (!check_org) return responseData(res, "", 404, false, "Org not found");

    const find_user = await registerModel.findOne({
      _id: user_id,
      organization: org_id,
    });
    if (!find_user)
      return responseData(res, "", 400, false, "Not a registered User");

    const lead = await leadModel.findOne({ lead_id, org_id });
    if (!lead) return responseData(res, "", 404, false, "Lead Not Found");

    const check_lead = await fileuploadModel.findOne({
      lead_id: lead_id,
      org_id: org_id,
    });
    if (!check_lead) {
      return responseData(
        res,
        "",
        400,
        false,
        "This Lead Converted Into Project"
      );
    }

    // ✅ Handle File Upload
    const contract_pdf = req.files.file;
    const filePath = path.join("contract", contract_pdf.name);

    await contract_pdf.mv(filePath);

    const response = await uploadImage(
      filePath,
      lead_id,
      org_id,
      contract_pdf.name
    );

    // ✅ Prepare file info
    const fileId = `FL-${generateSixDigitNumber()}`;
    const fileName = decodeURIComponent(
      response.data.Location.split("/").pop().replace(/\+/g, " ")
    );

    const fileUrls = [
      {
        fileUrl: response.signedUrl,
        fileName,
        fileId,
        fileSize: `${(contract_pdf.size / 1024).toFixed(2)} KB`,
        date: new Date(),
      },
    ];

    // ✅ Prepare contract data
    const contractData = {
      itemId: fileId,
      admin_status: "notsend",
      file_name: fileName,
      files: response.signedUrl,
      remark: "",
      project_type,
      project_name,
    };

    const existingFile = await fileuploadModel.findOne({
      lead_id: lead_id,
      org_id: org_id,
    });
    const folder_name = `Contract`;
    const lead_Name = existingFile.name;

    if (existingFile) {
      await saveFileUploadData(res, {
        lead_id,
        org_id,
        lead_Name,
        folder_name,
        updated_date: new Date(),
        files: fileUrls,
      });
    }

    // ✅ Update Lead & Push Contract
    await leadModel.findOneAndUpdate(
      { lead_id, org_id },
      {
        $set: { lead_status: "contract", contract_Status: true },
        $push: {
          // contract: contractData,
          lead_update_track: {
            username: find_user.username,
            role: find_user.role,
            message: ` created contract (${contractData.file_name}) in lead ${lead.lead_name}.`,
            updated_date: new Date(),
          },
        },
      }
    );

    // ✅ Create Timeline Entry
    await createOrUpdateTimeline(
      lead_id,
      "",
      org_id,
      {
        username: find_user.username,
        role: find_user.role,
        message: ` created contract (${contractData.file_name}) in lead ${lead.lead_name}.`,
        updated_date: new Date(),
        type: "contract creation",
        tags: [],
      },
      {},
      res
    );

    // ✅ Store in Approval (if needed)
    const isFirst = lead.contract.length < 1;
    await storeOrUpdateContract(
      { lead_id, org_id, contractData },
      fileUrls,
      isFirst
    );

    // ✅ Delete local file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting local PDF file:", err);
    });

    return responseData(
      res,
      "Contract created successfully",
      200,
      true,
      "",
      response.signedUrl
    );
  } catch (error) {
    console.error("Error in contractShare:", error);
    return responseData(
      res,
      "",
      500,
      false,
      "Internal Server Error",
      error.message
    );
  }
};

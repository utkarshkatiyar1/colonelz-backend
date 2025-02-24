import { responseData } from "../../../utils/respounse.js";
import nodemailer from "nodemailer";
import { s3 } from "../../../utils/function.js"
import fs from "fs";
import path from "path"
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import registerModel from "../../../models/usersModels/register.model.js";
import leadModel from "../../../models/adminModels/leadModel.js"
import orgModel from "../../../models/orgmodels/org.model.js";
import Approval from "../../../models/adminModels/approval.model.js";
import { createOrUpdateTimeline } from "../../../utils/timeline.utils.js";
function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}

const storeOrUpdateContract = async (res, existingContractData, fileUrls, isFirst = false) => {
  try {
      let approval = await Approval.findOne({ lead_id: existingContractData.lead_id, org_id: existingContractData.org_id });

      if (isFirst) {
          await leadModel.findOneAndUpdate(
              { lead_id: existingContractData.lead_id, org_id: existingContractData.org_id },
              { $push: { "contract": existingContractData.contractData } },
              { new: true }
          );

          if (!approval) {
              approval = new Approval({
                  lead_id: existingContractData.lead_id,
                  org_id: existingContractData.org_id,
                  files: fileUrls.map(file => ({
                      file_id: file.fileId,
                      file_name: file.fileName,
                      file_url: file.fileUrl,
                      status: "notsend",
                      users: []
                  }))
              });
          } else {
              fileUrls.forEach(file => {
                  if (!approval.files.some(f => f.file_id === file.fileId)) {
                      approval.files.push({
                          file_id: file.fileId,
                          file_name: file.fileName,
                          file_url: file.fileUrl,
                          status: "notsend",
                          users: []
                      });
                  }
              });
          }

          await approval.save();
          return responseData(res, "Contract shared successfully", 200, true, "");
      } 
      
      const check_lead = await leadModel.findOne({ lead_id: existingContractData.lead_id, org_id: existingContractData.org_id });

      if (check_lead) {
          await leadModel.findOneAndUpdate(
              { lead_id: existingContractData.lead_id, org_id: existingContractData.org_id },
              { $push: { "contract": existingContractData.contractData } }
          );

          if (approval) {
              fileUrls.forEach(file => {
                  if (!approval.files.some(f => f.file_id === file.fileId)) {
                      approval.files.push({
                          file_id: file.fileId,
                          file_name: file.fileName,
                          file_url: file.fileUrl,
                          status: "notsend",
                          users: []
                      });
                  }
              });

              await approval.save();
          }

          return responseData(res, "Contract shared successfully", 200, true, "");
      }

      return responseData(res, "Lead not found", 404, false, "");
  } catch (err) {
      return responseData(res, "Error occurred while storing contract", 403, false, err.message);
  }
};


const uploadImage = async (req, filePath, lead_id, org_id, fileName) => {

  if (typeof fileName !== 'string') {
    fileName = String(fileName);
  }
  const data = await s3
    .upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Contract`,
      Key: fileName,
      Body: fs.createReadStream(filePath),
      ContentType: 'application/pdf',
   
    })
    .promise();
  
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Contract`,
        Key: fileName,
        Expires: 157680000 // URL expires in 5 year
      });
      return { status: true, data, signedUrl };
    
};

const saveFileUploadData = async (
  res,
  existingFileUploadData,

) => {
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
        { lead_id: existingFileUploadData.lead_id, org_id: existingFileUploadData.org_id },
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
        console.log("New Folder Created and File Upload Data Updated Successfully");
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


export const contractShare = async (req, res) => {

  const lead_id = req.body.lead_id;
  const userId = req.body.user_id;
  const org_id = req.body.org_id;

  if (!lead_id) {
    responseData(res, "", 400, false, "lead_id is required");

  }
 else  if (!userId) {
    responseData(res, "", 400, false, "user_id is required");

  }
  else if(!org_id)
  {
    responseData(res, "", 400, false, "Org Id is required");

  }

  else {
    try {

      const check_org = await orgModel.findOne({ _id: org_id })
      if (!check_org) {
        return responseData(res, "", 404, false, "Org not found");
      }
      const find_user = await registerModel.findOne({ _id: userId, organization: org_id });
      if (find_user) {

        const lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id })
        if (!lead) {
          return responseData(res, "", 400, false, "Lead Not Found");
        }

        const check_lead = await fileuploadModel.findOne({ lead_id: lead_id, org_id: org_id })
        if (!check_lead) {
          return responseData(res, "", 400, false, "This Lead Converted Into Project");
        }
        const contract_pdf = req.files.file;

        const filePath = path.join('contract', contract_pdf.name);

        contract_pdf.mv(filePath, async (err) => {
          if (err) {
            console.error('Error saving file:', err);
            return responseData(res, '', 500, false, 'Failed to save file');
          }

          let response;
          try {

            response = await uploadImage(req, filePath, lead_id,org_id, contract_pdf.name);

            if (response.status) {

              const fileId = `FL-${generateSixDigitNumber()}`;
              const fileName = decodeURIComponent(response.data.Location.split('/').pop().replace(/\+/g, ' '));
              let fileUrls = [{
                fileUrl: response.signedUrl,
                fileName: decodeURIComponent(response.data.Location.split('/').pop().replace(/\+/g, ' ')),
                fileId: fileId,
                fileSize: `${contract_pdf.size / 1024} KB`,
                date: new Date()
              }]

              const contractData = {
                itemId: fileId,
                admin_status: "notsend",
                file_name: fileName,
                files: response.signedUrl,
                remark: "",
              };


              const existingFile = await fileuploadModel.findOne({
                lead_id: lead_id, org_id: org_id
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
              await leadModel.findOneAndUpdate({ lead_id: lead_id, org_id: org_id },
                {
                  $set: {
                    lead_status: "contract",
                    contract_Status: true
                  },
                  $push: {
                    lead_update_track: {
                      username: find_user.username,
                      role: find_user.role,
                      message: ` has created contract in lead ${check_lead.lead_name} .`,
                      updated_date: new Date()
                    }
                  }
                }
              )

              const leadUpdate = {
                username: find_user.username,
                role: find_user.role,
                message: ` has created contract (${contractData.file_name}) in lead ${check_lead.lead_name} .`,
                updated_date: new Date(),
                type: "contract creation", 
                tags: [],
              }

              await createOrUpdateTimeline(lead_id, '', org_id, leadUpdate, {}, res);

              responseData(res, "contract create successfully", 200, true, "", response.signedUrl);

              fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Error deleting local PDF file:', unlinkErr);
                } else {
                  console.log('Local PDF file deleted successfully');
                }
              });

              if (lead.contract.length < 1) {

                const createObj = {
                    lead_id,
                    org_id,
                    contractData,
                }

                await storeOrUpdateContract(res, createObj, fileUrls, true);
              }
              else {
                  const createObj = {
                      lead_id,
                      org_id,
                      contractData,
                  }
                  await storeOrUpdateContract(res, createObj, fileUrls);
              }

            } else {
              // console.log(response)
              responseData(res, "", 400, false, "contract create failed", "");
            }
          } catch (error) {
            console.error("Error uploading image:", error);
            responseData(res, "", 500, false, "contract create failed", "");
          }
        });
      }
      else {
        return responseData(res, "", 400, false, "You are not a registered User");
      }
    }
    catch (err) {
      console.log(err)
      return responseData(res, "", 500, false, "Internal Server Error");
    }
  }
}


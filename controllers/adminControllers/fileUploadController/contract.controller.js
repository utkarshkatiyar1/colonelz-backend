import { responseData } from "../../../utils/respounse.js";
import nodemailer from "nodemailer";
import { s3 } from "../../../utils/function.js"
import fs from "fs";
import path from "path"
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import registerModel from "../../../models/usersModels/register.model.js";
import leadModel from "../../../models/adminModels/leadModel.js"
import orgModel from "../../../models/orgmodels/org.model.js";
function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}

const storeOrUpdateContract = async (res, existingContractData, isFirst = false) => {
    try {
        if (isFirst) {
            const updatedLead = await leadModel.findOneAndUpdate(
                { lead_id: existingContractData.lead_id, org_id: existingContractData.org_id },
                {
                    $push: { "contract": existingContractData.contractData }
                },
                { new: true } // Return the updated document
            );
            return responseData(res, `Contract shared successfully`, 200, true, "");

        }
        else {
            const check_lead = await leadModel.findOne({ lead_id: existingContractData.lead_id, org_id: existingContractData.org_id });
            if (check_lead) {
                const updatedLead = await leadModel.findOneAndUpdate(
                    { lead_id: existingContractData.lead_id, org_id: existingContractData.org_id },
                    {
                        $push: {
                            "contract": existingContractData.contractData
                        }
                    }
                )
                return responseData(res, `Contract shared successfully`, 200, true, "");
            }
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Error occured while storing contract");
    }

}

const uploadImage = async (req, filePath, lead_id, org_id, fileName) => {

  if (typeof fileName !== 'string') {
    fileName = String(fileName);
  }
  let response = s3
    .upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/contract`,
      Key: fileName,
      Body: fs.createReadStream(filePath),
      ContentType: 'application/pdf',
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
                fileUrl: response.data.Location,
                fileName: fileName,
                fileId: fileId,
                fileSize: `${contract_pdf.size / 1024} KB`,
                date: new Date()
              }]

              const contractData = {
                itemId: fileId,
                admin_status: "notsend",
                file_name: fileName,
                files: response.data.Location,
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

              responseData(res, "contract create successfully", 200, true, "", response.data.Location);

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

                await storeOrUpdateContract(res, createObj, true);
              }
              else {
                  const createObj = {
                      lead_id,
                      org_id,
                      contractData,
                  }
                  await storeOrUpdateContract(res, createObj);
              }

            } else {
              console.log(response)
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


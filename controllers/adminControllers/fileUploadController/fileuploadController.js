import { s3 } from "../../../utils/function.js";
import dotenv from "dotenv";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import leadModel from "../../../models/adminModels/leadModel.js";
import { responseData } from "../../../utils/respounse.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import Approval from "../../../models/adminModels/approval.model.js";
import { createOrUpdateTimeline } from "../../../utils/timeline.utils.js";

dotenv.config();

function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}

const uploadFileDrawing = async (
  file,
  fileName,
  lead_id,
  org_id,
  folder_name,
  sub_folder_name_first,
  sub_folder_name_second
) => {
  const data = await s3
    .upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype,
    })
    .promise();
  const signedUrl = s3.getSignedUrl("getObject", {
    Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`,
    Key: fileName,
    Expires: 157680000, // URL expires in 5 year
  });
  return { status: true, data, signedUrl };
};

const uploadFile = async (file, fileName, lead_id, org_id, folder_name) => {
  // console.log(fileName)
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  let newFileName = `${fileName}_${timestamp}`;

  const data = await s3
    .upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/${folder_name}`,
      Key: newFileName,
      Body: file.data,
      ContentType: file.mimetype,
    })
    .promise();
  const signedUrl = s3.getSignedUrl("getObject", {
    Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/${folder_name}`,
    Key: newFileName,
    Expires: 157680000, // URL expires in 5 year
  });
  return { status: true, data, signedUrl };
};

const saveFileUploadData = async (
  res,
  existingFileUploadData,
  isFirst = false
) => {
  try {
    if (isFirst) {
      const firstFile = await fileuploadModel.create({
        lead_id: existingFileUploadData.lead_id,
        org_id: existingFileUploadData.org_id,
        lead_name: existingFileUploadData.lead_Name,
        files: [
          {
            folder_name: existingFileUploadData.folder_name,
            updated_date: existingFileUploadData.updated_Date,
            files: existingFileUploadData.files,
          },
        ],
      });
      responseData(res, "First file created successfully", 200, true);
    } else {
      // Use update query to push data
      const updateResult = await fileuploadModel.updateOne(
        {
          lead_id: existingFileUploadData.lead_id,
          org_id: existingFileUploadData.org_id,
          "files.folder_name": existingFileUploadData.folder_name,
        },
        {
          $push: {
            "files.$.files": { $each: existingFileUploadData.files },
          },
          $set: {
            "files.$.updated_date": existingFileUploadData.updated_Date,
          },
        },
        {
          arrayFilters: [
            { "folder.folder_name": existingFileUploadData.folder_name },
          ],
        }
      );

      if (updateResult.modifiedCount === 1) {
        responseData(res, "File data updated successfully", 200, true);
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
                updated_date: existingFileUploadData.updated_Date,
                files: existingFileUploadData.files,
              },
            },
          }
        );

        if (updateNewFolderResult.modifiedCount === 1) {
          responseData(res, "New folder created successfully", 200, true);
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

// const fileupload = async (req, res) => {
//   try {
//     console.log("Incoming body:", req.body);

//     const { folder_name, lead_id, org_id } = req.body;

//     if (!lead_id) return responseData(res, "", 403, false, "lead Id required!", []);
//     if (!folder_name) return responseData(res, "", 403, false, "folder name required!", []);
//     if (!org_id) return responseData(res, "", 403, false, "Org Id required!", []);

//     console.log("Step 2: Checking org...");
//     const check_org = await orgModel.findOne({ _id: org_id });
//     if (!check_org) return responseData(res, "", 404, false, "Org not found!", []);

//     console.log("Step 3: Checking lead...");
//     const find_lead = await leadModel.find({ lead_id, org_id });
//     if (find_lead.length < 1) return responseData(res, "", 404, false, "lead not found!", []);

//     const lead_Name = find_lead[0].name;

//     console.log("Step 4: Checking files...");
//     const filesInput = req.files?.files || req.files;
//     const files = Array.isArray(filesInput) ? filesInput : [filesInput];
//     if (!files || files.length === 0) {
//       return res.status(400).send({ status: false, errormessage: "No files provided", data: [] });
//     }

//     console.log("Step 5: Uploading files...");
//     const fileSize = [];
//     const fileUploadPromises = files.slice(0, 5).map((file) => {
//       fileSize.push(file.size / 1024);
//       return uploadFile(file, file.name, lead_id, org_id, folder_name);
//     });

//     const responses = await Promise.all(fileUploadPromises);
//     console.log("Upload responses:", responses);

//     const successfullyUploadedFiles = responses.filter(r => r && (r.Location || r.data?.Location));
//     if (successfullyUploadedFiles.length === 0) {
//       return res.status(500).send({ status: false, errormessage: "Error uploading files", data: [] });
//     }

//     console.log("Step 6: Preparing metadata...");
//     const fileUrls = successfullyUploadedFiles.map((result, i) => {
//       const loc = result.data?.Location || result.Location;
//       return {
//         fileUrl: result.signedUrl || result.data?.signedUrl,
//         fileName: decodeURIComponent(loc.split('/').pop().replace(/\+/g, ' ')),
//         fileId: `FL-${generateSixDigitNumber()}`,
//         fileSize: `${fileSize[i]} KB`,
//         date: new Date(),
//       };
//     });

//     console.log("Step 7: Saving file record...");
//     const existingFile = await fileuploadModel.findOne({ lead_id, org_id });
//     if (existingFile) {
//       await saveFileUploadData(res, { lead_id, org_id, lead_Name, folder_name, updated_Date: new Date(), files: fileUrls });
//     } else {
//       await saveFileUploadData(res, { lead_id, org_id, lead_Name, folder_name, updated_Date: new Date(), files: fileUrls }, true);
//     }

//     console.log("Step 8: Storing contract reference...");
//     const contractDatas = successfullyUploadedFiles.map((result) => {
//       const loc = result.data?.Location || result.Location;
//       return {
//         lead_id,
//         org_id,
//         itemId: `FL-${generateSixDigitNumber()}`,
//         admin_status: "notsend",
//         file_name: decodeURIComponent(loc.split('/').pop().replace(/\+/g, ' ')),
//         files: result.signedUrl || result.data?.signedUrl,
//         remark: "",
//         project_type: "",
//         project_name: "",
//       };
//     });

//     // const isFirst = Array.isArray(find_lead[0].contract) ? find_lead[0].contract.length < 1 : true;
//     for (const contractData of contractDatas) {
//       // ✅ Update Lead & Push Contract
//       await leadModel.findOneAndUpdate(
//         { lead_id, org_id },
//         {
//           $set: { lead_status: "contract", contract_Status: true },
//           $push: {
//             // contract: contractData,
//             lead_update_track: {
//               username: find_user.username,
//               role: find_user.role,
//               message: ` created contract (${contractData.file_name}) in lead ${lead.lead_name}.`,
//               updated_date: new Date(),
//             },
//           },
//         }
//       );
//     }

//   } catch (err) {
//     console.error("Upload error:", err);
//     if (!res.headersSent) {
//       res.status(500).send({ status: false, errormessage: err.message, data: [] });
//     }
//   }
// };

// Save contract reference inside Approval & Lead
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

export const fileupload = async (req, res) => {
  const { folder_name, lead_id, org_id } = req.body;

  if (!lead_id)
    return responseData(res, "", 403, false, "lead Id required!", []);
  if (!folder_name)
    return responseData(res, "", 403, false, "folder name required!", []);
  if (!org_id) return responseData(res, "", 403, false, "Org Id required!", []);

  try {
    // Check Org
    const check_org = await orgModel.findById(org_id);
    if (!check_org)
      return responseData(res, "", 404, false, "Org not found!", []);

    // Check Lead
    const lead = await leadModel.findOne({ lead_id, org_id });
    if (!lead) return responseData(res, "", 404, false, "lead not found!", []);

    // Check Files
    const files = Array.isArray(req.files?.files)
      ? req.files.files
      : [req.files?.files];
    if (!files || files.length === 0) {
      return res.send({
        message: "",
        statuscode: 400,
        status: false,
        errormessage: "No files provided",
        data: [],
      });
    }

    // Limit to 5 files
    const filesToUpload = files.slice(0, 5);
    const fileUploadPromises = filesToUpload.map((file) =>
      uploadFile(file, file.name, lead_id, org_id, folder_name)
    );

    const responses = await Promise.all(fileUploadPromises);
    const successfullyUploadedFiles = responses
      .filter((res) => res && (res.Location || res.data?.Location))
      .map((res, idx) => {
        const loc = res.data?.Location || res.Location;
        return {
          fileUrl: res.signedUrl || res.data?.signedUrl,
          fileName: decodeURIComponent(
            loc.split("/").pop().replace(/\+/g, " ")
          ),
          fileId: `FL-${generateSixDigitNumber()}`,
          fileSize: `${(filesToUpload[idx].size / 1024).toFixed(2)} KB`,
          date: new Date(),
        };
      });
    if (successfullyUploadedFiles.length < 1) {
      return res.send({
        message: "",
        code: 500,
        status: false,
        errormessage: "Error uploading files",
        data: [],
      });
    }

    // Save File Upload Record
    const existingFile = await fileuploadModel.findOne({ lead_id, org_id });
    const lead_Name = lead.name;

    if (existingFile) {
      await saveFileUploadData(res, {
        lead_id,
        org_id,
        lead_Name,
        folder_name,
        updated_date: new Date(),
        files: successfullyUploadedFiles,
      });
    } else {
      await saveFileUploadData(
        res,
        {
          lead_id,
          org_id,
          lead_Name,
          folder_name,
          updated_date: new Date(),
          files: successfullyUploadedFiles,
        },
        true
      );
    }

    //  Prepare contractData (project_type & project_name are empty here)
    const contractDatas = successfullyUploadedFiles.map((result) => ({
      lead_id,
      org_id,
      itemId: result.fileId,
      admin_status: "notsend",
      file_name: result.fileName,
      files: result.fileUrl,
      remark: "",
      project_type: "", // empty here
      project_name: "", // empty here
    }));

    //  Prepare track updates for all uploaded contracts
    const leadUpdates = contractDatas.map((c) => ({
      message: ` created contract (${c.file_name}) in lead ${lead.lead_name}.`,
      updated_date: new Date(),
    }));

    //  Update Lead (push all contracts + track logs)
    await leadModel.findOneAndUpdate(
      { lead_id, org_id },
      {
        $set: { lead_status: "contract", contract_Status: true },
        $push: {
          lead_update_track: { $each: leadUpdates }, // <-- push all timeline logs
        },
      },
      { new: true }
    );

    //  Create Timeline
    await createOrUpdateTimeline(
      lead_id,
      "",
      org_id,
      {
        message: ` created contract (${contractDatas[0].file_name}) in lead ${lead.lead_name}.`,
        updated_date: new Date(),
        type: "contract creation",
        tags: [],
      },
      {},
      res
    );

    //  Store in Approval
    for (let c of contractDatas) {
      const isFirst = lead.contract.length < 1;
      await storeOrUpdateContract(
        { lead_id, org_id, contractData: c },
        successfullyUploadedFiles,
        isFirst
      );
    }
    // return responseData(res, "Contract Uploaded successfully", 200, true, "", successfullyUploadedFiles);
  } catch (err) {
    console.error("Error in fileupload:", err);
    res.send({
      message: "",
      code: 500,
      status: false,
      errormessage: err.message,
      data: [],
    });
  }
};

const drwaingDaveFileUploadData = async (
  res,
  existingFileUploadData,
  isFirst = false
) => {
  try {
    if (!existingFileUploadData.sub_folder_name_second) {
      const firstFile = await fileuploadModel.create({
        org_id: existingFileUploadData.org_id,
        lead_id: existingFileUploadData.lead_id,
        project_id: existingFileUploadData.project_id,
        type: existingFileUploadData.type,
        files: [
          {
            folder_name: existingFileUploadData.folder_name,
            sub_folder_name_first: existingFileUploadData.sub_folder_name_first,
            sub_folder_name_second:
              existingFileUploadData.sub_folder_name_second,
            folder_id: existingFileUploadData.folder_Id,
            updated_date: existingFileUploadData.updated_Date,
            files: existingFileUploadData.files,
          },
        ],
      });
      responseData(res, "First file created successfully", 200, true);
    } else {
      if (isFirst) {
        const firstFile = await fileuploadModel.create({
          org_id: existingFileUploadData.org_id,
          lead_id: existingFileUploadData.lead_id,
          project_id: existingFileUploadData.project_id,
          type: existingFileUploadData.type,
          files: [
            {
              folder_name: existingFileUploadData.folder_name,
              sub_folder_name_first:
                existingFileUploadData.sub_folder_name_first,
              sub_folder_name_second:
                existingFileUploadData.sub_folder_name_second,
              folder_id: existingFileUploadData.folder_Id,
              updated_date: existingFileUploadData.updated_Date,
              files: existingFileUploadData.files,
            },
          ],
        });
        responseData(res, "First file created successfully", 200, true);
      } else {
        let updateQuery = {};
        updateQuery = {
          $push: {
            "files.$.files": { $each: existingFileUploadData.files },
          },
          $set: {
            "files.$.updated_date": existingFileUploadData.updated_Date,
          },
        };

        const updateResult = await fileuploadModel.updateOne(
          {
            org_id: existingFileUploadData.org_id,
            lead_id: existingFileUploadData.lead_id,
            project_id: existingFileUploadData.project_id,
            type: existingFileUploadData.type,
            "files.sub_folder_name_second":
              existingFileUploadData.sub_folder_name_second,
            "files.folder_name": existingFileUploadData.folder_name,
            "files.sub_folder_name_first":
              existingFileUploadData.sub_folder_name_first,
          },
          updateQuery,
          {
            arrayFilters: [
              {
                "folder.sub_folder_name_second":
                  existingFileUploadData.sub_folder_name_second,
              },
            ],
          }
        );

        if (updateResult.modifiedCount === 1) {
          responseData(res, "File data updated successfully", 200, true);
        } else {
          const firstFile = await fileuploadModel.create({
            org_id: existingFileUploadData.org_id,
            lead_id: existingFileUploadData.lead_id,
            project_id: existingFileUploadData.project_id,
            type: existingFileUploadData.type,

            files: [
              {
                folder_name: existingFileUploadData.folder_name,
                sub_folder_name_first:
                  existingFileUploadData.sub_folder_name_first,
                sub_folder_name_second:
                  existingFileUploadData.sub_folder_name_second,
                updated_date: existingFileUploadData.updated_Date,
                folder_id: existingFileUploadData.folder_Id,
                files: existingFileUploadData.files,
              },
            ],
          });

          responseData(res, "File data updated successfully", 200, true);
        }
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

export const DrawingFileUpload = async (req, res) => {
  const folder_name = req.body.folder_name;
  const sub_folder_name_first = req.body.sub_folder_name_first;
  const sub_folder_name_second = req.body.sub_folder_name_second;
  const type = req.body.type;
  const org_id = req.body.org_id;
  const lead_id = req.body.lead_id;
  const project_id = req.body.project_id;

  // if(type !== 'Drawing') {
  //     if (!folder_name || !sub_folder_name_first || !sub_folder_name_second || !type) {
  //         responseData(res, "", 403, false, "folder name, sub folder names, and type are required", []);
  //         return;
  //     }
  // }

  if (!org_id) {
    responseData(res, "", 403, false, "Org Id required!", []);
  }

  // if (type !== "template") {
  //     responseData(res, "", 403, false, "Type must be 'template'", []);
  //     return;
  // }

  try {
    const check_org = await orgModel.findOne({ _id: org_id });
    if (!check_org) {
      responseData(res, "", 404, false, "Org not found!", []);
    }
    const files = Array.isArray(req.files?.files)
      ? req.files?.files
      : [req.files?.files];

    // if (!files || files.length === 0) {
    //     responseData(res, "", 400, false, "No files provided", []);
    //     return;
    // }

    // Limit the number of files to upload to at most 5

    if (!sub_folder_name_second) {
      const folder_Id = `FOL_ID${generateSixDigitNumber()}`;
      const check_type = await fileuploadModel.findOne({
        org_id: org_id,
        lead_id: lead_id ? lead_id : null,
        project_id: project_id ? project_id : null,
        type: "Drawing",
        "files.folder_name": folder_name,
        "files.sub_folder_name_first": sub_folder_name_first,
      });

      if (check_type) {
        await drwaingDaveFileUploadData(res, {
          folder_name,
          folder_Id,
          org_id,
          lead_id: lead_id ? lead_id : null,
          project_id: project_id ? project_id : null,
          sub_folder_name_first,
          sub_folder_name_second,
          updated_Date: new Date(),
          type,
          files: [],
        });
      } else {
        await drwaingDaveFileUploadData(
          res,
          {
            folder_name,
            folder_Id,
            org_id,
            lead_id: lead_id ? lead_id : null,
            project_id: project_id ? project_id : null,
            sub_folder_name_first,
            sub_folder_name_second,
            updated_Date: new Date(),
            type,
            files: [],
          },
          true
        );
      }
    } else {
      const filesToUpload = files.slice(0, 5);
      const fileUploadPromises = [];
      let fileSize = [];

      // console.log("filesToUpload", filesToUpload)

      for (const file of filesToUpload) {
        // console.log("file", file)
        const fileName = file.name;
        const fileSizeInBytes = file.size;
        fileSize.push(fileSizeInBytes / 1024);
        fileUploadPromises.push(
          uploadFileDrawing(
            file,
            fileName,
            lead_id ? lead_id : project_id,
            org_id,
            folder_name,
            sub_folder_name_first,
            sub_folder_name_second
          )
        );
        //file, org_id, fileName, folder_name, sub_folder_name_first, sub_folder_name_second
      }

      // console.log("bbbb")

      const responses = await Promise.all(fileUploadPromises);
      const fileUploadResults = responses.map((response) => ({
        status: response.Location ? true : false,
        data: response ? response : response.err,
      }));
      const successfullyUploadedFiles = fileUploadResults.filter(
        (result) => result.data
      );

      let fileUrls;
      if (successfullyUploadedFiles.length > 0) {
        for (let i = 0; i < fileSize.length; i++) {
          fileUrls = successfullyUploadedFiles.map((result) => ({
            fileUrl: result.data.signedUrl,
            fileName: decodeURIComponent(
              result.data.data.Location.split("/").pop().replace(/\+/g, " ")
            ),
            fileId: `FL-${generateSixDigitNumber()}`,
            fileSize: `${fileSize[i]} KB`,
            date: new Date(),
          }));
        }

        const folder_Id = `FOL_ID${generateSixDigitNumber()}`;
        const check_type = await fileuploadModel.findOne({
          org_id: org_id,
          lead_id: lead_id ? lead_id : null,
          project_id: project_id ? project_id : null,
          type: "Drawing",
          "files.folder_name": folder_name,
          "files.sub_folder_name_first": sub_folder_name_first,
        });

        if (check_type) {
          await drwaingDaveFileUploadData(res, {
            folder_name,
            folder_Id,
            org_id,
            lead_id: lead_id ? lead_id : null,
            project_id: project_id ? project_id : null,
            sub_folder_name_first,
            sub_folder_name_second,
            updated_Date: fileUrls[0].date,
            type,
            files: fileUrls,
          });
        } else {
          await drwaingDaveFileUploadData(
            res,
            {
              folder_name,
              folder_Id,
              org_id,
              lead_id: lead_id ? lead_id : null,
              project_id: project_id ? project_id : null,
              sub_folder_name_first,
              sub_folder_name_second,
              updated_Date: fileUrls[0].date || new Date(),
              type,
              files: fileUrls,
            },
            true
          );
        }
      } else {
        responseData(res, "", 500, false, "Error uploading files", []);
      }
    }
  } catch (err) {
    responseData(res, "", 500, false, err.message, []);
  }
};

export default fileupload;

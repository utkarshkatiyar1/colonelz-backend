import { s3 } from "../../../utils/function.js"
import dotenv from "dotenv";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import projectModel from "../../../models/adminModels/project.model.js";
import { responseData } from "../../../utils/respounse.js";
import orgModel from "../../../models/orgmodels/org.model.js";

dotenv.config();



function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}

const uploadFile = async (file, fileName, lead_id, org_id,folder_name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  let newFileName = `${fileName}_${timestamp}`
  
  const data = await s3.upload({
    Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/${folder_name}`,
    Key: newFileName,
    Body: file.data,
    ContentType: file.mimetype,

  })
    .promise();
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/${folder_name}`,
      Key: newFileName,
      Expires: 157680000 // URL expires in 5 years
    });

    return { status: true, data, signedUrl };
  // } catch (error) {
  //   console.error('Error uploading file:', error);
  //   return { status: false, error: error.message };
  // }
};

const saveFileUploadData = async (
  res,
  existingFileUploadData,
  isFirst = false
) => {
  try {
    if (isFirst) {
      const firstFile = await fileuploadModel.create({
        project_id: existingFileUploadData.project_id,
        org_id: existingFileUploadData.org_id,
        project_name: existingFileUploadData.project_name,
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
          project_id: existingFileUploadData.project_id,
          org_id: existingFileUploadData.org_id,
          "files.folder_name": existingFileUploadData.folder_name,
        },
        {
          $push: {
            "files.$.files": { $each: existingFileUploadData.files },
          },
          $set: {
            "files.$.updated_date": existingFileUploadData.updated_Date,
          }
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
          { project_id: existingFileUploadData.project_id, org_id: existingFileUploadData.org_id },
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

const projectFileUpload = async (req, res) => {
  const folder_name = req.body.folder_name;
  const project_id = req.body.project_id;
  const org_id = req.body.org_id;

  if (!project_id) {
    responseData(res, "", 403, false, "project Id required!", []);
  } else if (!folder_name) {
    responseData(res, "", 403, false, "folder name required!", []);
  } 
  else if(!org_id)
  {
    responseData(res, "", 403, false, "Org Id required!", []);
  }
  else {
    try {
      const check_org = await orgModel.findOne({ _id: org_id })
      if (!check_org) {
        responseData(res, "", 404, false, "Org not found!", []);
      }

      const find_project = await projectModel.find({ project_id: project_id, org_id: org_id });
      if (find_project.length < 1) {
        responseData(res, "", 404, false, "project not found!", []);
      }
      if (find_project.length > 0) {
        const project_name = find_project[0].project_name;
        const files = Array.isArray(req.files.files)
          ? req.files.files
          : [req.files.files]; // Assuming the client sends an array of files with the key 'files'
        const fileUploadPromises = [];
        const uploadfileName = [];
        if (!files || files.length === 0) {
          return res.send({
            message: "",
            statuscode: 400,
            status: false,
            errormessage: "No files provided",
            data: [],
          });
        }

        // Limit the number of files to upload to at most 5
        const filesToUpload = files.slice(0, 5);
        let fileSize = []
        for (const file of filesToUpload) {
          const fileName = file.name;
          const fileSizeInBytes = file.size;
          fileSize.push(fileSizeInBytes / 1024)
          uploadfileName.push(file.name);
          fileUploadPromises.push(
            uploadFile(file, fileName, project_id,org_id, folder_name)
          );
        }

        const responses = await Promise.all(fileUploadPromises);
        const fileUploadResults = responses.map((response) => ({
          status: response.Location ? true : false,
          data: response ? response : response.err,
        }));
       
        const successfullyUploadedFiles = fileUploadResults.filter(
          (result) => result.data
        );

        let fileUrls
        
        if (successfullyUploadedFiles.length > 0) {
          for (let i = 0; i < fileSize.length; i++) {
            // console.log(successfullyUploadedFiles[i].data.data.Location)
            fileUrls = successfullyUploadedFiles.map((result) => {
              return ({

              
              
              fileUrl: result.data.signedUrl,
              fileName: decodeURIComponent(result.data.data.Location.split('/').pop().replace(/\+/g, ' ')),
              fileId: `FL-${generateSixDigitNumber()}`,
              fileSize: `${fileSize[i]} KB`,
              date: new Date()

            })});

          }


          const existingFile = await fileuploadModel.findOne({
            project_id: project_id, org_id: org_id
          });

          if (existingFile) {
            await saveFileUploadData(res, {
              project_id,
              org_id,
              project_name,
              folder_name,
              updated_Date: fileUrls[0].date,
              files: fileUrls,
            });
          } else {
            await saveFileUploadData(
              res,
              {
                project_id,
                org_id,
                project_name,
                folder_name,
                updated_Date: fileUrls[0].date,
                files: fileUrls,
              },
              true
            );
          }
        } else {
          res.send({
            message: "",
            statuscode: 500,
            status: false,
            errormessage: "Error uploading files",
            data: [],
          });
        }
      }
    } catch (err) {
      res.send({
        message: "",
        statuscode: 500,
        status: false,
        errormessage: err.message,
        data: [],
      });
    }
  }
};

export default projectFileUpload;

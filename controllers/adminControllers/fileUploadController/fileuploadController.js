import { s3 } from "../../../utils/function.js"
import dotenv from "dotenv";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import leadModel from "../../../models/adminModels/leadModel.js";
import { responseData } from "../../../utils/respounse.js";
import orgModel from "../../../models/orgmodels/org.model.js";

dotenv.config();



function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}

const uploadFileDrawing = async (file, fileName, lead_id, org_id, folder_name, sub_folder_name_first, sub_folder_name_second) => {
  const  data = await s3.upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`,
     Key: fileName,
     Body: file.data,
     ContentType: file.mimetype,
  
 }).promise();
 const signedUrl = s3.getSignedUrl('getObject', {
     Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/Drawing/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`,
     Key: fileName,
     Expires: 157680000 // URL expires in 5 year
 });
 return { status: true, data, signedUrl };
};

const uploadFile = async (file, fileName, lead_id,org_id, folder_name) => {
  // console.log(fileName)
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
      Expires: 157680000 // URL expires in 5 year
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
          { lead_id: existingFileUploadData.lead_id, org_id: existingFileUploadData.org_id },
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




const fileupload = async (req, res) => {
  const folder_name = req.body.folder_name;
  const lead_id = req.body.lead_id;
  const org_id = req.body.org_id

  if (!lead_id) {
    responseData(res, "", 403, false, "lead Id required!", []);
  }
  else if (!folder_name) {
    responseData(res, "", 403, false, "folder name required!", []);
  }
  else if (!org_id) {
    responseData(res, "", 403, false, "Org Id required!", []);
  }
  else {
    try {
      const check_org = await orgModel.findOne({ _id: org_id })
      if (!check_org) {
        responseData(res, "", 404, false, "Org not found!", []);
      }

      const find_lead = await leadModel.find({ lead_id: lead_id, org_id: org_id });
      if (find_lead.length < 1) {
        responseData(res, "", 404, false, "lead not found!", []);
      }
      if (find_lead.length > 0) {
        const lead_Name = find_lead[0].name;
        const files = Array.isArray(req.files.files)
          ? req.files.files
          : [req.files.files]; // Assuming the client sends an array of files with the key 'files'
        const fileUploadPromises = [];


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
        let fileSize = []
        const filesToUpload = files.slice(0, 5);

        for (const file of filesToUpload) {
          const fileName = file.name;
          const fileSizeInBytes = file.size;
          fileSize.push(fileSizeInBytes / 1024)


          fileUploadPromises.push(uploadFile(file, fileName, lead_id,org_id, folder_name));
        }


        const responses = await Promise.all(fileUploadPromises);
        

        const fileUploadResults = responses.map((response) => ({
          status: response.Location ? true : false,
          data: response ? response : response.err,
        }));
        // console.log(fileUploadResults)
        const successfullyUploadedFiles = fileUploadResults.filter(
          (result) => result.data
        );
        let fileUrls
        if (successfullyUploadedFiles.length > 0) {
          for (let i = 0; i < fileSize.length; i++) {
            fileUrls = successfullyUploadedFiles.map((result) => ({
              fileUrl: result.data.signedUrl,
              fileName: decodeURIComponent(result.data.data.Location.split('/').pop().replace(/\+/g, ' ')),
              fileId: `FL-${generateSixDigitNumber()}`,
              fileSize: `${fileSize[i]} KB`,
              date: new Date()

            }));

          }
          // console.log(decodeURIComponent(fileUrls[0].fileName.replace(/\+/g, ' ')))


          const existingFile = await fileuploadModel.findOne({
            lead_id: lead_id, org_id: org_id
          });

          if (existingFile) {




            await saveFileUploadData(res, {
              lead_id,
              org_id,
              lead_Name,
              folder_name,
              updated_Date: fileUrls[0].date,
              files: fileUrls,
            });
          } else {
            await saveFileUploadData(
              res,
              {
                lead_id,
                org_id,
                lead_Name,
                folder_name,
                updated_Date: new Date(),
                files: fileUrls,
              },
              true
            );
          }


        } else {
          res.send({
            message: "",
            code: 500,
            status: false,
            errormessage: "Error uploading files",
            data: [],
          });
        }
      }
    } catch (err) {
      res.send({
        message: "",
        code: 500,
        status: false,
        errormessage: err.message,
        data: [],
      });
    }
  }
};




// function generateSixDigitNumber() {
//     const min = 100000;
//     const max = 999999;
//     const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
//     return randomNumber;
// }

// const uploadFile = async (file, org_id, fileName, folder_name, sub_folder_name_first, sub_folder_name_second) => {
//      const  data = await s3.upload({
//          Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/template/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`,
//         Key: fileName,
//         Body: file.data,
//         ContentType: file.mimetype,
     
//     }).promise();
//     const signedUrl = s3.getSignedUrl('getObject', {
//         Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/template/${folder_name}/${sub_folder_name_first}/${sub_folder_name_second}`,
//         Key: fileName,
//         Expires: 157680000 // URL expires in 5 year
//     });
//     return { status: true, data, signedUrl };
// };

const drwaingDaveFileUploadData = async (res, existingFileUploadData, isFirst = false) => {
    try {

      if(!existingFileUploadData.sub_folder_name_second) {
          const firstFile = await fileuploadModel.create({
            org_id: existingFileUploadData.org_id,
            lead_id: existingFileUploadData.lead_id,
            project_id: existingFileUploadData.project_id,
            type: existingFileUploadData.type,
            files: [
                {
                    folder_name: existingFileUploadData.folder_name,
                    sub_folder_name_first: existingFileUploadData.sub_folder_name_first,
                    sub_folder_name_second: existingFileUploadData.sub_folder_name_second,
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
                      sub_folder_name_first: existingFileUploadData.sub_folder_name_first,
                      sub_folder_name_second: existingFileUploadData.sub_folder_name_second,
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
                }
            };


            const updateResult = await fileuploadModel.updateOne(
                {
                    org_id: existingFileUploadData.org_id,
                    lead_id: existingFileUploadData.lead_id,
                    project_id: existingFileUploadData.project_id,
                    type: existingFileUploadData.type,
                    "files.sub_folder_name_second": existingFileUploadData.sub_folder_name_second,
                    "files.folder_name": existingFileUploadData.folder_name,
                    "files.sub_folder_name_first": existingFileUploadData.sub_folder_name_first,
                },
                updateQuery,
                {
                    arrayFilters: [
                        { "folder.sub_folder_name_second": existingFileUploadData.sub_folder_name_second, },
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
                            sub_folder_name_first: existingFileUploadData.sub_folder_name_first,
                            sub_folder_name_second: existingFileUploadData.sub_folder_name_second,
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
        responseData(res, "", 500, false, "Something went wrong. File data not updated");
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

    if(!org_id)
    {
        responseData(res, "", 403, false, "Org Id required!", []);
    }

    // if (type !== "template") {
    //     responseData(res, "", 403, false, "Type must be 'template'", []);
    //     return;
    // }


    try {
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            responseData(res, "", 404, false, "Org not found!", []);
        }
        const files = Array.isArray(req.files?.files) ? req.files?.files : [req.files?.files];


        // if (!files || files.length === 0) {
        //     responseData(res, "", 400, false, "No files provided", []);
        //     return;
        // }

        // Limit the number of files to upload to at most 5

        if(!sub_folder_name_second) {
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
                  lead_id : lead_id ? lead_id : null,
                  project_id: project_id ? project_id : null,
                  sub_folder_name_first,
                  sub_folder_name_second,
                  updated_Date: new Date(),
                  type,
                  files: [],
              });
          } else {
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
              }, true);
          }

        } else {

          const filesToUpload = files.slice(0, 5);
          const fileUploadPromises = [];
          let fileSize = []

          // console.log("filesToUpload", filesToUpload)

          for (const file of filesToUpload) {

            // console.log("file", file)
              const fileName = file.name;
              const fileSizeInBytes = file.size;
              fileSize.push(fileSizeInBytes / 1024)
              fileUploadPromises.push(uploadFileDrawing(file, fileName, lead_id? lead_id : project_id, org_id, folder_name, sub_folder_name_first, sub_folder_name_second));
              //file, org_id, fileName, folder_name, sub_folder_name_first, sub_folder_name_second
          }

          // console.log("bbbb")

          const responses = await Promise.all(fileUploadPromises);
          const fileUploadResults = responses.map((response) => ({
              status: response.Location ? true : false,
              data: response ? response : response.err,
          }));
          const successfullyUploadedFiles = fileUploadResults.filter((result) => result.data);

          let fileUrls
          if (successfullyUploadedFiles.length > 0) {
              for (let i = 0; i < fileSize.length; i++) {
                  fileUrls = successfullyUploadedFiles.map((result) => ({
                      fileUrl: result.data.signedUrl,
                      fileName: decodeURIComponent(result.data.data.Location.split('/').pop().replace(/\+/g, ' ')),
                      fileId: `FL-${generateSixDigitNumber()}`,
                      fileSize: `${fileSize[i]} KB`,
                      date: new Date()

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
                  await drwaingDaveFileUploadData(res, {
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
                  }, true);
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

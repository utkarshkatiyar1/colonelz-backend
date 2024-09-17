import { responseData } from "../../../utils/respounse.js";
import projectModel from "../../../models/adminModels/project.model.js";
import { s3 } from "../../../utils/function.js"
import { onlyAlphabetsValidation, onlyMomClientsValidation } from "../../../utils/validation.js";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path"
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import registerModel from "../../../models/usersModels/register.model.js";



function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}


const uploadFile = async (file, fileName, project_id, mom_id) => {
  return s3
    .upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${project_id}/MOM/`,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype,
      // ACL: 'public-read'
    })
    .promise();
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
        project_name: existingFileUploadData.project_Name,
        files: [
          {
            folder_name: existingFileUploadData.folder_name,
            updated_date: existingFileUploadData.updated_date,
            files: existingFileUploadData.files,
          },
        ],
      });
      console.log("first File created");

    } else {
      // Use update query to push data
      const updateResult = await fileuploadModel.updateOne(
        {
          project_id: existingFileUploadData.project_id,
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
          { project_id: existingFileUploadData.project_id },
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

export const getAllProjectMom = async (req, res) => {
  try {
    const find_project = await projectModel.find({}).sort({ createdAt: -1 });


    let MomData = [];
    for (let i = 0; i < find_project.length; i++) {
      if (find_project[i].mom.length !== 0) {
        for (let j = find_project[i].mom.length - 1; j >= 0; j--) {
          MomData.push({
            project_id: find_project[i].project_id,
            project_name: find_project[i].project_name,
            mom_id: find_project[i].mom[j].mom_id,
            client_name: find_project[i].client[0].client_name,
            location: find_project[i].mom[j].location,
            meetingDate: find_project[i].mom[j].meetingdate,
          });

          break;
        }

      }
    }
    const response = {
      MomData: MomData
    }

    responseData(res, "all project mom", 200, true, "", response);
  } catch (err) {
    responseData(res, "", 500, false, err.message);
    console.log(err.message);
  }
};
function isValidClientName(name) {
  return typeof name === 'string' && /^[a-zA-Z\s]+$/.test(name);
}
function validateClientNames(names) {
  return Array.isArray(names) && names.every(isValidClientName);
}
export const createmom = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const project_id = req.body.project_id;
    const meetingDate = req.body.meetingdate;
    const location = req.body.location;
    let client_name = req.body.client_name;
    let organisor = req.body.organisor;
    let attendees = req.body.attendees;
    const remark = req.body.remark;
    let client_names;
    let organisors;
    let others;
    try {
      client_names = JSON.parse(client_name);
      organisors = JSON.parse(organisor);
      others = JSON.parse(attendees)

    } catch (error) {
      return responseData(res, "", 400, false, "Invalid JSON format");
    }


    // write here validation ///
    if (!project_id) {
      responseData(res, "", 400, false, "project_id is required");
    }
    else if (!user_id) {
      responseData(res, "", 400, false, "User Id required");
    }
    else if (!meetingDate) {
      responseData(res, "", 400, false, "meetingDate is required");
    } else if (!location) {
      responseData(res, "", 400, false, "location is required");
    }
    else if (!validateClientNames(client_names)) {
      responseData(res, "", 400, false, "Each client_name entry must be a valid string containing only alphabets and spaces");
    } else if (!validateClientNames(organisors)) {
      responseData(res, "", 400, false, "Each organisor name entry must be a valid string containing only alphabets and spaces");
    } else {
      const check_user = await registerModel.findOne({ _id: user_id })
      if (!check_user) {
        responseData(res, "", 400, false, "User Not Found");
      }
      const check_project = await projectModel.find({ project_id: project_id });
      if (check_project.length > 0) {
        const mom_id = `COl-M-${generateSixDigitNumber()}`; // generate meeting id
        let mom_data;

        const files = req.files?.files;
        const fileUploadPromises = [];
        let successfullyUploadedFiles = [];
        let fileSize = [];

        if (files) {
          const filesToUpload = Array.isArray(files)
            ? files.slice(0, 5)
            : [files];


          for (const file of filesToUpload) {
            const fileName = file.name;
            const fileSizeInBytes = file.size;
            fileSize.push(fileSizeInBytes / 1024)
            fileUploadPromises.push(
              uploadFile(file, fileName, project_id, mom_id)
            );
          }

          const responses = await Promise.all(fileUploadPromises);

          const fileUploadResults = responses.map((response) => ({
            status: response.Location ? true : false,
            data: response ? response : response.err,
          }));

          successfullyUploadedFiles = fileUploadResults.filter(
            (result) => result.status
          );
        }
        let file = [];

        let fileUrls
        if (successfullyUploadedFiles.length > 0) {
          for (let i = 0; i < fileSize.length; i++) {
            fileUrls = successfullyUploadedFiles.map((result) => ({
              fileUrl: result.data.Location,
              fileName: decodeURIComponent(result.data.Location.split('/').pop().replace(/\+/g, ' ')),
              fileId: `FL-${generateSixDigitNumber()}`,
              fileSize: `${fileSize[i]} KB`,
              date: new Date()

            }));

          }

          const update_mom = await projectModel.findOneAndUpdate(
            { project_id: project_id },
            {
              $push: {
                mom: {
                  $each: [
                    {
                      mom_id: mom_id,
                      meetingdate: meetingDate,
                      location: location,
                      attendees: {
                        client_name: client_names,
                        organisor: organisors,
                        attendees: others,
                      },
                      remark: remark,
                      files: fileUrls,
                    },
                  ],
                  $position: 0,
                },
              },
            },
            { new: true }
          );
          await projectModel.findOneAndUpdate({ project_id: project_id },
            {
              $push: {
                project_updated_by: {
                  username: check_user.username,
                  role: check_user.role,
                  message: `has created new mom.`,
                  updated_date: new Date()
                }
              }
            }
          )
          const existingFile = await fileuploadModel.findOne({
            project_id: project_id,
          });
          const folder_name = `Mom`;
          const project_Name = existingFile.project_name;

          if (existingFile) {
            await saveFileUploadData(res, {
              project_id,
              project_Name,
              folder_name,
              updated_date: new Date(),
              files: fileUrls,
            });
          } else {
            await saveFileUploadData(
              res,
              {
                project_id,
                project_Name,
                folder_name,
                updated_date: new Date(),
                files: fileUrls,
              },
              true
            );
          }


          responseData(
            res,
            "Mom created  successfully:",
            200,
            true,
            "",
          );
        } else {
          const update_mom = await projectModel.findOneAndUpdate(
            { project_id: project_id },
            {
              $push: {
                mom: {
                  $each: [
                    {
                      mom_id: mom_id,
                      meetingdate: meetingDate,
                      location: location,
                      attendees: {
                        client_name: client_names,
                        organisor: organisors,
                        attendees: others,
                      },
                      remark: remark,
                      files: file,
                    },
                  ],
                  $position: 0,
                },
              },
            },
            { new: true }
          );
          await projectModel.findOneAndUpdate({ project_id: project_id },
            {
              $push: {
                project_updated_by: {
                  username: check_user.username,
                  role: check_user.role,
                  message: `has created new mom.`,
                  updated_date: new Date()
                }
              }
            }
          )


          responseData(
            res,
            "Mom created successfully:",
            200,
            true,
            "",
          );
        }
      }
      if (check_project < 1) {
        responseData(res, "", 404, false, "Project Not Found.");
      }
    }
  } catch (error) {
    responseData(res, "", 400, false, error.message);
  }
};

export const getAllMom = async (req, res) => {
  try {
    const { project_id } = req.query;
    const check_project = await projectModel
      .find({ project_id })
      .sort({ createdAt: -1 });

    if (check_project.length === 0) {
      return responseData(res, "", 404, false, "Project Not Found.");
    }

    const project = check_project[0];
    const response = project.mom.map(momItem => ({
      client_name: momItem.attendees.client_name,
      mom_id: momItem.mom_id,
      meetingdate: momItem.meetingdate,
      location: momItem.location,
      attendees: momItem.attendees,
      remark: momItem.remark,
      files: momItem.files,
    }));

    const response1 = {
      client_name: project.client[0].client_name,
      mom_data: response,
    };

    responseData(res, "MOM Found", 200, true, "", response1);
  } catch (error) {
    responseData(res, "", 400, false, error.message);
  }
};


export const getSingleMom = async (req, res) => {
  try {
    const project_id = req.query.project_id;
    const mom_id = req.query.mom_id;

    const check_project = await projectModel.find({ project_id: project_id });
    if (check_project.length > 0) {
      const check_mom = check_project[0].mom.filter(
        (mom) => mom.mom_id.toString() === mom_id
      );

      const response = [
        {
          client_name: check_mom[0].attendees.client_name,
          mom_id: check_mom[0].mom_id,
          meetingdate: check_mom[0].meetingdate,
          location: check_mom[0].location,
          attendees: check_mom[0].attendees,
          remark: check_mom[0].remark,
          files: check_mom[0].files,
        }
      ]
      if (check_mom.length > 0) {
        responseData(res, "MOM Found", 200, true, "", response);
      } else {
        responseData(res, "", 404, false, "MOM Not Found");
      }
    }
    if (check_project.length < 1) {
      responseData(res, "", 404, false, "Project Not Found");


    }

  } catch (error) {
    responseData(res, "", 400, false, error.message, []);
  }
};




export const sendPdf = async (req, res) => {
  try {

    const { project_id, mom_id } = req.body;
    const cc = req.body.cc;
    const bcc = req.body.bcc;
    const client_email = req.body.client_email;
    const subject = req.body.subject;
    const body = req.body.body;
    const check_project = await projectModel.find({ project_id: project_id });

    if (check_project.length > 0) {

      const check_mom = check_project[0].mom.filter(
        (mom) => mom.mom_id.toString() === mom_id
      );

      if (check_mom.length > 0) {

        const mom_pdf = req.files.file;
        const filePath = path.join('momdata', mom_pdf.name);

        mom_pdf.mv(filePath, (err) => {
          if (err) {
            console.error('Error saving file:', err);
            return responseData(res, '', 500, false, 'Failed to save file');
          }

          // Define the mail options
          const mailOptions = {
            from: 'info@colonelz.com',
            to: [check_project[0].client[0].client_email, client_email],
            cc: cc,
            bcc: bcc,
            subject: subject,
            html: body,
            attachments: [
              {
                filename: mom_pdf.name,
                path: filePath,
              },
            ],
          };

          // Send the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
              return responseData(res, '', 400, false, 'Failed to send email');
            } else {
              console.log('Email sent:', info.response);

              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                } else {
                  console.log('File deleted successfully');
                }
              });

              return responseData(res, 'Email has been sent successfully', 200, true, '');
            }
          });
        });
      } else {
        return responseData(res, '', 404, false, 'MOM Not Found');
      }
    } else {
      return responseData(res, '', 404, false, 'Project Not Found');
    }
  } catch (err) {
    console.error('Error:', err);
    return responseData(res, '', 400, false, err.message);
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.USER_NAME,
    pass: process.env.API_KEY,
  },
});


export const updateMom = async (req, res) => {
  try {
    const project_id = req.query.project_id;
    const mom_id = req.query.mom_id;
    const description = req.body.remark;
    const meetingDate = req.body.meetingdate;
    const location = req.body.location;
    const client_name = req.body.client_name;
    const organisor = req.body.organisor;
    const attendees = req.body.attendees;
    const user = req.user


    if (!project_id) {
      responseData(res, "", 404, false, "Project Id is required");
    }
    else if (!mom_id) {
      responseData(res, "", 404, false, "MOM Id is required");
    }
    else if (!meetingDate) {
      responseData(res, "", 400, false, "meetingDate is required");
    } else if (!location) {
      responseData(res, "", 400, false, "location is required");
    }
    else if (!validateClientNames(client_name)) {
      responseData(res, "", 400, false, "Each client_name entry must be a valid string containing only alphabets and spaces");
    } else if (!validateClientNames(organisor)) {
      responseData(res, "", 400, false, "Each organisor name entry must be a valid string containing only alphabets and spaces");
    }
    else {
      if (!user) {
        responseData(res, "", 404, false, "User Not Found");

      }
      const check_project = await projectModel.findOne({ project_id: project_id });
      if (check_project) {
        const check_mom = check_project.mom.filter(
          (mom) => mom.mom_id.toString() === mom_id
        );
        if (check_mom) {
          await projectModel.findOneAndUpdate({
            project_id: project_id,
            'mom.mom_id': mom_id
          }, {
            $set: {
              'mom.$.remark': description,
              'mom.$.meetingdate': meetingDate,
              'mom $.location': location,
              'mom.$.attendees': {
                client_name: client_name,
                organisor: organisor,
                attendees: attendees
              }
            }
          },
            { new: true }

          )

          await projectModel.findOneAndUpdate({ project_id: project_id },
            {
              $push: {
                project_updated_by: {
                  username: user.username,
                  role: user.role,
                  message: `has update  mom.`,
                  updated_date: new Date()
                }
              }
            }
          )
          responseData(res, "MOM Updated Successfully", 200, true, "");

        }
        else {
          responseData(res, "", 404, false, "MOM Not Found");
        }
      }
      else {
        responseData(res, "", 404, false, "Project Not Found");
      }
    }

  }
  catch (err) {
    console.log(err);
    responseData(res, "", 500, false, "Internal server Error");

  }
}

export const deleteMom = async (req, res) => {
  try {
    const project_id = req.body.project_id;
    const mom_id = req.body.mom_id;
    const user = req.user

    if (!project_id) {
      responseData(res, "", 404, false, "Project Id is required");
    }
    else if (!mom_id) {
      responseData(res, "", 404, false, "MOM Id is required");
    }
    else {
      if (!user) {
        responseData(res, "", 404, false, "User Not Found");

      }
      const check_project = await projectModel.findOne({ project_id: project_id });
      if (check_project) {
        console.log(check_project)
        const check_mom = check_project.mom.filter(
          (mom) => mom.mom_id.toString() === mom_id
        );
        console.log(check_mom)
        if (!check_mom) {

          responseData(res, "", 404, false, "Mom Not Found");
        }
        else {
          await projectModel.findOneAndDelete({ "mom.mom_id": mom_id })
          await projectModel.findOneAndUpdate({ project_id: project_id },
            {
              $push: {
                project_updated_by: {
                  username: user.username,
                  role: user.role,
                  message: `has delete  mom  ${check_mom[0].mom_id}.`,
                  updated_date: new Date()
                }
              }
            }
          )
          responseData(res, "Mom Delete Successfully", 200, true, "");
          
        }
      }
      else{
        responseData(res, "", 404, false, "Project Not Found");
      }

    }
  }
  catch (err) {
    console.log(err);
    responseData(res, "", 400, false, "Something went wrong");
  }
}

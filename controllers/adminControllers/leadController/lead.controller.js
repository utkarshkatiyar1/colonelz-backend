import leadModel from "../../../models/adminModels/leadModel.js";
import projectModel from "../../../models/adminModels/project.model.js";
import Notification from "../../../models/adminModels/notification.model.js";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import { responseData } from "../../../utils/respounse.js";
import {
  onlyAlphabetsValidation,
  onlyEmailValidation,
  onlyPhoneNumberValidation,
} from "../../../utils/validation.js";
import registerModel from "../../../models/usersModels/register.model.js";
import AWS from "aws-sdk";


const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: "ap-south-1",
});




function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}



const uploadFile = async (file, fileName, lead_id, folder_name) => {
let response =  s3
    .upload({
      Bucket: `collegemanage/${lead_id}/${folder_name}`,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype,
      // ACL: 'public-read'
    })
    .promise()
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
        { lead_id: existingFileUploadData.lead_id },
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


export const createLead = async (req, res) => {

  const name = req.body.name;
  const email = req.body.email;
  const phone = req.body.phone;
  const location = req.body.location;
  const status = req.body.status;
  const source = req.body.source;
  const content = req.body.content;
  const userId = req.body.userId;
  const date = req.body.date;
  const lead_manager = req.body.lead_manager;


  // vaalidation all input
  if (!onlyAlphabetsValidation(name) && name.length >= 3) {
    responseData(
      res,
      "",
      401,
      false,
      "name should be greater than 3 characters."
    );

  } else if (!userId) {
    responseData(res, "", 401, false, "userId is required.")
  }
  else if (!onlyEmailValidation(email) && email.length > 5) {
    responseData(res, "", 401, false, "email is invalid.");
  } else if (!onlyPhoneNumberValidation(phone)) {
    responseData(res, "", 401, false, "phone number  is  invalid.");
  } else if (!location) {
    responseData(res, "", 401, false, "location is required.");
  } else if (!status) {
    responseData(res, "", 401, false, "status is required.");
  } else if (!source) {
    responseData(res, "", 401, false, "source is required.");
  }
  else if (!onlyAlphabetsValidation(lead_manager) && lead_manager.length >= 3) {
    responseData(
      res,
      "",
      401,
      false,
      "lead manager should be greater than 3 characters."
    )

  }

  else {
    try {
      const check_email = await leadModel.find({ email: email });
      if (check_email.length > 0) {
        responseData(res, "", 401, false, "email already exist.");
      }
      if (check_email.length < 1) {
        const lead_id = generateSixDigitNumber();
        const check_user = await registerModel.findById(userId)
        if (check_user.role === 'ADMIN' || check_user.role === 'Senior Architect' || check_user.role ==='Project Architect')
          {

        let fileUrls = []
        const lead = new leadModel({
          name: name,
          lead_id: lead_id,
          lead_manager: lead_manager,
          email: email,
          phone: phone,
          location: location,
          status: status,
          source: source,
          updated_date: date,
          files: fileUrls,
          date: date,
          notes: [
            {
              content: content,
              createdBy: check_user.username,
              date: date,
              status: status,
            },
          ],
        });
      
        const fileUploadData = new fileuploadModel({
          lead_id: lead_id,
          lead_name: name,

          files: [{
            folder_name: "client brief",
            updated_date: date,
            files: fileUrls
          },
          {
            folder_name: "drawing",
            updated_date: date,
            files: fileUrls
          },
          {
            folder_name: "review",
            updated_date: date,
            files: fileUrls
          },
          ]

        })
          if (check_user.role ==='Project Architect')
            {
            const add_project_in_user = await registerModel.findOneAndUpdate(
              { _id: userId },
              {
                $push: {
                  "data.$[outer].leadData": {
                    lead_id: lead_id,
                    role: check_user.role,
                  }
                }
              },
              {
                arrayFilters: [{ "outer.leadData": { $exists: true } }]
              }
            );
            }
         
  const lead_data = await lead.save();
        await fileUploadData.save()
        responseData(
          res,
          "lead created successfully.",
          200,
          true,
          "",
        );
      }
      else{
        responseData(
          res,
          "You have not access to create lead",
          400,
          false,
          "",
        );
      }
    }

    } catch (err) {
      console.log(err);
      res.send(err);
    }
  }
};

export const getAllLead = async (req, res) => {
  try {
    const leads = await leadModel.find({}).sort({ createdAt: -1 });
    const response = {
      leads: leads
    }

    responseData(res, "All Lead Data", 200, true, "", response);
  } catch (error) {
    responseData(res, 500, error.message);
  }
};

export const getSingleLead = async (req, res) => {
  const lead_id = req.query.lead_id;

  try {
    const lead = await leadModel.find({ lead_id: lead_id });
    if (lead.length < 1) {
      responseData(res, "", 404, false, "Data not found", []);
    }
    if (lead.length > 0) {
      let leads=[];
      let project = false;
      const check_project = await projectModel.findOne({lead_id:lead_id})
      if(check_project)
        {
        project= true;
        }

      for(let i=0;i<lead.length;i++){
        leads.push({
          name:lead[i].name,
          lead_id:lead[i].lead_id,
          lead_manager:lead[i].lead_manager,
          email:lead[i].email,
          phone:lead[i].phone,
          location:lead[i].location,
          status:lead[i].status,
          source:lead[i].source,
          date:lead[i].date,
          updated_date:lead[i].updated_date,
          notes:lead[i].notes,
          contract:  lead[i].contract,
          createdAt:lead[i].createdAt,
          project:project
        })
      }
    
      responseData(res, "Lead Data", 200, true, "", leads);
    }
  } catch (error) {
    responseData(res, "", 500, false, error.message);
  }
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export const updateLead = async (req, res) => {
  const userId = req.body.userId;
  const lead_id = req.body.lead_id;
  const status = req.body.status;
  const content = req.body.content;
  const createdBy = req.body.createdBy;
  const update = req.body.date;


  if (!lead_id) {
    responseData(res, "", 400, false, "lead_id is required", []);
  } else if (!status) {
    responseData(res, "", 400, false, "status is required", []);
  } else if (!createdBy) {
    responseData(res, "", 400, false, "createdBy is required", []);
  }
  else if (!userId) {
    responseData(res, "", 400, false, "UserId is required", []);

  } else {
    try {


const formatedDate = formatDate(update);
      const find_lead = await leadModel.find({ lead_id: lead_id });
      if (find_lead.length > 0) {
        const check_user = await registerModel.findById(userId);
        const update_Lead = await leadModel.findOneAndUpdate(
          { lead_id: lead_id },
          {
            $set: {
              status: status,
              updated_date: update,
            },
            $push: {
              notes: {
                content: content,
                createdBy: check_user.username,
                date: update,
                status: status,
              },
            },
          },

          {
            new: true,
            useFindAndModify: false,
          }
        );



        const newNotification = new Notification({
          type: "lead",
          notification_id: generateSixDigitNumber(),
          itemId: lead_id,
          message: `Lead status updated: Lead name ${find_lead[0].name} status changed to ${status} on  ${formatedDate}.`,
          status: false,
        });
        await newNotification.save();

        responseData(res, "Lead Data Updated", 200, true, "", []);

      }
      if (find_lead.length < 1) {
        responseData(res, "", 404, false, "lead not found");
      }
    } catch (err) {
      responseData(res, "", 500, false, "error", err.message);
      console.log(err);
    }
  }
};

export const leadToProject = async (req, res) => {
  const lead_id = req.body.lead_id;
  const client_name = req.body.client_name;
  const client_email = req.body.client_email;
  const client_contact = req.body.client_contact;
  const location = req.body.location;
  const description = req.body.description;
  const project_type = req.body.project_type;
  const project_name = req.body.project_name;
  const project_status = req.body.project_status;
  const timeline_date = req.body.timeline_date;
  const project_start_date = req.body.project_start_date;
  const project_budget = req.body.project_budget;
  const designer = req.body.designer;
  

  if (!lead_id) {
    responseData(res, "", 400, false, "lead_id is required", []);
  } else {
    try {
      const find_lead = await leadModel.find({ lead_id: lead_id });
      if (find_lead.length > 0) {
        const find_project = await projectModel.find({ lead_id: lead_id })
        if (find_project.length > 0) {
          
          responseData(res, "", 400, false, "project already exist for this lead", []);
        }
        if (find_project.length < 1) {
          const file = req.files.contract;
          const fileName = file.name;
          const folder_name = `contract`;
          const fileSizeInBytes = file.size;
          let response  = await uploadFile(file, fileName, lead_id, folder_name)
          
          if (response.status) {


            let fileUrls = [{
              fileUrl: response.data.Location,
              fileName:fileName,
              fileId: `FL-${generateSixDigitNumber()}`,
              fileSize: `${fileSizeInBytes/ 1024} KB`,
              date: new Date()
            }]


            const existingFile = await fileuploadModel.findOne({
              lead_id: lead_id,
            });
            
            const lead_Name = existingFile.name;

            if (existingFile) {
              await saveFileUploadData(res, {
                lead_id,
                lead_Name,
                folder_name,
                updated_date: new Date(),
                files: fileUrls,
              });

              const project_ID = generateSixDigitNumber();
              const projectID = `COL\P-${project_ID}`;
              const project_data = await projectModel.create({
                project_name: project_name,
                project_type: project_type,
                project_id: projectID,
                client: {
                  client_name: client_name,
                  client_email: client_email,
                  client_contact: client_contact,
                },

                project_location: location,
                description: description,
                lead_id: lead_id,
                project_budget: project_budget,
                project_end_date: timeline_date,
                timeline_date: timeline_date,
                project_start_date: project_start_date,
                project_status: project_status,
                designer: designer,
                visualizer: "",
                supervisor: "",
                leadmanager: "",
              });
              project_data.save();
              const lead_find_in_fileupload = await fileuploadModel.find({ lead_id: lead_id });
              if (lead_find_in_fileupload.length > 0) {
                const lead_update_in_fileupload = await fileuploadModel.updateOne({ lead_id: lead_id }, { $set: { project_id: projectID, project_name: project_name, lead_id: null } });


              }
              responseData(
                res,
                "project created successfully",
                200,
                true,
                "",

              );
            }

          } else {
            console.log(response)
            responseData(res, "", 400, false, "contract file upload failed", "");
          }

          
        }
      }
      if (find_lead.length < 1) {
        responseData(res, "", 404, false, "lead not found", []);
      }
    } catch (err) {
      responseData(res, "", 500, false, "error", err.message);
      console.log(err);
    }
  }
};



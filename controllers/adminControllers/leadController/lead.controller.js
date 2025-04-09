import leadModel from "../../../models/adminModels/leadModel.js";
import projectModel from "../../../models/adminModels/project.model.js";
import Notification from "../../../models/adminModels/notification.model.js";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import { responseData } from "../../../utils/respounse.js";
import {
  onlyAlphabetsValidation,
  onlyEmailValidation,
  onlyPhoneNumberValidation,
  validateOnlyNumbers,
} from "../../../utils/validation.js";
import registerModel from "../../../models/usersModels/register.model.js";
import { s3 } from "../../../utils/function.js"
import archiveModel from "../../../models/adminModels/archive.model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import leadTaskModel from "../../../models/adminModels/leadTask.model.js";
import TimelineModel from "../../../models/adminModels/timeline.model.js";
import { createOrUpdateTimeline } from "../../../utils/timeline.utils.js";


function generateSixDigitNumber() {
  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
}



const uploadFile = async (file, fileName, lead_id, org_id, folder_name) => {
  let response = s3
    .upload({
      Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/${folder_name}`,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype,
    })
    .promise()
  return response
    .then((data) => {
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: `${process.env.S3_BUCKET_NAME}/${org_id}/${lead_id}/${folder_name}`,
        Key: fileName,
        Expires: 157680000 // URL expires in 5 year
      });
      return { status: true, data, signedUrl };
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
  const org_id = req.body.org_id;


  // vaalidation all input
  if (!onlyAlphabetsValidation(name) && name.length >= 3) {
    responseData(
      res,
      "",
      403,
      false,
      "name should be greater than 3 characters And number and special characters not allow"
    );

  } else if (!userId) {
    responseData(res, "", 403, false, "userId is required.")
  }
  else if (!onlyEmailValidation(email)) {
    const [localPart, domainPart] = email.split('@');

    // Check if the local part is too short or the domain part is too short
    if (localPart.length < 3 || domainPart.length < 3) {
      responseData(res, "", 403, false, "email is invalid.");
    } else {
      // Further checks (like disposable email checks) can be added here
      responseData(res, "", 200, true, "email is valid.");
    }
  } else if (!onlyPhoneNumberValidation(phone)) {
    responseData(res, "", 403, false, "phone number  is  invalid.");
  } else if (!location) {
    responseData(res, "", 403, false, "location is required.");
  } else if (!status) {
    responseData(res, "", 403, false, "status is required.");
  }
  else if (!org_id) {
    return responseData(res, "", 400, false, "Organization Id is required");
  }
  else if (!onlyAlphabetsValidation(lead_manager) && lead_manager.length >= 3) {
    responseData(
      res,
      "",
      403,
      false,
      "lead manager should be greater than 3 characters And number and special characters not allow"
    )

  }

  else {
    try {
      const check_org = await orgModel.findOne({ _id: org_id })
      if (!check_org) {
        return responseData(res, "", 404, false, "Org not found");
      }
      const check_email = await leadModel.find({ email: email, org_id: org_id });
      if (check_email.length > 0) {
        responseData(res, "", 403, false, "email already exist.");
      }
      if (check_email.length < 1) {
        const lead_id = generateSixDigitNumber();
        const check_user = await registerModel.findById(userId)
        if (check_user) {

          let fileUrls = []
          const newDate = new Date();

          const lead = new leadModel({
            org_id: org_id,
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
            lead_details: {
              lead_manager: lead_manager,
              email: email,
              phone: phone,
              location: location,
              status: status,
              lead_status: status,
              source: source,
              date: date,
              name: name
            },
            notes: [
              {
                content: content,
                createdBy: check_user.username,
                date: date,
                status: status,
              },
            ],
            lead_update_track: [

              {
                username: check_user.username,
                role: check_user.role,
                message: ` has created lead ${name} .`,
                updated_date: newDate,
              }
            ],
            lead_status: status,
            contract_Status: false,

          });

          const fileUploadData = new fileuploadModel({
            lead_id: lead_id,
            org_id: org_id,
            lead_name: name,

            files: [{
              folder_name: "Client Brief",
              updated_date: date,
              files: fileUrls
            },
            {
              folder_name: "Drawing",
              updated_date: date,
              files: fileUrls
            },
            {
              folder_name: "Review",
              updated_date: date,
              files: fileUrls
            },
            ]

          })

          const leadUpdate = {
            username: check_user.username,
            role: check_user.role,
            message: ` has created lead ${name} .`,
            updated_date: newDate,
            tag: [],
            type: 'creation',
          }

          await createOrUpdateTimeline(lead_id, '', org_id, leadUpdate, {}, res);

          await registerModel.findOneAndUpdate(
            { _id: userId, organization: org_id },
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
        else {
          responseData(
            res,
            "",
            400,
            false,
            "You have not access to create lead",
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
    const org_id = req.query.org_id;

    if (!org_id) {
      return responseData(res, "", 400, false, "Org ID is required", []);
    }

    const check_org = await orgModel.findOne({ _id: org_id });
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }

    const leads = await leadModel.aggregate([
      { $match: { org_id: org_id } },
      {
        $lookup: {
          from: "leadTask",
          localField: "lead_id",
          foreignField: "lead_id",
          as: "leadTask"
        }
      },
      {
        $project: {
          lead_id: 1,
          status: 1,
          lead_status: 1,
          count_task: { $size: "$leadTask" }, // Calculate task count
          // contract: 1,
          hasPendingContract: { // Calculate if any contract has "pending" admin_status

            $cond: [
              {
                $gt: [{
                  $size: {
                    $filter: {
                      input: "$contract",
                      as: "item",
                      cond: { $eq: ["$$item.admin_status", "pending"] }
                    }
                  }
                }, 0]
              },
              true,
              false
            ]
          },
          name: {
            $ifNull: [{ $arrayElemAt: ["$lead_details.name", 0] }, "$name"]
          },
          email: {
            $ifNull: [{ $arrayElemAt: ["$lead_details.email", 0] }, "$email"]
          },
          phone: {
            $ifNull: [{ $arrayElemAt: ["$lead_details.phone", 0] },"$phone"]
          },
          location: {
            $ifNull: [{ $arrayElemAt: ["$lead_details.location", 0] }, "$location"]
          },
          date: {
            $ifNull: [{ $arrayElemAt: ["$lead_details.date", 0] }, "$date"]
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    responseData(res, "All Lead Data", 200, true, "", { leads });
  } catch (error) {
    console.error(error);
    responseData(res, "", 500, false, error.message);
  }
};








export const getSingleLead = async (req, res) => {
  const lead_id = req.query.lead_id;
  const org_id = req.query.org_id;

  if (!lead_id) {
    return responseData(res, "", 400, false, "Lead ID is required", []);
  }
  if (!org_id) {
    return responseData(res, "", 400, false, "Org ID is required", []);
  }

  try {
    // Fetch lead data and check project existence in a single query
    const check_org = await orgModel.findOne({ _id: org_id })
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }
    const [leads, fileUploadExists] = await Promise.all([
      leadModel.find({ lead_id, org_id: org_id })
        .select('name lead_id lead_details lead_manager email phone location status source date updated_date notes contract  lead_status createdAt contract_Status')
        .lean(),
      fileuploadModel.exists({ lead_id, project_id: null, org_id })
    ]);
    console.log(leads)
    if (leads.length === 0) {
      return responseData(res, "", 404, false, "Data not found", []);
    }

    // Determine project status
    const project = !(fileUploadExists);


    // Construct response data
    const responseLeads = leads.map(lead => ({
      ...lead,
      project,
    }));

    return responseData(res, "Lead Data", 200, true, "", responseLeads);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return responseData(res, "", 500, false, error.message);
  }
};



function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export const updateFollowLead = async (req, res) => {
  const userId = req.body.userId;
  const lead_id = req.body.lead_id;
  const status = req.body.status;
  const content = req.body.content;
  const createdBy = req.body.createdBy;
  const update = req.body.date;
  const org_id = req.body.org_id;


  if (!lead_id) {
    responseData(res, "", 400, false, "lead_id is required", []);
  } else if (!status) {
    responseData(res, "", 400, false, "status is required", []);
  } else if (!createdBy) {
    responseData(res, "", 400, false, "createdBy is required", []);
  }
  else if (!userId) {
    responseData(res, "", 400, false, "UserId is required", []);

  } else if (!org_id) {
    return responseData(res, "", 400, false, "Org Id  required");
  } else {
    try {

      const check_org = await orgModel.findOne({ _id: org_id })
      if (!check_org) {
        return responseData(res, "", 404, false, "Org not found");
      }
      const formatedDate = formatDate(update);
      const find_lead = await leadModel.find({ lead_id: lead_id, org_id: org_id });
      if (find_lead.length > 0) {
        const check_user = await registerModel.findOne({ _id: userId, organization: org_id });
        const newDate = new Date();
        const update_Lead = await leadModel.findOneAndUpdate(
          { lead_id: lead_id, org_id: org_id },
          {
            $set: {
              status: status,
              updated_date: update,
              lead_status: status,
            },
            $push: {
              notes: {
                content: content,
                createdBy: check_user.username,
                date: update,
                status: status,
              },
              lead_update_track: {
                username: check_user.username,
                role: check_user.role,
                message: ` has updated status ${find_lead[0].lead_status}  from ${status}  in  lead ${find_lead[0].name} .`,
                updated_date: newDate
              }
            },
          },

          {
            new: true,
            useFindAndModify: false,
          }
        );

        const leadUpdate = {
          username: check_user.username,
          role: check_user.role,
          message: ` has updated status ${status}  from ${find_lead[0].lead_status}  in  lead ${find_lead[0].name} .`,
          updated_date: newDate,
          tags: [],
          type: 'lead updation'

        }

        await createOrUpdateTimeline(lead_id, '', org_id, leadUpdate, {}, res);



        const newNotification = new Notification({
          type: "lead",
          org_id: org_id,
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
  const user_id = req.body.user_id;
  const org_id = req.body.org_id;

  if (!lead_id) {
    responseData(res, "", 400, false, "lead_id is required", []);
  }
  else if (!user_id) {
    responseData(res, "", 400, false, "user_id is required", []);
  }
  else if (!onlyAlphabetsValidation(client_name)) {
    responseData(res, "", 400, false, "client_name should be cgaracters", []);
  }
  else if (!onlyEmailValidation(client_email)) {
    responseData(res, "", 400, false, "client_email is required", []);
  }
  else if (!onlyPhoneNumberValidation(client_contact)) {
    responseData(res, "", 400, false, "client_contact should be  10 digit number", []);
  }
  else if (!location) {
    responseData(res, "", 400, false, "location is required", []);
  }
  else if (!validateOnlyNumbers(project_budget)) {
    responseData(res, "", 400, false, "project_budget should be number", []);
  }
  else if (!project_type) {
    responseData(res, "", 400, false, "project_type is required", []);
  }
  else if (!project_name) {
    responseData(res, "", 400, false, "project_name should be required", []);
  }
  else if (!project_status) {
    responseData(res, "", 400, false, "project_status is required", []);

  }
  else if (!onlyAlphabetsValidation(designer)) {
    responseData(res, "", 400, false, "designer  should be characters ", []);
  }
  else if (!org_id) {
    responseData(res, "", 400, false, "org_id is required", []);
  }
  else {
    try {
      const check_org = await orgModel.findOne({ _id: org_id })
      if (!check_org) {
        return responseData(res, "", 404, false, "Org not found");
      }
      const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
      if (check_user) {
        const find_lead = await leadModel.find({ lead_id: lead_id, contract_Status: true, org_id: org_id });
        if (find_lead.length > 0) {
          const find_project = await projectModel.find({ lead_id: lead_id, org_id: org_id })

          if (find_project.length > 0) {
            const check_lead_in_file = await fileuploadModel.findOne({ $and: [{ lead_id: lead_id }, { project_id: null }, { org_id: org_id }] })
            if (!check_lead_in_file) {
              responseData(res, "", 400, false, "project already exist for this lead. Activate lead to create another project", []);
            }
            else {


              const file = req.files.contract;
              if (!file) {
                responseData(res, "", 400, false, "contract file is required", []);
              }
              const fileName = file.name;
              const folder_name = `Contract`;
              const fileSizeInBytes = file.size;
              let response = await uploadFile(file, fileName, lead_id, org_id, folder_name)

              if (response.status) {


                let fileUrls = [{
                  fileUrl: response.signedUrl,
                  fileName: fileName,
                  fileId: `FL-${generateSixDigitNumber()}`,
                  fileSize: `${fileSizeInBytes / 1024} KB`,
                  date: new Date()
                }]


                const existingFile = await fileuploadModel.findOne({
                  lead_id: lead_id, org_id: org_id
                });

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

                  const project_ID = generateSixDigitNumber();
                  const projectID = `COLP-${project_ID}`;
                  const project_data = await projectModel.create({
                    project_name: project_name,
                    org_id: org_id,
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
                  const lead_find_in_fileupload = await fileuploadModel.find({ lead_id: lead_id, org_id: org_id });
                  if (lead_find_in_fileupload.length < 1) {
                    responseData(res, "", 404, false, "lead not found in file manager")
                  }
                  if (lead_find_in_fileupload.length > 0) {
                    const lead_update_in_fileupload = await fileuploadModel.updateMany(
                      { lead_id: lead_id, org_id: org_id },
                      { $set: { project_id: projectID, project_name: project_name, lead_id: null } }
                    );
                  }

                  const newDate = new Date();
                  await leadModel.findOneAndUpdate({ lead_id: lead_id, org_id: org_id },
                    {
                      $set: {
                        lead_status: "project"
                      },
                      $push: {
                        lead_update_track: {
                          username: check_user.username,
                          role: check_user.role,
                          message: ` has converted lead ${find_lead[0].name} to project ${project_name} .`,
                          updated_date: newDate
                        }
                      }
                    }
                  )

                  const leadUpdate = {
                    username: check_user.username,
                    role: check_user.role,
                    message: ` has converted lead ${find_lead[0].name} to project ${project_name} .`,
                    updated_date: newDate,
                    tags: [],
                    type: 'lead updation'

                  }

                  const projectUpdate = {
                    username: check_user.username,
                    role: check_user.role,
                    message: ` has created the project`,
                    updated_date: newDate,
                    tags: [],
                    type: 'project creation'

                  }

                  await createOrUpdateTimeline(lead_id, '', org_id, leadUpdate, {}, res);
                  await createOrUpdateTimeline(lead_id, projectID, org_id, {}, projectUpdate, res);

                  await registerModel.findOneAndUpdate(
                    { _id: user_id, org_id: org_id },
                    {
                      $push: {
                        "data.$[outer].projectData": {
                          project_id: projectID,
                          role: check_user.role,
                        }
                      }
                    },
                    {
                      arrayFilters: [{ "outer.projectData": { $exists: true } }]
                    }
                  );
                  responseData(
                    res,
                    "project created successfully",
                    200,
                    true,
                    "",

                  );
                }

              } else {
                // console.log(response)
                responseData(res, "", 400, false, "contract file upload failed", "");
              }

            }

          }
          if (find_project.length < 1) {

            const file = req.files.contract;
            if (!file) {
              responseData(res, "", 400, false, "contract file is required", []);
            }
            const fileName = file.name;
            const folder_name = `Contract`;
            const fileSizeInBytes = file.size;
            let response = await uploadFile(file, fileName, lead_id, org_id, folder_name)

            if (response.status) {


              let fileUrls = [{
                fileUrl: response.signedUrl,
                fileName: fileName,
                fileId: `FL-${generateSixDigitNumber()}`,
                fileSize: `${fileSizeInBytes / 1024} KB`,
                date: new Date()
              }]


              const existingFile = await fileuploadModel.findOne({
                lead_id: lead_id, org_id: org_id
              });

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

                const project_ID = generateSixDigitNumber();
                const projectID = `COL\P-${project_ID}`;
                const project_data = await projectModel.create({
                  project_name: project_name,
                  org_id: org_id,
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
                const lead_find_in_fileupload = await fileuploadModel.find({ lead_id: lead_id, org_id: org_id });
                if (lead_find_in_fileupload.length < 1) {
                  responseData(res, "", 404, false, "lead not found in file manager")
                }
                if (lead_find_in_fileupload.length > 0) {
                  const lead_update_in_fileupload = await fileuploadModel.updateMany(
                    { lead_id: lead_id, org_id: org_id },
                    { $set: { project_id: projectID, project_name: project_name, lead_id: null } }
                  );
                }
                await leadModel.findOneAndUpdate({ lead_id: lead_id, org_id: org_id },
                  {
                    $set: {
                      lead_status: "project"
                    },
                    $push: {
                      lead_update_track: {
                        username: check_user.username,
                        role: check_user.role,
                        message: ` has converted lead ${find_lead[0].name} to project ${project_name} .`,
                        updated_date: new Date()
                      }
                    }
                  }
                )

                const newDate = new Date();

                const leadUpdate = {
                  username: check_user.username,
                  role: check_user.role,
                  message: ` has converted lead ${find_lead[0].name} to project ${project_name} .`,
                  updated_date: newDate,
                  tags: [],
                  type: 'lead updation'

                }

                const projectUpdate = {
                  username: check_user.username,
                  role: check_user.role,
                  message: ` has created the project`,
                  updated_date: newDate,
                  tags: [],
                  type: 'project creation'

                }

                await createOrUpdateTimeline(lead_id, '', org_id, leadUpdate, {}, res);
                await createOrUpdateTimeline(lead_id, projectID, org_id, {}, projectUpdate, res);

                await registerModel.findOneAndUpdate(
                  { _id: user_id, org_id: org_id },
                  {
                    $push: {
                      "data.$[outer].projectData": {
                        project_id: projectID,
                        role: check_user.role,
                      }
                    }
                  },
                  {
                    arrayFilters: [{ "outer.projectData": { $exists: true } }]
                  }
                );
                responseData(
                  res,
                  "project created successfully",
                  200,
                  true,
                  "",

                );
              }

            } else {
              // console.log(response)
              responseData(res, "", 400, false, "contract file upload failed", "");
            }


          }
        }
        if (find_lead.length < 1) {
          responseData(res, "", 404, false, "lead not found", []);
        }
        if (!check_user) {
          responseData(res, "", 404, false, "User not found", []);
        }

      }

    } catch (err) {
      console.log(err);
      return res.status(500).send(err);


    }
  }
};


export const leadToMultipleProject = async (req, res) => {
  try {
    const lead_id = req.body.lead_id;
    const type = req.body.type;
    const user_id = req.body.user_id;
    const org_id = req.body.org_id;
    const name = req.body.lead_name;
    const email = req.body.email;
    const phone = req.body.phone;
    const location = req.body.location;
    const source = req.body.source;
    const date = req.body.date;
    const lead_manager = req.body.lead_manager;


    if (!lead_id) {
      responseData(res, "", 400, false, "lead id is required", []);
    }
    else if (!type) {
      responseData(res, "", 400, false, "type is required", []);
    }
    else if (!user_id) {
      responseData(res, "", 400, false, "user id is required", []);
    }
    else if (!org_id) {
      return responseData(res, "", 400, false, "Org Id  required");
    }
    else {
      const check_org = await orgModel.findOne({ _id: org_id })
      if (!check_org) {
        return responseData(res, "", 404, false, "Org not found");
      }
      if (type) {
        const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
        if (!check_user) {
          responseData(res, "", 400, false, " Invalid user Id", []);
        }
        else {
          if (check_user) {
            const check_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id })
            if (!check_lead) {
              responseData(res, "", 404, false, "lead not found", []);
            }
            const check_lead_in_file = await fileuploadModel.findOne({ $and: [{ lead_id: lead_id, org_id: org_id }, { project_id: null }] })
            if (check_lead_in_file) {
              responseData(res, "", 400, false, "lead already activate", []);
            }
            else {
              let fileUrls = []

              const fileUploadData = new fileuploadModel({
                lead_id: lead_id,
                org_id: org_id,
                lead_name: check_lead.name,

                files: [{
                  folder_name: "Client Brief",
                  updated_date: new Date(),
                  files: fileUrls
                },
                {
                  folder_name: "Drawing",
                  updated_date: new Date(),
                  files: fileUrls
                },
                {
                  folder_name: "Review",
                  updated_date: new Date(),
                  files: fileUrls
                },
                ]

              })
              await leadModel.findOneAndUpdate(
                { lead_id: lead_id, org_id: org_id },
                {
                  $set: {
                    lead_status: "Follow Up",
                    lead_update_track: [],
                    contract_Status: false
                  },
                  $push: {
                    lead_details: {
                      $each: [{
                        name: name,
                        email: email,
                        phone: phone,
                        location: location,
                        source: source,
                        date: date,
                        lead_manager: lead_manager,
                      }],
                      $position: 0
                    }
                  }
                }
              )

              const leadUpdate = {
                username: check_user.username,
                role: check_user.role,
                message: ` has activated the lead for another project .`,
                updated_date: new Date(),
                tags: [],
                type: 'lead activation'
              }

              await createOrUpdateTimeline(lead_id, '', org_id, leadUpdate, {}, res);

              await fileUploadData.save()

              responseData(
                res,
                "lead activated successfully for another project.",
                200,
                true,
                "",
              );
            }


          }
          else {
            responseData(
              res,
              "",
              400,
              false,
              "You have not access to activate lead  for another project",
            );
          }
        }

      }
      else {
        responseData(
          res,
          "",
          400,
          false,
          "lead already activate",
        );
      }
    }
  }
  catch (err) {
    console.log(err);
    res.send(err);

  }

}

export const updateLead = async (req, res) => {
  try {
    const lead_id = req.body.lead_id;
    const name = req.body.lead_name;
    const email = req.body.email;
    const phone = req.body.phone;
    const location = req.body.location;
    const source = req.body.source;
    const date = req.body.date;
    const lead_manager = req.body.lead_manager;
    const user_id = req.body.user_id;
    const org_id = req.body.org_id;

    if (!onlyAlphabetsValidation(name) && name.length >= 3) {
      responseData(
        res,
        "",
        403,
        false,
        "name should be greater than 3 characters."
      );

    } else if (!user_id) {
      responseData(res, "", 403, false, "userId is required.")
    }
    else if (!lead_id) {
      responseData(res, "", 403, false, "lead Id is required.")
    }
    else if (!onlyEmailValidation(email) && email.length > 5) {
      responseData(res, "", 403, false, "email is invalid.");
    } else if (!onlyPhoneNumberValidation(phone)) {
      responseData(res, "", 403, false, "phone number  is  invalid.");
    } else if (!location) {
      responseData(res, "", 403, false, "location is required.");
    }
    else if (!onlyAlphabetsValidation(lead_manager) && lead_manager.length >= 3) {
      responseData(
        res,
        "",
        403,
        false,
        "lead manager should be greater than 3 characters."
      )

    }
    else if (!org_id) {
      responseData(res, "", 400, false, "org id is required", []);
    }
    else {
      const check_org = await orgModel.findOne({ _id: org_id })
      if (!check_org) {
        return responseData(res, "", 404, false, "Org not found");
      }
      const check_user = await registerModel.findOne({ _id: user_id, organization: org_id })
      if (!check_user) {
        responseData(res, "", 403, false, "user not found.")
      }
      else {
        const check_lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id })
        if (!check_lead) {
          responseData(res, "", 403, false, "lead not found.")
        }
        else {
          const newDate = new Date();
          await leadModel.findOneAndUpdate(
            { lead_id: lead_id, org_id: org_id },
            {
              $set: {
                'lead_details.0': {
                  name: name,
                  email: email,
                  phone: phone,
                  location: location,
                  source: source,
                  date: date,
                  lead_manager: lead_manager,
                }

              },
              $push: {
                lead_update_track: {
                  username: check_user.username,
                  role: check_user.role,
                  message: ` has updated lead ${check_lead.name} .`,
                  updated_date: newDate
                }

              }

            }

          );
          await fileuploadModel.findOneAndUpdate({ lead_id: lead_id, org_id: org_id },
            {
              $set: {
                lead_name: name
              },

            }
          );

          const leadUpdate = {
            username: check_user.username,
            role: check_user.role,
            message: ` has updated lead ${check_lead.name}.`,
            updated_date: newDate,
            tags: [],
            type: 'lead updation'
          }

          await createOrUpdateTimeline(lead_id, '', org_id, leadUpdate, {}, res);
          responseData(
            res,
            "lead updated successfully.",
            200,
            true,
            "",
          );
        }
      }

    }
  }
  catch (err) {
    console.log(err)
    responseData(res, "", 500, false, "Something Went Wrong", err)
  }

}


async function deleteFolder(bucket, folder) {
  try {
    // List all objects in the folder
    const listParams = {
      Bucket: bucket,
      Prefix: folder
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) {
      console.log('Folder is already empty or does not exist.');
      return;
    }

    // Create a list of objects to delete
    const deleteParams = {
      Bucket: bucket,
      Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
    });

    // Delete the objects
    await s3.deleteObjects(deleteParams).promise();

    // If there are more objects, continue deleting
    if (listedObjects.IsTruncated) {
      await deleteFolder(bucket, folder);
    } else {
      console.log('Folder and all its contents deleted successfully.');
    }
  } catch (error) {
    console.error('Error deleting folder:', error);
  }
}

export const deleteInvativeLead = async (req, res) => {
  try {
    const user = req.user;
    const lead_id = req.query.lead_id;
    const org_id = req.query.org_id;


    // Validate user and lead_id
    if (!user) {
      return responseData(res, "", 403, false, "User not found.");
    }

    if (!lead_id) {
      return responseData(res, "", 400, false, "lead_id is required.");
    }
    if (!org_id) {
      responseData(res, "", 400, false, "org id is required", []);
    }

    const check_org = await orgModel.findOne({ _id: org_id })
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }
    // Check for the lead
    const check_lead = await leadModel.findOne({ lead_id, status: 'Inactive', org_id });
    // console.log('Lead found:', check_lead);

    if (!check_lead) {
      return responseData(res, "", 404, false, "Lead not found.");
    }


    // Perform deletions
    await Promise.all([
      deleteFolder(process.env.S3_BUCKET_NAME, `${lead_id}/`),
      leadModel.findOneAndDelete({ lead_id, org_id, status: 'Inactive' }),
      fileuploadModel.findOneAndDelete({ lead_id, org_id }),
      archiveModel.deleteMany({ lead_id, org_id }),
    ]);

    return responseData(res, "Lead deleted successfully.", 200, true, "");

  } catch (err) {
    console.error(err);
    return responseData(res, "", 500, false, "Something went wrong", err);
  }
};




export const leadActivity = async (req, res) => {
  try {
    const lead_id = req.query.lead_id;
    const org_id = req.query.org_id;
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 5; // Default to 5 items per page
    const skip = (page - 1) * limit;

    if (!lead_id) {
      return responseData(res, "", false, 400, "Lead Id is required");
    }
    if (!org_id) {
      responseData(res, "", 400, false, "org id is required", []);
    }

    const check_org = await orgModel.findOne({ _id: org_id })
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }
    // Fetch lead activities and only the lead_update_track field
    const lead = await leadModel
      .findOne({ lead_id: lead_id, org_id: org_id })
      .select('lead_update_track');

    if (!lead) {
      return responseData(res, "", false, 404, "Lead not found");
    }

    const activities = lead.lead_update_track.reverse() || [];

    const totalActivities = activities.length;

    // Slice the activities array for pagination
    const paginatedActivities = activities.slice(skip, skip + limit);


    // Structure the response
    const response = {
      activities: paginatedActivities,
      total: totalActivities,
      page,
      limit,
      totalPages: Math.ceil(totalActivities / limit),
    }
    responseData(res, "Lead Activity", 200, true, "", response);
  } catch (err) {
    console.error(err); // Log the error for debugging
    responseData(res, "", 400, false, "Error fetching lead activity", err);
  }
}





export const getTimeline = async (req, res) => {
  try {
    const lead_id = req.query.lead_id;
    const org_id = req.query.org_id;

    if (!lead_id) {
      return responseData(res, "", false, 400, "Lead Id is required");
    }
    if (!org_id) {
      return responseData(res, "", 400, false, "org id is required", []);
    }

    const check_org = await orgModel.findOne({ _id: org_id });
    if (!check_org) {
      return responseData(res, "", 404, false, "Org not found");
    }

    const lead = await leadModel.findOne({ lead_id: lead_id, org_id: org_id });
    if (!lead) {
      return responseData(res, "", false, 404, "Lead not found");
    }

    // Step 1: Fetch all timelines with the given lead_id
    const timelines = await TimelineModel.find({ lead_id: lead_id });
    const projects = await projectModel.find({ lead_id: lead_id });

    let updatedTimelines = [];

    if (timelines.length > 0) {
      updatedTimelines = await Promise.all(
        timelines.map(async (timeline) => {
          if (timeline.project_id) {
            // Fetch the project
            const project = await projectModel.findOne({ project_id: timeline.project_id });

            // console.log("Fetched project:", project); // Debugging

            if (project) {
              return {
                ...timeline,
                project_id: project.project_id, // Replace project_id with project_name
                project_name: project.project_name,
                leadEvents: timeline.leadEvents?.reverse() || [],
                projectEvents: timeline.projectEvents?.reverse() || [],
                lead_id: lead?.lead_id || "",
                lead_name: lead?.name || "",
              };
            }
          }

          // Return timeline even if no project was found
          return {
            ...timeline,
            leadEvents: timeline.leadEvents?.reverse() || [],
            projectEvents: timeline.projectEvents?.reverse() || [],
            lead_id: lead?.lead_id || "",
            lead_name: lead?.name || "",
          };
        })
      );


    }

    let newTimeline = [];

    if (updatedTimelines.length <= 0) {

      const tml = {
        lead_id: lead?.lead_id || "",
        project_id: "",
        lead_name: lead?.name || "",
        project_name: "",
        org_id: org_id,
        leadEvents: lead.lead_update_track,
        projectEvents: [],
      }



      updatedTimelines.push(tml)

    }

    for (let project of projects) {
      const exists = updatedTimelines.some(timeline => timeline.project_id === project.project_id);
      if (!exists) {

        const tml = {
          lead_id: lead?.lead_id || "",
          project_id: project?.project_id || "",
          lead_name: lead?.name || "",
          project_name: project?.project_name || "",
          org_id: org_id,
          leadEvents: lead.lead_update_track,
          projectEvents: project.project_updated_by,
        }

        newTimeline.push(tml);
      }
    }

    newTimeline = [...updatedTimelines.reverse(), ...newTimeline];

    if (updatedTimelines) {
      return responseData(res, "Timeline is found!", 200, true, "", newTimeline);
    }

    responseData(res, "Timeline not found!", 404, true, "", []);
  } catch (err) {
    console.error(err); // Log the error for debugging
    responseData(res, "", 500, false, "Error fetching timeline", err);
  }
};

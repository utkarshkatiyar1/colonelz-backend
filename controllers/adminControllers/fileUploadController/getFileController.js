import { response } from "express";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import { responseData } from "../../../utils/respounse.js";
import projectModel from "../../../models/adminModels/project.model.js";
import leadModel from "../../../models/adminModels/leadModel.js";

export const getFileData = async (req, res) => {
  try {
    const data = await fileuploadModel.find({}).lean();

    if (!data.length) {
      return responseData(res, "Data Not Found!", 200, true, "");
    }

    const projectIds = data.filter(d => d.project_id).map(d => d.project_id);
    const leadIds = data.filter(d => d.lead_id).map(d => d.lead_id);

    const [projects, leads] = await Promise.all([
      projectModel.find({ project_id: { $in: projectIds } }).lean(),
      leadModel.find({ lead_id: { $in: leadIds } }).lean(),
    ]);

    const projectData = [];
    const leadData = [];

    data.forEach(element => {
      if (element.project_id) {
        const check_project = projects.find(p => p.project_id === element.project_id);
        if (check_project) {
          projectData.push({
            project_name: element.project_name,
            project_id: element.project_id,
            client_name: check_project.client[0]?.client_name,
            project_type: check_project.project_type,
            project_status: check_project.project_status,
            files: element.files,
          });
        }
      }

      if (element.lead_id) {
        const check_lead = leads.find(l => l.lead_id === element.lead_id);
        if (check_lead) {
          leadData.push({
            lead_id: element.lead_id,
            lead_name: element.lead_name,
            lead_email: check_lead.email,
            lead_phone: check_lead.phone,
            lead_status: check_lead.status,
            lead_date: check_lead.date,
            files: element.files,
          });
        }
      }
    });

    const response = {
      leadData,
      projectData,
    };

    responseData(res, "Get File Data Successfully!", 200, true, "", response);

  } catch (err) {
    console.error(err);
    responseData(res, "", 500, false, "An error occurred while fetching file data.");
  }
};


export const getleadData = async(req,res)=>{
        try {
           const lead_id = req.query.lead_id;
          const data = await fileuploadModel.find({lead_id:lead_id});
          if(data.length>0)
          {
            

            let files = []
            for (let i = 0; i < data[0].files.length; i++) {
              
              if(data[0].files[i].files.length>0)
              {
                files.push({
                  folder_name: data[0].files[i].folder_name,
                  updated_date: data[0].files[i].updated_date,
                  total_files: data[0].files[i].files.length,
                  files: data[0].files[i].files
                })
              }
              else{
                files.push({
                  folder_name: data[0].files[i].folder_name,
                  updated_date: data[0].files[i].updated_date,
                  total_files: 0,
                  files: []
                })
              }
             

            }
            responseData(
              res,
              `Get File  Data Successfully !`,
              200,
              true,
              "",
              files
            );
          }
          if(data.length<1)
          {
            responseData(
              res,
              "Data Not Found! ",
              200,
              true,
              "",

            );
          }
          
        }
        catch(error)
        {
responseData(res,"",500,false,"Internal Server Error",error)
        }
}

export const getprojectData = async(req,res)=>{
try{
  const project_id = req.query.project_id;
  const data = await fileuploadModel.find({project_id:project_id});
  if(data.length>0)
  {
    
    let files =[]
    for(let i=0;i<data[0].files.length;i++)
    {
      if(data[0].files[i].files.length>0)
      {
        files.push({
          folder_name: data[0].files[i].folder_name,
          updated_date: data[0].files[i].updated_date,
          total_files: data[0].files[i].files.length,
          files: data[0].files[i].files
        })
      }
      else{
        files.push({
          folder_name: data[0].files[i].folder_name,
          updated_date: data[0].files[i].updated_date,
          total_files: 0,
          files: []
        })
      }
     

    }
    responseData(
      res,
      `Get File  Data Successfully !`,
      200,
      true,
      "",
      files
    );
  }
  if(data.length<1)
  {
    responseData(
      res,
      "Data Not Found!",
      200,
      true,
      " ",

    );
  }

}
catch(error)
{
responseData(res,"",500,false,"Internal Server Error",error)
}

}

export const getCompanyData = async(req,res) =>{
  try {
    const data = await fileuploadModel.find({});
    if (data.length > 0) {
      let templateData = []
      await Promise.all(data.map(async (element) => {
        if (element.lead_id == null && element.project_id == null) {
          let files = []

          // console.log(element.files)
          for (let i = 0; i < element.files.length; i++) {


            files.push({
              folder_name: element.files[i].folder_name,
              folder_id: element.files[i].folder_id,
              sub_folder_name_first: element.files[i].sub_folder_name_first,
              sub_folder_name_second: element.files[i].sub_folder_name_second,
              updated_date: element.files[i].updated_date,
              total_files: element.files[i].files.length,
              files: element.files[i].files

            })

          }
          

          templateData.push({
            type: element.type,
            files: files

          })
        }


      }))

      const response = {
        templateData: templateData
      }
      responseData(
        res,
        `Get File  Data Successfully !`,
        200,
        true,
        "",
        response
      );
    }
    if (data.length < 1) {

      responseData(
        res,
        "Data Not Found!",
        200,
        true,
        " ",

      );
    }
  } catch (err) {
    res.send(err);
    console.log(err);
  }



}





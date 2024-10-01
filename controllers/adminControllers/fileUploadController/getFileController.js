import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import { responseData } from "../../../utils/respounse.js";
import projectModel from "../../../models/adminModels/project.model.js";
import leadModel from "../../../models/adminModels/leadModel.js";

export const getFileData = async (req, res) => {
  try {
    const data = await fileuploadModel.find({})
      .select('project_id lead_id lead_name project_name')
      .lean();

    if (!data.length) {
      return responseData(res, "Data Not Found!", 200, true, "");
    }

    const projectIds = [...new Set(data.map(d => d.project_id).filter(Boolean))];
    const leadIds = [...new Set(data.map(d => d.lead_id).filter(Boolean))];

    const [projects, leads] = await Promise.all([
      projectModel.find({ project_id: { $in: projectIds } }).select('project_id client project_type project_status').lean(),
      leadModel.find({ lead_id: { $in: leadIds } }).select('lead_id email status date').lean(),
    ]);

    const projectMap = new Map(projects.map(p => [p.project_id, p]));
    const leadMap = new Map(leads.map(l => [l.lead_id, l]));

    const projectData = data
      .filter(element => element.project_id && projectMap.has(element.project_id))
      .map(element => {
        const project = projectMap.get(element.project_id);
        return {
          project_name: element.project_name,
          project_id: element.project_id,
          client_name: project.client[0]?.client_name,
          project_type: project.project_type,
          project_status: project.project_status,
        };
      });

    const leadData = data
      .filter(element => element.lead_id && leadMap.has(element.lead_id))
      .map(element => {
        const lead = leadMap.get(element.lead_id);
        return {
          lead_id: element.lead_id,
          lead_name: element.lead_name,
          lead_email: lead.email,
          lead_status: lead.status,
          lead_date: lead.date,
        };
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




export const getleadData = async (req, res) => {
  try {
    const { lead_id } = req.query;
    const { user } = req;
    const data = await fileuploadModel.findOne({ lead_id }).lean();

    if (!data || data.files.length === 0) {
      return responseData(res, "Data Not Found!", 200, true, "");
    }

    const files = data.files.map(file => {
      const foldername = file.folder_name.toLowerCase();

      
      if (foldername === 'contract') {
        if (!user.access?.contract || !user.access.contract.includes('read')) {
          return null;
        }
      }
      if (foldername === 'quotation') {
        if (!user.access?.quotation || !user.access.quotation.includes('read')) {
          return null;
        }
      }

      return {
        folder_name: file.folder_name,
        updated_date: file.updated_date,
        total_files: file.files.length,
        files: file.files
      };
    }).filter(file => file !== null);

    responseData(res, "Get File Data Successfully!", 200, true, "", files);

  } catch (error) {
    console.error(error);
    responseData(res, "", 500, false, "Internal Server Error", error);
  }
};



export const getprojectData = async (req, res) => {
  try {
    const project_id = req.query.project_id;
    const { user } = req;
    const data = await fileuploadModel.findOne({ project_id }).lean();

    if (!data || data.files.length === 0) {
      return responseData(res, "Data Not Found!", 200, true, "");
    }

    const files = data.files.map(file => {
      const foldername = file.folder_name.toLowerCase();


      if (foldername === 'contract') {
        if (!user.access?.contract || !user.access.contract.includes('read')) {
          return null;
        }
      }
      if (foldername === 'quotation' || foldername === 'procurement data') {
        if (!user.access?.quotation || !user.access.quotation.includes('read')) {
          return null;
        }
      }

      return {
        folder_name: file.folder_name,
        updated_date: file.updated_date,
        total_files: file.files.length,
        files: file.files
      };
    }).filter(file => file !== null);

    responseData(res, "Get File Data Successfully!", 200, true, "", files);

  } catch (error) {
    console.error(error);
    responseData(res, "", 500, false, "Internal Server Error", error);
  }
};


export const getCompanyData = async (req, res) => {
  try {
    // const type = req.query.type;
    // const type2 = req.query.filter;
    // if (!type) {
    //   return responseData(res, "", 400, false, "Please Provide Type!");
    // }
    // if(!type2)
    // {
    //   return responseData(res, "", 400, false, "Please Provide Filter!");
    // }

    const data = await fileuploadModel.find({});
    if (data.length === 0) {
      return responseData(res, "Data Not Found!", 200, true, "");
    }

    const templateData = await Promise.all(data.map(async (element) => {
      if (element.lead_id === null && element.project_id === null) {
        const files = element.files
          .filter(file => file.folder_name
            //  === type && file.sub_folder_name_first === type2
            )
          .map(file => ({
            folder_name: file.folder_name,
            folder_id: file.folder_id,
            sub_folder_name_first: file.sub_folder_name_first,
            sub_folder_name_second: file.sub_folder_name_second,
            updated_date: file.updated_date,
            total_files: file.files.length,
            files: file.files,
          }));

        return files.length > 0 ? { type: element.type, files } : null;
      }
      return null; 
    }));
    const filteredTemplateData = templateData.filter(item => item !== null);

    responseData(res, "Get File Data Successfully!", 200, true, "", { templateData: filteredTemplateData });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};






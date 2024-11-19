import projectModel from "../../../models/adminModels/project.model.js";
import { responseData } from "../../../utils/respounse.js";



export const getQuotationData = async (req, res) => {
  try {
    const { project_id, org_id } = req.query;

    // Validate project_id
    if (!project_id) {
      return responseData(res, "", 400, false, "Project ID is required");
    }
    if(!org_id)
    {
      return responseData(res, "", 404, false, "Org Id required", []);
    }

    // Fetch project with only necessary fields, using lean for performance
    const project = await projectModel.findOne({ project_id, org_id }).select('quotation').lean();

    if (project) {
      return responseData(res, "Quotation data found", 200, true, "", project.quotation);
    } else {
      return responseData(res, "", 404, false, "No project found with this ID");
    }
  } catch (err) {
    console.error(err);
    return responseData(res, "", 500, false, "Error fetching quotation data");
  }
};



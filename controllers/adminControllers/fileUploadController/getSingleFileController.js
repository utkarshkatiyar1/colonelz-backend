import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";
import { responseData } from "../../../utils/respounse.js";

const getSingleFileData = async (req, res) => {
  const lead_id = req.query.lead_id;
  const project_id = req.query.project_id;
  const folder_name = req.query.folder_name;
  const fileId = req.query.file_id;

  // Check if both lead_id and project_id are missing
  if (!fileId) {
    return responseData(res, "", 400, false, "Please Enter FileId");
  } else if (!folder_name) {
    return responseData(res, "", 400, false, "Please Enter Folder Name");
  }

  try {
    // Querying based on lead_id or project_id
    const query = {};
    if (lead_id) query.lead_id = lead_id;
    if (project_id) query.project_id = project_id;

    const data = await fileuploadModel.find(query);

    if (data.length > 0) {
      const folder = data[0].files.find(
        (folder) => folder.folder_name === folder_name
      );

      if (folder) {
        const file = folder.files.find((file) => file.fileId === fileId);
        if (file) {
          return responseData(res, "", 200, true, "", file);
        } else {
          return responseData(res, "", 404, false, "File Not Found!");
        }
      } else {
        return responseData(res, "", 404, false, "Folder Not Found!");
      }
    } else {
      return responseData(res, "", 404, false, "Data Not Found!");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
};

export default getSingleFileData;

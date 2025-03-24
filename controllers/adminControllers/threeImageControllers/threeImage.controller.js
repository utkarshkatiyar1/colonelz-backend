import roleModel from "../../../models/adminModels/role.model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import ThreeImage from "../../../models/adminModels/threeImage.model.js";
import { responseData } from "../../../utils/respounse.js";
import leadModel from "../../../models/adminModels/leadModel.js";
import fileuploadModel from "../../../models/adminModels/fileuploadModel.js";


function generateSixDigitNumber() {
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}

export const createImage = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const org_id = req.body.org_id;
        const lead_id = req.body.lead_id;
        const project_id = req.body.project_id;
        const name = req.body.name;
        const rename = req.body.rename;
        const url = req.body.url;
        const main_img_id = req.body.main_img_id;
        const type = req.body.type;
        const crd = req.body.crd;
        const hp = req.body.hp;

        // console.log("hp", hp)

        const img_id = generateSixDigitNumber();

        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        if (!user_id) {
            return responseData(res, "", 400, false, "user_id is required");
        }

        const newImage = new ThreeImage({
            org_id,
            lead_id: lead_id ? lead_id : null,
            project_id: project_id ? project_id : null,
            user_id,
            img_id,
            main_img_id: type === 'main' ? null : main_img_id,
            name: rename ? rename : name,
            type,
            url,
            crd,
            hp,
        });

        const savedImage = await newImage.save();

        let strImg_id = img_id.toString();

        if (main_img_id) {
            await ThreeImage.findOneAndUpdate(
                { img_id: main_img_id }, // Find by main_imgId
                { $push: { hp: strImg_id } }, // Add the new img_id to the hp array
                { new: true } // Return the updated document
            );
        }
        responseData(res, "Image created Successfully", 200, true, "", []);

    }
    catch (err) {
        responseData(res, "", 500, false, "Internal Server Error")
        console.log(err)
    }
}


export const createHPImage = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const org_id = req.body.org_id;
        const name = req.body.name;
        const url = req.body.url;
        const main_imgId = req.body.main_imgId;
        const type = req.body.type;
        const crd = req.body.crd;
        const hp = req.body.hp;

        const img_id = generateSixDigitNumber();

        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        if (!user_id) {
            return responseData(res, "", 400, false, "user_id is required");
        }

        const newImage = new ThreeImage({
            org_id,
            user_id,
            img_id,
            name,
            type,
            url,
            crd,
            hp,
        });

        const savedImage = await newImage.save();

        if (main_imgId) {
            await ThreeImage.findOneAndUpdate(
                { img_id: main_imgId }, // Find by main_imgId
                { $push: { hp: img_id } }, // Add the new img_id to the hp array
                { new: true } // Return the updated document
            );
        }
        responseData(res, "Image created Successfully", 200, true, "", []);

    }
    catch (err) {
        responseData(res, "", 500, false, "Internal Server Error")
        console.log(err)
    }
}

export const getImageById = async (req, res) => {
    try {
        const org_id = req.query.org_id;
        const lead_id = req.query.lead_id;
        const project_id = req.query.project_id;
        const img_id = req.query.img_id;
        const type = req.query.type;


        

        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }

        if (!img_id) {
            return responseData(res, "", 400, false, "Image Id is required");
        }
        const query = 
        {
            org_id: org_id,
            img_id: img_id,
            $or: [
                { lead_id: lead_id }, // Try to find by lead_id first
                { project_id: project_id } // If lead_id doesn't exist, find by project_id
            ]
        } 

        const image = await ThreeImage.aggregate([
            {
                $match: query,
            },
            {
                $lookup: {
                    from: "threeimage",  // Make sure this is your actual collection name
                    localField: "hp",    // `hp` is an array of `img_id`s
                    foreignField: "img_id",
                    as: "hp_details"
                }
            },
            {
                $project: {
                    img_id: 1,
                    name: 1,
                    type: 1,
                    url: 1,
                    crd: 1,
                    hp: {
                        $map: {
                            input: "$hp_details",
                            as: "hotspot",
                            in: {
                                img_id: "$$hotspot.img_id",
                                name: "$$hotspot.name",
                                type: "$$hotspot.type",
                                url: "$$hotspot.url",
                                crd: "$$hotspot.crd",
                                hp: "$$hotspot.hp"
                            }
                        }
                    }
                }
            }
        ]);
      
          if (!image || image.length === 0) {
            return responseData(res, "Image not found", 400, true, "", []);
          }        

        responseData(res, "Image Found", 200, true, "", image);
    } catch (err) {
        responseData(res, "", 500, false, "Internal Server Error");
        console.error(err);
    }
};



export const getAllMainImage = async (req, res) => {
    try {
        const org_id = req.query.org_id;
        const type = req.query.type;
        const img_id = req.query.img_id;
        const lead_id = req.query.lead_id;
        const project_id = req.query.project_id;
        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }

        

        let image = {};

        const query = img_id ?  {
            org_id: org_id,
            img_id: img_id,
            $or: [
                { lead_id: lead_id }, // Try to find by lead_id first
                { project_id: project_id } // If lead_id doesn't exist, find by project_id
            ]
        } : 
        {
            org_id: org_id,
            type: "main",
            $or: [
                { lead_id: lead_id }, // Try to find by lead_id first
                { project_id: project_id } // If lead_id doesn't exist, find by project_id
            ]
        } 

        if(img_id) {
             image = await ThreeImage.aggregate([
                {
                    $match: query,
                },
                {
                    $lookup: {
                        from: "threeimage",  // Make sure this is your actual collection name
                        localField: "hp",    // `hp` is an array of `img_id`s
                        foreignField: "img_id",
                        as: "hp_details"
                    }
                },
                {
                    $project: {
                        img_id: 1,
                        name: 1,
                        type: 1,
                        url: 1,
                        crd: 1,
                        hp: {
                            $map: {
                                input: "$hp_details",
                                as: "hotspot",
                                in: {
                                    img_id: "$$hotspot.img_id",
                                    name: "$$hotspot.name",
                                    type: "$$hotspot.type",
                                    url: "$$hotspot.url",
                                    crd: "$$hotspot.crd",
                                    hp: "$$hotspot.hp"
                                }
                            }
                        }
                    }
                }
            ]);

        } else {

             image = await ThreeImage.aggregate([
                {
                    $match: query,
                },
                {
                    $lookup: {
                        from: "threeimage",  // Make sure this is your actual collection name
                        localField: "hp",    // `hp` is an array of `img_id`s
                        foreignField: "img_id",
                        as: "hp_details"
                    }
                },
                {
                    $project: {
                        img_id: 1,
                        name: 1,
                        type: 1,
                        url: 1,
                        crd: 1,
                        hp: {
                            $map: {
                                input: "$hp_details",
                                as: "hotspot",
                                in: {
                                    img_id: "$$hotspot.img_id",
                                    name: "$$hotspot.name",
                                    type: "$$hotspot.type",
                                    url: "$$hotspot.url",
                                    crd: "$$hotspot.crd",
                                    hp: "$$hotspot.hp"
                                }
                            }
                        }
                    }
                }
            ]);
        }


        // console.log('image', image)
      
          if (!image || image.length === 0) {
            return responseData(res, "Image not found", 404, true, "", []);
          }        

        responseData(res, "Image Found", 200, true, "", image);
    } catch (err) {
        responseData(res, "", 500, false, "Internal Server Error");
        console.error(err);
    }
};



export const getAllPanoImagesFromFileManager = async (req, res) => {
    try {
        const org_id = req.query.org_id;
        const lead_id = req.query.lead_id;
        const project_id = req.query.project_id;
        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }


        const query = {
            org_id: org_id,
            'files.folder_name': 'panoramic',
            type: { $exists: false },
            $or: [
                { lead_id: lead_id }, // Try to find by lead_id first
                { project_id: project_id } // If lead_id doesn't exist, find by project_id
            ]
        } 

        const document = await fileuploadModel.findOne(query);
        

        if (!document || document.length === 0) {
            return responseData(res, "Image not found", 404, false, "", []);
        }        
        
        const panoramicFolder = document.files.find(folder => folder.folder_name === "panoramic");

        if (!panoramicFolder) {
            return responseData(res, "", 404, false, "Panoramic folder not found.", []);
        }

        responseData(res, "Image Found", 200, true, "", panoramicFolder);
    } catch (err) {
        responseData(res, "", 500, false, "Internal Server Error");
        console.error(err);
    }
};

const deleteImageHierarchy = async (res, img_id, lead_id, project_id, org_id) => {
    try {
        // Find the main document
        const image = await ThreeImage.findOne({
            org_id: org_id,
            img_id: img_id,
            $or: [
                { lead_id: lead_id }, // Try to find by lead_id first
                { project_id: project_id } // If lead_id doesn't exist, find by project_id
            ]
        });

        if (!image) {
            return;
        }

        console.log(`Deleting image: ${image.img_id}`);

        // Delete the current image
        await ThreeImage.deleteOne({
            org_id: org_id,
            img_id: img_id,
            $or: [
                { lead_id: lead_id }, // Try to find by lead_id first
                { project_id: project_id } // If lead_id doesn't exist, find by project_id
            ]
        });

        // Recursively delete related images
        for (const relatedImgId of image.hp) {
            await deleteImageHierarchy(res, relatedImgId, lead_id, project_id, org_id);
        }
    } catch (error) {
        return responseData(res, "", 500, false, "Error while deleting main image");
    }
};


export const deleteMainImage = async (req, res) => {
    try {
        const org_id = req.body.org_id;
        const lead_id = req.body.lead_id;
        const project_id = req.body.project_id;
        const img_id = req.body.img_id;
        const type = req.body.type;

        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }

        if(type === 'hp') {
            const hpImage = await ThreeImage.findOne({
                org_id: org_id,
                img_id: img_id,
                $or: [
                    { lead_id: lead_id }, // Try to find by lead_id first
                    { project_id: project_id } // If lead_id doesn't exist, find by project_id
                ]
            });


            if (!hpImage) {
                responseData(res, "", 404, false, "Hp image not Found", [])
                return;
            }

            const mainImage = await ThreeImage.findOne({
                org_id: org_id,
                img_id: hpImage.main_img_id,
                $or: [
                    { lead_id: lead_id }, // Try to find by lead_id first
                    { project_id: project_id } // If lead_id doesn't exist, find by project_id
                ]
            });

            if (!mainImage) {
                responseData(res, "", 404, false, "Main image not found", [])
                return;
            }

            // Update document by removing removeImgId from hp array
            await ThreeImage.updateOne(
                {
                    org_id: org_id,
                    img_id: hpImage.main_img_id,
                    $or: [
                        { lead_id: lead_id }, // Try to find by lead_id first
                        { project_id: project_id } // If lead_id doesn't exist, find by project_id
                    ]
                },
                { $pull: { hp: img_id } }
            );
        }

        await deleteImageHierarchy(res, img_id, lead_id, project_id, org_id);



        
        responseData(res, "Image deleted Successfully", 200, true, "", []);

    }
    catch (err) {
        responseData(res, "", 500, false, "Internal Server Error", [])
        console.log(err)
    }
}

// export const deleteHpImage = async (req, res) => {
//     try {
//         const org_id = req.body.org_id;
//         const lead_id = req.body.lead_id;
//         const project_id = req.body.project_id;
//         const img_id = req.body.img_id;

//         if (!org_id) {
//             return responseData(res, "", 400, false, "Organization Id is required");
//         }

//         await deleteImageHierarchy(res, img_id, lead_id, project_id, org_id);



        
//         responseData(res, "Image deleted Successfully", 200, true, "", []);

//     }
//     catch (err) {
//         responseData(res, "", 500, false, "Internal Server Error")
//         console.log(err)
//     }
// }
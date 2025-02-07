import roleModel from "../../../models/adminModels/role.model.js";
import orgModel from "../../../models/orgmodels/org.model.js";
import registerModel from "../../../models/usersModels/register.model.js";
import ThreeImage from "../../../models/adminModels/threeImage.model.js";
import { responseData } from "../../../utils/respounse.js";


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
        const name = req.body.name;
        const url = req.body.url;
        const main_imgId = req.body.main_imgId;
        const type = req.body.type;
        const crd = req.body.crd;
        const hp = req.body.hp;

        console.log("hp", hp)

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

        let strImg_id = img_id.toString();

        if (main_imgId) {
            await ThreeImage.findOneAndUpdate(
                { img_id: main_imgId }, // Find by main_imgId
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

export const getImage = async (req, res) => {
    try {
        const org_id = req.query.org_id;
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

        const image = await ThreeImage.aggregate([
            {
              $match: { img_id: img_id },
            },
            {
              $lookup: {
                from: 'threeimages',
                localField: 'hp',
                foreignField: 'img_id',
                as: 'hp',
              },
            },
            {
              $project: {
                img_id: 1,
                name: 1,
                type: 1,
                url: 1,
                crd: 1,
                hp: {
                  img_id: 1,
                  name: 1,
                  url: 1,
                  type: 1,
                  crd: 1,
                  hp: 1,
                },
              },
            },
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
        if (!org_id) {
            return responseData(res, "", 400, false, "Organization Id is required");
        }
        const check_org = await orgModel.findOne({ _id: org_id })
        if (!check_org) {
            return responseData(res, "", 404, false, "Org not found");
        }

        let image = {};

        if(img_id) {
             image = await ThreeImage.aggregate([
                {
                    $match: { org_id, img_id:img_id }
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
                    $match: { type: "main", org_id }
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


        console.log('image', image)
      
          if (!image || image.length === 0) {
            return responseData(res, "Image not found", 400, true, "", []);
          }        

        responseData(res, "Image Found", 200, true, "", image);
    } catch (err) {
        responseData(res, "", 500, false, "Internal Server Error");
        console.error(err);
    }
};




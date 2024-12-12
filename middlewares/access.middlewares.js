import jwt from "jsonwebtoken";
import { responseData } from "../utils/respounse.js";
import registerModel from "../models/usersModels/register.model.js";


//  Lead Access
export const createLeadAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        // Check if the user has access to create a lead
        if (user.role === 'SUPERADMIN') {
            next();
        }
        else if (!user.access?.lead?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create leads");
        }
        else {
            next();
        }



    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const readLeadAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }

        // Check if the user has access to create a lead

        else if (!user.access?.lead?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see leads");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const updateLeadAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.lead?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update leads");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const deleteLeadAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.lead?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update leads");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};


// Project Access

export const createProjectAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead
        else if (!user.access?.project?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create project");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const readProjectAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.project?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see project");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const updateProjectAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.project?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update project");
        }

        else {
            next();
        }

    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const deleteProjectAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.project?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete project");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

//   MOM Access

export const createMomAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead
        else if (!user.access?.mom?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create mom.");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const readMomAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.mom?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see mom");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const updateMomAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.mom?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update mom");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const deleteMomAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.mom?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete mom");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

// Task Access

export const createTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead
        else if (!user.access?.task?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create task");
        }
        else {
            next();
        }

    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const readTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.task?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see task");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const updateTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.task?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update task");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const deleteTskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.task?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete task");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};


// Lead Task Access

export const createLeadTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead
        else if (!user.access?.leadtask?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create task");
        }
        else {
            next();
        }

    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

export const readLeadTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.leadtask?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see task");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

export const updateLeadTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.leadtask?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update task");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

export const deleteLeadTskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.leadtask?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete task");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};


// Open Task Access

export const createOpenTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead
        else if (!user.access?.opentask?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create task");
        }
        else {
            next();
        }

    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

export const readOpenTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.opentask?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see task");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

export const updateOpenTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.opentask?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update task");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

export const deleteOpenTskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.opentask?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete task");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

export const moveOpenTaskAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.opentask?.includes('move')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete task");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};

// Contract Access

export const createContractAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead
        else if (!user.access?.contract?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create contract");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const readContractAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.contract?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see contract");
        }
        else {
            next();
        }

    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const updateContractAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.contract?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update contract");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const deleteContractAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.contract?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete contract");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};


// Quotation Access


export const createQuotationAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead
        else if (!user.access?.quotation?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create quotation");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const readQuotationAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.quotation?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see quotation");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const updateQuotationAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.quotation?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update quotation");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const deleteQuotationAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.quotation?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete delete quotation");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};


// File Manager Access


export const createFileAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead
        else if (!user.access?.file?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to upload file");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const readFileAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.file?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see files and folders");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const updateFileAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.file?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update files");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const deletedFileAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.file?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete files or folders");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};


// Archive Access 

export const readArchiveAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.archive?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see archive");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const restoreArchiveAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.archive?.includes('restore')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to restore archive");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const deleteArchiveAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.archive?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete archive");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};








// ADD Members

export const createAddMember = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.addMember?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to add member");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const GetAddMember = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.addMember?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to  Get add member");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const updateAddMember = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.addMember?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update add member");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const deleteAddMember = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.addMember?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to  delete add member");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}

//  Users Access  

export const CreateUserAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {

            next();

        }

        else if (!user.access?.user?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create user");
        }

        else {
            next();
        }


    }
    catch (err) {
        console.log(err)
        return responseData(res, "", 403, false, "Unauthorized: Invalid token1");
    }
}
export const GetUser = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.user?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to  Get user");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const updateUserRoleAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.user?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update user");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const deleteUserAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.user?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to  delete user");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const GetArchiveUser = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.userArchive?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to  Get user");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const restoreUserAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.userArchive?.includes('restore')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update user");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const deleteArchiveUserAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.userArchive?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to  delete user");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}

// Role  Access
export const CreateRoleAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {

            next();

        }

        else if (!user.access?.role?.includes('create')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to create role");
        }

        else {
            next();
        }


    }
    catch (err) {
        console.log(err)
        return responseData(res, "", 403, false, "Unauthorized: Invalid token1");
    }
}
export const GetRole = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.role?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to  Get roles");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const updateRole = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.role?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update role");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}
export const deleteRole = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }


        else if (!user.access?.role?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to  delete role");
        }
        else {
            next();
        }
    }
    catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
}

//COmpany Data


export const readFileCompanyDataAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }
        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.companyData?.includes('read')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to see files and folders");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const updateFilecompanyDataAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.companyData?.includes('update')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to update files");
        }

        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};
export const deletedFilecompanyDataAccess = async (req, res, next) => {
    try {
        const token = req.cookies?.auth ||
            req.header("Authorization")?.replace("Bearer", "").trim();

        if (!token) {
            return responseData(
                res,
                "",
                403,
                false,
                "Unauthorized: No token provided"
            );
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await registerModel.findById(decodedToken?.id);

        if (!user) {
            return responseData(res, "", 403, false, "Unauthorized: User not found");
        }

        if (user.role === 'SUPERADMIN') {
            next();
        }
        // Check if the user has access to create a lead

        else if (!user.access?.companyData?.includes('delete')) {
            return responseData(res, "", 403, false, "Forbidden: You do not have access to delete files or folders");
        }
        else {
            next();
        }


    } catch (err) {
        return responseData(res, "", 403, false, "Unauthorized: Invalid token");
    }
};











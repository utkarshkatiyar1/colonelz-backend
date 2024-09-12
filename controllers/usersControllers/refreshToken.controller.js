import registerModel from "../../models/usersModels/register.model.js";
import { responseData } from "../../utils/respounse.js";
import Jwt from "jsonwebtoken";

// Generate Access Token
const generateAccessToken = (userId) => {
    return Jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
    return Jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "10d",
    });
};

// Generate both Access and Refresh Tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await registerModel.findById(userId);
        if (!user) throw new Error("User not found");

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Refresh Access Token
export const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return responseData(res, "", 404, false, "Refresh token not found");
    }

    try {
        const decodedToken = Jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await registerModel.findById(decodedToken.id);

        if (!user) {
            return responseData(res, "", 404, false, "User not found");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            return responseData(res, "", 403, false, "Refresh token is incorrect");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
        res.cookie("auth", accessToken, { maxAge: 604800000, httpOnly: true });
        res.cookie("refreshToken", refreshToken, { maxAge: 604800000, httpOnly: true });

        return responseData(res, "Access token refreshed", 200, true, "", {
            token: accessToken,
            refreshToken,
        });

    } catch (error) {
        console.error(error);
        return responseData(res, "", 500, false, "Internal Server Error");
    }
};

import AWS from "aws-sdk";
import dotenv from "dotenv";
import nodemailer from 'nodemailer';
dotenv.config();

export const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    region: 'ap-south-1'
    // endpoint: new AWS.Endpoint(process.env.BUCKET_URL),
    // s3ForcePathStyle: true
});

export const infotransporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.INFO_USER_EMAIL,
        pass: process.env.INFO_APP_PASSWORD,
    },
});


export const checkEmailServer = async (req, res) => {
    try {
        await infotransporter.verify();
        console.log("Info server is ready to take our messages");
    } catch (error) {
        console.error("Error verifying email server:", error);
    }
};
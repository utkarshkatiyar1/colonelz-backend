import AWS from "aws-sdk";
import dotenv from "dotenv";
import nodemailer from 'nodemailer';
dotenv.config();

export const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    endpoint: new AWS.Endpoint(process.env.BUCKET_URL),
    s3ForcePathStyle: true
});

export const infotransporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.INFO_USER_EMAIL,
        pass: process.env.INFO_APP_PASSWORD,
    },
});
export const admintransporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.ADMIN_USER_EMAIL,
        pass: process.env.ADMIN_APP_PASSWORD,
    },
});


export const checkEmailServer = async (req, res) => {
    try {
        await infotransporter.verify();
        console.log("Info server is ready to take our messages");
        await admintransporter.verify();
        console.log("Admin server is ready to take our messages");

    } catch (error) {
        console.error("Error verifying email server:", error);
    }
};

export async function checkS3BucketConnection() {
    try {
        await s3.headBucket({ Bucket: process.env.S3_BUCKET_NAME }).promise();
        console.log(`Bucket "${process.env.S3_BUCKET_NAME}" is accessible.`);
    } catch (error) {
        if (error.code === 'NotFound') {
            console.error(`Bucket "${process.env.S3_BUCKET_NAME}" does not exist.`);
        } else if (error.code === 'Forbidden') {
            console.error(`Access to bucket "${process.env.S3_BUCKET_NAME}" is forbidden. Check permissions.`);
            console.log("Error", error);
        } else if (error.code === 'UnknownEndpoint') {
            console.error(`Invalid region or endpoint for bucket "${process.env.S3_BUCKET_NAME}".`);
        } else {
            console.error(`Error accessing bucket "${process.env.S3_BUCKET_NAME}":`, error.message);
        }
    }
}



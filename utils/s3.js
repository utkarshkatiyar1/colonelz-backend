import AWS from "aws-sdk";

export const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    // endpoint: new AWS.Endpoint(process.env.BUCKET_URL),
    // s3ForcePathStyle: true
});
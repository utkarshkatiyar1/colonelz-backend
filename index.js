import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import path from "path";
import requestIp from "request-ip";
import { rateLimit } from "express-rate-limit";
import fileUpload from "express-fileupload";
import adminRoutes from "./routes/adminRoutes/adminroutes.js";
import { fileURLToPath } from "url";
import usersRouter from "./routes/usersRoutes/users.route.js";
import nodemailer from "nodemailer";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

dotenv.config({
  path: "./.env",
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

mongoose.set("strictQuery", true);
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongodb");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected");
});



async function checkSMTPConnection(config) {
  let transporter = nodemailer.createTransport(config);

  try {
    // Verify the connection configuration
    await transporter.verify();
    console.log('Connection to SMTP server is successful!');
  } catch (error) {
    console.error('Error connecting to SMTP server:', error);
  }
}

// Check the SMTP connection



const smtpConfig = {
  host: "smtp.gmail.com",  // Replace with your SMTP server's address
  port: 587,          // Replace with the correct port
  secure: false,      // true for 465, false for other ports
  auth: {
    user: "a72302492@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
};

const httpServer = createServer(app);

app.use(cors());


app.use(requestIp.mw());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);


//*********/ write all routes here *********
app.use("/v1/api/admin", adminRoutes);
app.use("/v1/api/users", usersRouter);


httpServer.listen(8000, () => {
  connect();
  checkSMTPConnection(smtpConfig);
  console.log("Connected to backend");
});

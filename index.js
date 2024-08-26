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
import session from "express-session";
import expressWinston from "express-winston"
import winston, { format } from "winston";

dotenv.config();

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

// Session configuration
app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: secure should be true in production with HTTPS
}));

const server = createServer(app);

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


const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.USER_NAME,
    pass: process.env.API_KEY,
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log(success)
    console.log("Server is ready to take our messages");
  }
});
app.use(cors());

app.use(requestIp.mw());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.clientIp;
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${options.max} requests per ${options.windowMs / 60000} minutes`
    );
  },
});

app.use(limiter);


const tableFormat = format.printf(({ level, message, meta }) => {
  const req = meta.req;
  const res = meta.res;

  return `
    ------------------------------------------------------------------------
    | Level: ${level} | Method: ${req.method} | Status: ${res.statusCode} |
    ------------------------------------------------------------------------
    | URL: ${req.originalUrl} |Query: ${JSON.stringify(req.query)} |
    ------------------------------------------------------------------------
    | Response Time: ${meta.responseTime}ms |
    ------------------------------------------------------------------------
    `;
  // ------------------------------------------------------------------------
  //   | Query: ${ JSON.stringify(req.query) } |
  //   ------------------------------------------------------------------------
  //   | Headers: ${ JSON.stringify(req.headers, null, 2) } |
});
const logger = winston.createLogger({
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    tableFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
});


app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true, // Whether to log the metadata about the request (default: true)
  msg: "HTTP {{req.method}} {{req.url}}", // Custom message
  colorize: true, // Colorize the output (default: false)
  expressFormat: false, // Use the default express/morgan style formatting
}));

app.use("/v1/api/admin", adminRoutes);
app.use("/v1/api/users", usersRouter);

server.listen(8000, async () => {
  await connect();
  console.log("Connected to backend");
});



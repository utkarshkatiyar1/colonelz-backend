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
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

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

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Monitor connection status
  socket.on("checkConnection", (callback) => {
    if (socket.connected) {
      callback({ connected: true });
    } else {
      callback({ connected: false });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use(bodyParser.json());
app.use(express.json());
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors());
app.use(requestIp.mw());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => req.clientIp,
  handler: (_, __, ___, options) => {
    throw new Error(
      `There are too many requests. You are only allowed ${options.max} requests per ${options.windowMs / 60000} minutes`
    );
  },
});

app.use(limiter);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/v1/api/admin", adminRoutes);
app.use("/v1/api/users", usersRouter);

async function checkSMTPConnection(config) {
  let transporter = nodemailer.createTransport(config);

  try {
    await transporter.verify();
    console.log('Connection to SMTP server is successful!');
  } catch (error) {
    console.error('Error connecting to SMTP server:', error);
  }
}

const smtpConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  logger: true,
  auth: {
    user: "a72302492@gmail.com",
    pass: process.env.APP_PASSWORD,
  },
  debug: true,
};

server.listen(8000, async () => {
  await connect();
  await checkSMTPConnection(smtpConfig);
  console.log("Connected to backend");
});

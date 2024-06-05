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
// import { HttpsProxyAgent } from "https-proxy-agent";

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

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  },
  methods: ["GET", "POST"]
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

const userSessions = {}; // Track active sessions per user

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("login", async (userId) => {
    if (!userSessions[userId]) {
      userSessions[userId] = [];
    }

    // Limit to 5 active sessions
    if (userSessions[userId].length >= 5) {
      const oldestSession = userSessions[userId].shift();
      io.to(oldestSession).emit("loggedOut", { message: "You have been logged out due to multiple logins." });
    }

    userSessions[userId].push(socket.id);
    socket.userId = userId;
    console.log(`User ${userId} logged in. Active sessions: ${userSessions[userId].length}`);
  });

  socket.on("disconnect", () => {
    if (socket.userId && userSessions[socket.userId]) {
      userSessions[socket.userId] = userSessions[socket.userId].filter(id => id !== socket.id);
      console.log(`User ${socket.userId} disconnected. Active sessions: ${userSessions[socket.userId].length}`);
    }
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

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
      `There are too many requests. You are only allowed ${options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

app.use(limiter);

app.use("/v1/api/admin", adminRoutes);
app.use("/v1/api/users", usersRouter);

server.listen(8000, async () => {
  await connect();
  await checkSMTPConnection(smtpConfig);
  console.log("Connected to backend");
});

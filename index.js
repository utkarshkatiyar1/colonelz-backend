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
import orgRouter from "./routes/orgRoutes/org.routes.js";
import billRouter from "./routes/orgRoutes/bill.routes.js";
import session from "express-session";
import expressWinston from "express-winston";
import winston, { format } from "winston";
import cluster from 'cluster';
import os from 'os';
import setupSwaggerDocs from "./swagger.js";
import { checkEmailServer } from "./utils/function.js";
import { checkS3BucketConnection } from "./utils/function.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(fileUpload());
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

const server = createServer(app);
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
    throw new Error(
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
    | URL: ${req.originalUrl} | Query: ${JSON.stringify(req.query)} |
    ------------------------------------------------------------------------
    | Response Time: ${meta.responseTime}ms |
    ------------------------------------------------------------------------
    `;
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

const corsOptions = {
  origin: process.env.LOGIN_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  // allowedHeaders: ['Content-Type', 'Authorization'], h
};

app.use(cors(corsOptions));
app.use("/v1/api/admin", adminRoutes);
app.use("/v1/api/users", usersRouter);
app.use("/v1/api/org", orgRouter); 
app.use("/v1/api/bill", billRouter);

setupSwaggerDocs(app);

// Clustering logic
if (cluster.isMaster) {
  const numCPUs = os.cpus().length; // Get the number of CPU cores

  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Listen for worker exit events
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Optionally, fork a new worker
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  server.listen(8000, async () => {
    await connect();
    await checkS3BucketConnection();
    await checkEmailServer();
    console.log(`Worker ${process.pid} started and listening on port 8000`);
  });
}

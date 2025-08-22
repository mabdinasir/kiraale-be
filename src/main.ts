import { setupCrons } from '@lib/cron';
import { apiRateLimiter } from '@middleware/rateLimit';
import configureRoutes from '@routes/index';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Express } from 'express';
import helmet from 'helmet';

dotenv.config();

const port = process.env.PORT;
const app: Express = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:8080'];
      // Allow requests with no origin (like mobile apps, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 hours
  }),
);

app.use(apiRateLimiter);

// Body parsing with reasonable limits
app.use(express.json({ limit: '20mb' }));
app.use(bodyParser.json({ limit: '20mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
app.use(cookieParser());

const router = express.Router();
configureRoutes(router);
app.use(router);

app.listen(port, () => {
  setupCrons();
});

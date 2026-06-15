require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

const userRoutes = require('./routes/userRoutes');

// Local dev origins plus any explicit production origins from env (comma-separated)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
    : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no Origin header (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // Allow listed origins and any Netlify deployment (production + deploy-preview/branch URLs)
    if (allowedOrigins.includes(origin) || /\.netlify\.app$/.test(new URL(origin).hostname)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use('/profile', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

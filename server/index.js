const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const { setIo } = require('./socket');
const { verifyApiKey } = require('./middleware/auth');
const { ensureAdminUser } = require('./utils/adminBootstrap');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const frontendOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [frontendOrigin, ...frontendOrigins];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});
io.use(async (socket, next) => {
  const apiKey = socket.handshake.auth?.apiKey || socket.handshake.headers['x-api-key'];
  const ok = await verifyApiKey(apiKey);
  if (!ok) {
    return next(new Error('Unauthorized'));
  }
  return next();
});
setIo(io);
const flagRoutes = require('./routes/flag');
const authRoutes = require('./routes/auth');

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/flags', flagRoutes);

app.get("/health",(req,res)=>{
    res.status(200)
    .json({
        message:"Flag Server is healthy",    
        status:"success"
    })
})

//Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    ensureAdminUser().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Failed to bootstrap admin:', err.message);
    });
  })
  .catch(err => console.log('DB connection error:', err));

  //Server is starting
server.listen(PORT, () => 
  console.log('Server running on port ' + PORT))
;
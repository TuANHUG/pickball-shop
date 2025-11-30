import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import route from './routes/index.route.js';

// App Config
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
    credentials: true
}));
app.use(cookieParser())
connectDB();
connectCloudinary();

// API endpoints
route(app);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})
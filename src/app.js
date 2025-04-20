import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import swotRoutes from './routes/swotRoutes.js';
import mailRoutes from "./routes/mailRoutes.js"; // Adjust if path is different
require('dotenv').config();

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', swotRoutes); 
app.use("/api", mailRoutes); // Ensure the correct base URL is being used

export default app;

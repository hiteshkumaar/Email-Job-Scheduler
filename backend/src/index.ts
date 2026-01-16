import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { setupWorker } from './worker/emailWorker';
import emailRoutes from './routes/emailRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/emails', emailRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.send('Email Scheduler API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Start Worker
    setupWorker();
    console.log('Worker started');
});

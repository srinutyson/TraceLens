import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import router from './routes/Routes.js';
import { startEvalWorker } from './workers/evalWorker.js';
const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors());

app.use('/api', router);

async function startServer() {
    await mongoose.connect('mongodb://localhost:27017/tracelens');

    console.log('MongoDB connected');

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    startEvalWorker();
}

startServer();
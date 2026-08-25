import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import router from './routes/Routes.js';
import authrouter from './routes/authRoutes.js';
import { startEvalWorker } from './workers/evalWorker.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors({
    origin : 'http://localhost:5173',
    credentials:true
}));



async function startServer() {
        if (!process.env.MONGODB_URI) {
          console.error('MONGODB_URI is not set');
          process.exit(1);
        }
      await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected');
    app.use(
         session({
            secret : process.env.SESSION_SECRET_KEY,
            resave : false,
            saveUninitialized : false,
            store : MongoStore.create({
                client : mongoose.connection.getClient()
            }),
            cookie : {
                httpOnly : true ,
                secure : false,
                sameSite : 'lax',
                maxAge : 1000 * 60 * 60 * 24 * 7
            }
         })
    );
     app.use('/api/auth',authrouter);
     app.use('/api', router);

    
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    startEvalWorker();
}


startServer();
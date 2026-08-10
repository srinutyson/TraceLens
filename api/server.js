import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import router from './routes/Routes.js';
const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors());
mongoose.connect('mongodb://localhost:27017/tracelens');

app.use('/api',router);




app.listen(PORT,()=>{
     console.log(`Server runnig on port ${PORT}`)
})
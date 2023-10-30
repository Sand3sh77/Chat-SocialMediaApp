import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { SECRET_STRING } from './connect.js';
import chatRoute from './routes/chatRoute.js';
import messageRoute from './routes/messageRoute.js';

const app = express();
const corsOptions = {
    origin: ['https://safebook.vercel.app', 'http://localhost:5173'],
    optionsSuccessStatus: 200,
}


app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

app.listen(5000, (req, res) => {
    console.log("Server running on port 5000");
})

mongoose.connect(SECRET_STRING)
    .then(() => console.log("MongoDB connection established"))
    .catch((error) => console.log("MongoDB connection failed :", error.message))

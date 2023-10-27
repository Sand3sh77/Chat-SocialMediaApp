import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { SECRET_STRING } from './connect.js';
import chatRoute from './routes/chatRoute.js';
import messageRoute from './routes/messageRoute.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

app.listen(5000, (req, res) => {
    console.log("Server running on port 5000");
})

mongoose.connect(SECRET_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB connection established"))
    .catch((error) => console.error("MongoDB connection failed :", error.message))
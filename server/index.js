import express from 'express';
import cors from 'cors';
import { Server } from "socket.io";
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

mongoose.connect(SECRET_STRING)
    .then(() => console.log("MongoDB connection established"))
    .catch((error) => console.log("MongoDB connection failed :", error.message))


// SOCKET SETUP

const io = new Server({ cors: "http://localhost:5173", cors: "https://safebook.vercel.app/" });

let onlineUsers = [];

io.on("connection", (socket) => {
    console.log("New connection", socket.id);

    socket.on("addNewUser", (userId) => {
        !onlineUsers.some(user => user.userId === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id
            })
        // console.log("onlineUsers", onlineUsers);

        io.emit("getOnlineUsers", onlineUsers);
    })

    // add message
    socket.on("sendMessage", (message) => {
        const user = onlineUsers.find((user) => user.userId == message.recepientId);
        if (user) {
            io.to(user.socketId).emit("getMessage", message);
        }
    })

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);

        io.emit("getOnlineUsers", onlineUsers);
    })
});


io.listen(3000);
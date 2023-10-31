import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const io = new Server({
    cors: {
        origin: ["http://localhost:5173", "https://safebook.vercel.app", "https://admin.socket.io"],
        credentials: true
    }
});

instrument(io, {
    auth: false
});

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
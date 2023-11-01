import pool from "../connect.js";
import chatModel from "../models/chatModel.js";
import messageModel from "../models/messageModel.js";

export const createChat = async (req, res) => {
    const { firstId, secondId } = req.body;

    try {
        const chat = await chatModel.findOne({
            members: { $all: [+firstId, +secondId] }
        })
        if (chat) return res.status(200).json(chat);

        const newChat = new chatModel({
            members: [+firstId, +secondId]
        })

        const response = await newChat.save();

        res.status(200).json(response);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json(error);
    }
}

export const findUserChats = async (req, res) => {
    const userId = req.params.userId;

    try {
        const chats = await chatModel.find({
            members: { $in: [+userId] }
        }).sort({ updatedAt: -1 });

        let id = [];
        let chatIds = [];

        if (chats) {

            for (let i = 0; i < chats.length; i++) {
                for (let j = 0; j < 2; j++) {
                    if (chats[i].members[j] != userId) {
                        id.push(chats[i].members[j]);
                    }
                }
                chatIds.push(chats[i]._id);
            }
            if (id.length > 0) {
                let resp = [];

                // TO GET THE LAST MESSAGE
                const latestMessages = await Promise.all(chatIds.map(async (chatId) => {
                    const latestMessage = await messageModel.findOne({
                        chatId: chatId
                    }).sort({ updatedAt: -1 });
                    return latestMessage;
                }));

                const q = "SELECT name,profilePic,id FROM users WHERE id IN (?) ORDER BY FIELD(id, ?)";
                pool.query(q, [id, id], (err, data) => {
                    if (err) return res.json(err);


                    for (let i = 0; i < data.length; i++) {
                        resp.push({
                            chat: chats[i],
                            latestMessage: latestMessages[i],
                            user_data: data[i]
                        });
                    }

                    resp.sort((a, b) => {
                        const aTime = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(a.chat.createdAt);
                        const bTime = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(b.chat.createdAt);
                        return bTime - aTime;
                    });

                    const query = "SELECT DISTINCT u.name, u.profilePic, u.id FROM users u INNER JOIN relationships r ON u.id=r.followedUserId WHERE r.followerUserId=(?) AND r.followedUserId NOT IN (?);";
                    pool.query(query, [userId, id], (err, data) => {
                        if (err) return res.json(err);

                        let final_resp = { message: "Chats obtained successfully", resp, suggestedChatUsers: data }
                        return res.status(200).json(final_resp);
                    });
                });
            } else {
                const query = "SELECT DISTINCT u.name, u.profilePic, u.id FROM users u INNER JOIN relationships r ON u.id=r.followedUserId WHERE r.followerUserId=(?);";
                pool.query(query, [userId], (err, data) => {
                    if (err) return res.json(err);

                    let final_resp = { message: "Chats obtained successfully", resp: [], suggestedChatUsers: data }
                    return res.status(200).json(final_resp);
                });
            }

        }

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json(error);
    }
}

export const findChat = async (req, res) => {
    const { firstId, secondId } = req.params;
    try {
        const chat = await chatModel.findOne({
            members: { $all: [+firstId, +secondId] }
        })
        const q = "SELECT name,profilePic,id FROM users WHERE id=(?)";
        pool.query(q, [secondId], (err, data) => {
            if (err) return res.json(err);
            const resp = [];
            resp.push({
                chat: chat,
                recepient_data: data
            });
            return res.status(200).json(resp);
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json(error);
    }
}
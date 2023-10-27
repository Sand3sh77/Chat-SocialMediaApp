import { db } from "../connect.js";
import chatModel from "../models/chatModel.js";

export const createChat = async (req, res) => {
    const { firstId, secondId } = req.body;

    try {
        const chat = await chatModel.findOne({
            members: { $all: [firstId, secondId] }
        })
        if (chat) return res.status(200).json(chat);

        const newChat = new chatModel({
            members: [firstId, secondId]
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

        if (chats) {
            for (let i = 0; i < chats.length; i++) {
                for (let j = 0; j < 2; j++) {
                    if (chats[i].members[j] != userId) {
                        id.push(chats[i].members[j]);
                    }
                }
            }

            const q = "SELECT name,profilePic,id FROM users WHERE id IN (?) ORDER BY FIELD(id, ?)";
            db.query(q, [id, id], (err, data) => {
                if (err) return res.json(err);

                let resp = [];

                for (let i = 0; i < data.length; i++) {
                    resp.push({
                        chat: chats[i],
                        user_data: data[i]
                    });
                }
                const query = "SELECT DISTINCT u.name, u.profilePic, u.id FROM users u INNER JOIN relationships r ON u.id=r.followedUserId WHERE r.followerUserId=(?) AND r.followedUserId NOT IN (?);";

                db.query(query, [userId, id], (err, data) => {
                    if (err) return res.json(err);

                    let final_resp = { message: "Chats obtained successfully", resp, suggestedChatUsers: data }
                    return res.status(200).json(final_resp);
                });
                return;
            });
            return;
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json(error);
    }
}


export const findChat = async (req, res) => {
    const { firstId, secondId } = req.params;
    try {
        const chat = await chatModel.findOne({
            members: { $all: [firstId, secondId] }
        })

        res.status(200).json(chat);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json(error);
    }
}
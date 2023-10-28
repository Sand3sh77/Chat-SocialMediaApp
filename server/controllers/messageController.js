import messageModel from "../models/messageModel.js";

export const createMessage = async (req, res) => {
    const { chatId, senderId, text } = req.body;

    try {
        if (text != "") {

            const message = new messageModel({
                chatId, senderId, text
            })
            const response = await message.save();
            return res.status(200).json(response);
        }
        else {
            res.status(201).json({ message: "Message cannot be empty" });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json(error);
    }
};
export const getMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await messageModel.find({ chatId }).sort({ updatedAt: -1 });

        res.status(200).json(messages);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json(error);
    }
};
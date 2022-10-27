const Message = require("../models/Message");

class MessageController {
    //[PUT] /api/message/all-message
    async allMessage(req, res) {
        try {
            const messages = await Message.find({
                members: { $in: req.userId },
            })
                .populate("members", "-password")
                .sort({ updatedAt: -1 });

            res.json({
                success: true,
                messages: messages,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: "Server error",
            });
        }
    }

    //[PUT] /api/message/user-message/:id
    async userMessage(req, res) {
        try {
            const messages = await Message.find({
                members: { $all: [req.userId, req.params.id] },
            }).populate("members", "-password");

            res.json({
                success: true,
                messages: messages,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: "Server error",
            });
        }
    }

    //[PUT] /api/message/send-message
    async sendMessage(req, res) {
        try {
            const { messagesId, receiveId, text, image } = req.body;
            // Check data
            if (!text && !image) {
                return res.status(400).json({
                    success: false,
                    msg: "Text and image is required",
                });
            }
            if (!receiveId) {
                return res.status(400).json({
                    success: false,
                    msg: "Something went wrong!Try again!",
                });
            }

            let data = {
                sendBy: req.userId,
            };
            if (text) {
                data.text = text;
            }
            if (image) {
                data.image = image;
            }

            let messages;
            if (!!messagesId) {
                messages = await Message.findOneAndUpdate(
                    { _id: messagesId },
                    {
                        $addToSet: { content: data },
                    },
                    {
                        new: true,
                    }
                ).populate("members", "-password");
                // message = "có message"
            } else {
                messages = await Message.create({
                    members: [...receiveId, req.userId].sort(),
                    content: data,
                });

                messages = await Message.findById(messages._id).populate(
                    "members",
                    "-password"
                );
            }

            res.json({
                success: true,
                messages: messages,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: "Server error",
            });
        }
    }
}

module.exports = new MessageController();

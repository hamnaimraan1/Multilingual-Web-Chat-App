import convModel from "../Models/convModel.js";
import User from "../Models/userModel.js";

const getConv = async (userId) => {
  if (!userId) return [];

  const userCon = await convModel.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .populate("original_messages")
    .populate("sender")
    .populate("receiver")
    .sort({ updatedAt: -1 });

  const convo = userCon.map((conv) => {
    const countUnseen = conv.original_messages.reduce((prev, msg) => {
      const msgByID = msg.msgByUser.toString();
      return msgByID !== userId && !msg.seen ? prev + 1 : prev;
    }, 0);

    return {
      _id: conv._id,
      sender: conv.sender,
      receiver: conv.receiver,
      unseen: countUnseen,
    };
  });

  return convo;
};

export default getConv;

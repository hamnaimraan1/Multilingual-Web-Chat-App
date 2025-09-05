import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { GetSocket } from "../utils/Sockets";
import { useLocalStorage } from "@mantine/hooks";

const MessagePage = () => {
  const { id: receiverId } = useParams();
  const socket = GetSocket();
  const [user] = useLocalStorage({ key: "userData", defaultValue: {} });
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (socket && user?._id && receiverId) {
      socket.emit("msgPage", receiverId);

      socket.on("message", (data) => {
        setMessages(data.original || []);
      });
    }

    return () => {
      if (socket) {
        socket.off("message");
      }
    };
  }, [socket, user, receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    const messageData = {
      sender: user?._id,
      receiver: receiverId,
      messageType: "text",
      text,
    };

    socket.emit("newMsg", messageData);
    setText("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md max-w-xs w-fit ${
              msg.msgByUser === user._id ? "ml-auto bg-blue-500 text-white" : "bg-gray-300 text-black"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t flex">
        <input
          type="text"
          className="flex-1 border px-4 py-2 rounded-l"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-r">
          Send
        </button>
      </div>
    </div>
  );
};

export default MessagePage;

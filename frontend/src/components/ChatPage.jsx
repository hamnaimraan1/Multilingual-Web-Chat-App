import React from "react";
import ChatContainer from "./ChatContainer"; // the UI with messages, input, etc.
import { useParams } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

const ChatPage = () => {
  const { userId } = useParams();

  return (
    <DashboardLayout>
      <ChatContainer chatUserId={userId} />
    </DashboardLayout>
  );
};

export default ChatPage;

// import React from "react";
// import ChatContainer from "./ChatContainer"; // the UI with messages, input, etc.
// import { useParams } from "react-router-dom";
// import DashboardLayout from "./DashboardLayout";

// const ChatPage = () => {
//   const { userId } = useParams();

//   return (
//     <DashboardLayout>
//       <ChatContainer chatUserId={userId} />
//     </DashboardLayout>
//   );
// };

// export default ChatPage;
// src/components/ChatPage.jsx
import React from "react";
import ChatContainer from "./ChatContainer";
import { useParams } from "react-router-dom";

export default function ChatPage() {
  const { userId } = useParams();
  return <ChatContainer chatUserId={userId} />;
}

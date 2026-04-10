import React from "react";

const ChatbotWidget = () => {
  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "#4f46e5",
      color: "white",
      padding: "10px 15px",
      borderRadius: "10px",
      cursor: "pointer"
    }}>
      💬 Chatbot
    </div>
  );
};

export default ChatbotWidget;
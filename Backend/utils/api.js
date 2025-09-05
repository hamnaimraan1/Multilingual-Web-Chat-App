import axios from "axios";

const API_URL = "http://localhost:5000/api"; // apna backend URL

export const deleteChat = async (chatId) => {
  return await axios.delete(`${API_URL}/chats/${chatId}`);
};

export const muteChat = async (chatId) => {
  return await axios.post(`${API_URL}/chats/${chatId}/mute`);
};

export const archiveChat = async (chatId) => {
  return await axios.post(`${API_URL}/chats/${chatId}/archive`);
};

export const blockUser = async (userId) => {
  return await axios.post(`${API_URL}/users/${userId}/block`);
};

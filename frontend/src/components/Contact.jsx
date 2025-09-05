import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocalStorage } from "@mantine/hooks";
import Avatar from "./Avatar";
import { Link } from "react-router-dom";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [user] = useLocalStorage({ key: "userData", defaultValue: {} });

  useEffect(() => {
    const getChats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/conversations`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setContacts(res.data);
      } catch (err) {
        console.error("Error fetching conversations", err);
      }
    };

    getChats();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Your Chats</h2>
      {contacts.map((conv, index) => {
        const other = conv.sender._id === user._id ? conv.receiver : conv.sender;
        return (
          <Link to={`/${other._id}`} key={index} className="flex items-center gap-3 py-2 hover:bg-gray-100 rounded px-2">
            <Avatar imageUrl={other.profilePic} name={other.name} />
            <div>
              <p className="font-semibold">{other.name}</p>
              {conv.unseen > 0 && <p className="text-sm text-red-500">{conv.unseen} unread</p>}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Contacts;

import { useLocalStorage } from "@mantine/hooks";
import { UserCircle } from "lucide-react";
import React from "react";

const Avatar = ({ userId, name, imageUrl }) => {
  const [onlineUser] = useLocalStorage({
    key: "onlineUser",
    defaultValue: [],
  });

  let avatarName = "";

  if (name) {
    const splitName = name.trim().split(" ");
    if (splitName.length > 1) {
      avatarName = splitName[0][0] + splitName[1][0];
    } else {
      avatarName = splitName[0][0];
    }
  }

  const bgColor = [
    "bg-slate-200",
    "bg-teal-200",
    "bg-red-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-gray-200",
    "bg-cyan-200",
    "bg-sky-200",
    "bg-blue-200",
  ];
  const randomNumber = Math.floor(Math.random() * bgColor.length);
  const isOnline = onlineUser?.includes(userId);

  return (
    <div className="relative w-10 h-10">
      {imageUrl ? (
        <img
          src={imageUrl}
          width={40}
          height={40}
          alt={name}
          className="rounded-full object-cover w-10 h-10"
        />
      ) : name ? (
        <div
          className={`rounded-full w-10 h-10 flex justify-center items-center text-sm font-semibold ${bgColor[randomNumber]}`}
        >
          {avatarName}
        </div>
      ) : (
        <UserCircle size={40} />
      )}

      {isOnline && (
        <div className="bg-green-600 w-3 h-3 absolute bottom-0 right-0 z-10 rounded-full border-2 border-white"></div>
      )}
    </div>
  );
};

export default Avatar;

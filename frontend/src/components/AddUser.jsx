import { useLocalStorage } from "@mantine/hooks";
import { Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const AddUser = ({ setOpenSearchUser }) => {
  const [user] = useLocalStorage({
    key: "userData",
    defaultValue: {},
  });

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchUser, setSearchUser] = useState([]);
  const navigate = useNavigate();

  const handleUser = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/searchUser`,
        { searchRes: search },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
            Accept: "application/json",
          },
        }
      );

      const filtered = res?.data?.users?.filter(
        (item) => item?._id !== user?._id
      );
      setSearchUser(filtered);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      handleUser();
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-[#111827] rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Add User</h2>
          <button
            onClick={() => setOpenSearchUser(false)}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-800 m-3 rounded-xl px-3 py-2">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search user..."
            className="flex-1 bg-transparent outline-none px-2 text-white placeholder-gray-400"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* User List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-400 py-6">Searching...</p>
          ) : searchUser.length ? (
            searchUser.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  navigate(`/${item?._id}`);
                  setOpenSearchUser(false); // auto-close modal
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition border-b border-gray-700 text-left"
              >
                {/* Avatar */}
                {item?.profilePic ? (
                  <img
                    src={item.profilePic}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                    {item?.name?.[0]?.toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item?.name}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {item?.email}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUser;

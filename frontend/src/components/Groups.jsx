

import { useEffect, useMemo, useState } from "react";
import http from "../utils/http";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Users, Crown, Trash2, UserPlus, LogOut } from "lucide-react";
import uploadFile from "../utils/uploadFile";
import axios from "axios";

/** ---------- Small UI helpers ---------- **/
const Modal = ({ open, onClose, title, children, footer, z = 50 }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center p-3" style={{ zIndex: z }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#121418] border border-zinc-700 shadow-xl">
        <div className="px-5 py-4 border-b border-zinc-700 flex items-center justify-between">
          <h3 className="text-zinc-100 font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-zinc-700">{footer}</div>}
      </div>
    </div>
  );
};

const Confirm = ({ open, onClose, onConfirm, title, message, danger }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    footer={
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-3 py-1.5 rounded-lg ${
            danger ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"
          } text-white`}
        >
          Confirm
        </button>
      </div>
    }
  >
    <p className="text-zinc-300">{message}</p>
  </Modal>
);

/** ---------- Member search + select ---------- **/
const MemberPicker = ({ open, onClose, onSubmit, excludeIds = [] }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setSelected([]);
  }, [open]);

  const search = async (q) => {
    try {
      const { data } = await http.post("/api/searchUser", { searchRes: q });
      const list = data?.users || [];
      const filtered = list.filter((u) => !excludeIds.includes(u._id));
      setResults(filtered);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to search users");
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      if (query.trim()) search(query.trim());
      else setResults([]);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  const toggle = (u) => {
    setSelected((prev) =>
      prev.find((p) => p._id === u._id) ? prev.filter((p) => p._id !== u._id) : [...prev, u]
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add members"
      z={60}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-zinc-400">{selected.length} selected</div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (!selected.length) return toast.error("Pick at least one member");
                onSubmit(selected);
              }}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500"
            >
              Add
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email"
          className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
        />
        <div className="max-h-72 overflow-y-auto space-y-1">
          {results.map((u) => {
            const isPicked = !!selected.find((s) => s._id === u._id);
            return (
              <button
                key={u._id}
                onClick={() => toggle(u)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${
                  isPicked
                    ? "border-green-600 bg-green-600/10"
                    : "border-zinc-700 hover:bg-zinc-800/40"
                } text-left`}
              >
                <div className="text-zinc-100">
                  <div className="font-medium">{u.name || u.email}</div>
                  <div className="text-xs text-zinc-400">{u.email}</div>
                </div>
                <span className="text-xs text-zinc-400">{isPicked ? "Selected" : "Pick"}</span>
              </button>
            );
          })}
          {!results.length && query && (
            <p className="text-sm text-zinc-500 px-1">No users found.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

/** ---------- Groups main ---------- **/
const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [gName, setGName] = useState("");
  const [gMembers, setGMembers] = useState([]);
  const [gPhoto, setGPhoto] = useState(null);

  // load my groups
  const loadMyGroups = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/api/groups");
      setGroups(data.groups || []);
    } catch {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const openGroup = async (groupId) => {
    try {
      const { data } = await http.get(`/api/groups/${groupId}`);
      setActive(data.group ? { ...data.group, messages: data.messages } : data);
    } catch {
      toast.error("Failed to load group details");
    }
  };

  useEffect(() => {
    loadMyGroups();
  }, []);
const handleCreate = async () => {
  if (!gName.trim()) return toast.error("Group name required");
  if (!gMembers.length) return toast.error("Pick at least one member");

  try {
    let uploadedUrl = "";

    if (gPhoto) {
      const res = await uploadFile(gPhoto);
      uploadedUrl = res.secure_url;
    }

    const payload = {
      name: gName.trim(),
      members: gMembers.map((m) => m._id),
      profilePic: uploadedUrl,
    };

    console.log("Final payload sent to backend:", payload);
console.log("Payload to send:", JSON.stringify(payload, null, 2));

    const { data } = await http.post("/api/groups/create", payload);

    toast.success("Group created successfully");
    setGroups((prev) => [data.group, ...prev]);
    setCreateOpen(false);
    setGName("");
    setGMembers([]);
    setGPhoto(null);
  } catch (e) {
    console.error("Create group error:", e);
    toast.error(e.response?.data?.message || "Create failed");
  }
};


// 
// const handleCreate = async () => {
//   if (!gName.trim()) return toast.error("Group name required");
//   if (!gMembers.length) return toast.error("Pick at least one member");

//   try {
//     let uploadedUrl = "";

//     // If user selected a photo, upload to Cloudinary first
//     if (gPhoto) {
//       const res = await uploadFile(gPhoto);
//       uploadedUrl = res.secure_url; // Cloudinary gives this back
//     }

//     const payload = {
//       name: gName.trim(),
//       members: gMembers.map((m) => m._id),
//       profilePic: uploadedUrl, 
//     };

//     console.log("Final payload sent to backend:", payload);
//     console.log("Token in localStorage:", localStorage.getItem("token"));

//     const token = localStorage.getItem("token");

//   const { data } = await http.post(
//   "/api/groups/create",
//   payload,
//   { withCredentials: true }
// );

//     toast.success("Group created successfully");

//     setGroups((prev) => [data.group, ...prev]);
//     setCreateOpen(false);
//     setGName("");
//     setGMembers([]);
//     setGPhoto(null);
//   } catch (e) {
//     console.error("Create group error:", e);
//     toast.error(e.response?.data?.message || "Create failed");
//   }
// };


  // ---------- Add members ----------
  const doAddMembers = async (picked) => {
    if (!picked.length) return toast("ℹ️ No members selected");
    setGMembers(picked);
    setPickerOpen(false);

    if (active) {
      try {
        const ids = picked.map((p) => p._id);
        await Promise.all(
          ids.map((userId) => http.put("/api/groups/add-member", { groupId: active._id, userId }))
        );
        toast.success("✅ Members added");
        openGroup(active._id);
      } catch (e) {
        toast.error(e.response?.data?.message || "Add failed");
      }
    }
  };

  const removeMember = async (userId) => {
    if (!active) return;
    try {
      await http.put("/api/groups/remove-member", { groupId: active._id, userId });
      toast.success("👋 Member removed");
      openGroup(active._id);
    } catch (e) {
      toast.error(e.response?.data?.message || "Remove failed");
    }
  };

  const makeAdmin = async (userId) => {
    if (!active) return;
    try {
      await http.put("/api/groups/transfer-admin", {
        groupId: active._id,
        newAdminId: userId,
      });
      toast.success("👑 Admin added");
      openGroup(active._id);
    } catch (e) {
      toast.error(e.response?.data?.message || "Add admin failed");
    }
  };

  const leaveGroup = async () => {
    if (!active) return;
    try {
      const { data } = await http.put("/api/groups/leave", { groupId: active._id });
      toast.success(data.message || "🚪 You left the group");
      setGroups((prev) => prev.filter((g) => g._id !== active._id));
      setActive(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Leave failed");
    }
  };

  const deleteGroup = async () => {
    if (!active) return;
    try {
      const { data } = await http.delete("/api/groups/delete", { data: { groupId: active._id } });
      toast.success(data.message || "🗑️ Group deleted");
      setGroups((prev) => prev.filter((g) => g._id !== active._id));
      setActive(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  const myId = useMemo(() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw)?._id : null;
    } catch {
      return null;
    }
  }, []);

  const amAdmin = active && myId && Array.isArray(active.admins) && active.admins.includes(myId);

  const onPickPhoto = (file) => {
    if (!file) return setGPhoto(null);
    const reader = new FileReader();
    reader.onload = () => setGPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen bg-[#0b0d11] text-zinc-100 flex">
      <Toaster position="top-right" />

      {/* LEFT: groups list */}
      <aside className="w-full sm:w-72 border-r border-zinc-800 flex-shrink-0">
        <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-zinc-400" />
            <h2 className="font-semibold">Groups</h2>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm"
          >
            <Plus size={16} /> New
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-56px)]">
          {loading && <p className="p-3 text-zinc-400">Loading…</p>}
          {!loading && !groups.length && <p className="p-3 text-zinc-500">No groups yet</p>}
          {groups.map((g) => (
            <button
              key={g._id}
              onClick={() => {
                setActive(null);
                openGroup(g._id);
              }}
              className={`w-full text-left px-4 py-3 border-b border-zinc-900 hover:bg-zinc-900/60 ${
                active?._id === g._id ? "bg-zinc-900/70" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={g.profilePic || "/group-placeholder.png"}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="font-medium truncate">{g.name}</div>
                </div>
                {Array.isArray(g.admins) && g.admins.includes(myId) && (
                  <Crown size={16} className="text-yellow-500" title="You are admin" />
                )}
              </div>
              <div className="text-xs text-zinc-500">{g.members?.length ?? 0} members</div>
            </button>
          ))}
        </div>
      </aside>

      {/* RIGHT: group details */}
      <main className="flex-1 min-w-0">
        {!active ? (
          <div className="h-full grid place-items-center">
            <div className="text-center">
              <Users className="mx-auto mb-2 text-zinc-600" />
              <p className="text-zinc-400">Select a group to manage</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={active.profilePic || "/group-placeholder.png"}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{active.name}</h2>
                    {amAdmin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-700/40">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Created by {active.createdBy?.name || active.createdBy?.email || "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {amAdmin ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmLeave(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm"
                  >
                    <LogOut size={16} /> Leave
                  </button>
                )}
                {amAdmin && (
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm"
                  >
                    <UserPlus size={16} /> Add
                  </button>
                )}
              </div>
            </div>

            {/* Members */}
            <div className="p-4">
              <h3 className="text-sm text-zinc-400 mb-2">Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {active.members?.map((m) => {
                  const isAdmin = Array.isArray(active.admins) && active.admins.includes(m._id);
                  return (
                    <div key={m._id} className="border border-zinc-800 rounded-xl p-3 bg-[#0e1013]">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{m.name || m.email}</div>
                          <div className="text-xs text-zinc-500">{m.email}</div>
                        </div>
                        {isAdmin && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-700/40"
                            title="Admin"
                          >
                            <Crown size={12} /> Admin
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {amAdmin && !isAdmin && (
                          <>
                            <button
                              onClick={() => makeAdmin(m._id)}
                                                            className="px-2.5 py-1 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-xs"
                            >
                              Make Admin
                            </button>
                            <button
                              onClick={() => removeMember(m._id)}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Create group modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Group"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500"
            >
              Create
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-zinc-300">Group Name</label>
            <input
              value={gName}
              onChange={(e) => setGName(e.target.value)}
              placeholder="Enter group name"
              className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-300">Group Photo</label>
            <input type="file" accept="image/*" onChange={(e) => onPickPhoto(e.target.files[0])} />
            {gPhoto && (
              <img
                src={gPhoto}
                alt="preview"
                className="w-16 h-16 rounded-full object-cover mt-2"
              />
            )}
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-300">Members</label>
            <button
              onClick={() => setPickerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm"
            >
              Pick Members ({gMembers.length})
            </button>
          </div>
        </div>
      </Modal>

      {/* Member picker modal */}
      <MemberPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSubmit={doAddMembers}
        excludeIds={gMembers.map((m) => m._id)}
      />

      {/* Confirm delete modal */}
      <Confirm
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteGroup}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action cannot be undone."
        danger
      />

      {/* Confirm leave modal */}
      <Confirm
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={leaveGroup}
        title="Leave Group"
        message="Are you sure you want to leave this group?"
      />
    </div>
  );
};

export default Groups;



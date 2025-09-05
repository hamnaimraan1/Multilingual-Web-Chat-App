
// import React, { useRef, useState } from "react";
// import FormInput from "./Forminputs";
// import languageOptions from "../utils/languageOptions.js"; // adjust path as needed

// import Avatar from "./Avatar";
// import uploadFile from "../utils/uploadFile";
// import axios from "axios";
// import { toast } from "sonner";

// const EditProfile = ({ setEditProfile, user, setUser }) => {
//   const [edituserData, setEdituserData] = useState({
//     name: user?.name,
//     userID: user?._id,
//     profilePic: user?.profilePic,
//     preferredLanguage: user?.preferredLanguage || "en",
//   });

//   const [imagePreview, setImagePreview] = useState(user?.profilePic);
//   const uploadRef = useRef();

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     try {
//       const res = await axios.put(
//         `${process.env.REACT_APP_BACKEND_URL}/api/updateUser`,
//         edituserData
//       );

//       if (res?.data?.success) {
//         toast.success(res?.data?.message);
//         setUser({ ...res?.data?.user, token: user?.token });
//         setEditProfile(false);
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Something went wrong");
//     }
//   };

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setEdituserData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleUpload = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     try {
//       const uploadImage = await uploadFile(file);
//       if (uploadImage?.url) {
//         setEdituserData((prev) => ({
//           ...prev,
//           profilePic: uploadImage.url,
//         }));
//         setImagePreview(uploadImage.url);
//       }
//     } catch (err) {
//       toast.error("Image upload failed");
//     }
//   };

//   const handleOpenUploadPhoto = (event) => {
//     event.preventDefault();
//     uploadRef.current.click();
//   };

//   return (
//     <div className="fixed inset-0 z-10 bg-black bg-opacity-70 flex items-center justify-center p-4">
//       <div className="bg-secondary text-white rounded-xl p-6 w-full max-w-md shadow-2xl">
//         <h2 className="font-bold text-xl mb-1">Edit Profile</h2>
//         <p className="text-sm text-gray-400">Update your profile details</p>

//         <form onSubmit={handleSubmit} className="grid gap-4 mt-4">
//           <FormInput
//             label="Name"
//             name="name"
//             type="text"
//             value={edituserData.name}
//             onChange={handleChange}
//             placeholder="Your name"
//             className="bg-transparent text-white border-gray-500"
//           />

//           <div>
//             <h3 className="font-medium mb-2">Profile Picture</h3>
//             <div className="flex items-center gap-3">
//               <Avatar imageUrl={imagePreview} name={edituserData.name} />
//               <button
//                 className="text-blue-400 text-sm underline"
//                 onClick={handleOpenUploadPhoto}
//               >
//                 Change Picture
//               </button>
//               <input
//                 type="file"
//                 ref={uploadRef}
//                 onChange={handleUpload}
//                 className="hidden"
//               />
//             </div>
//           </div>

//           <div>
//             <label htmlFor="preferredLanguage" className="block mb-1 text-sm text-gray-300">
//               Preferred Language
//             </label>
//            <select
//   name="preferredLanguage"
//   id="preferredLanguage"
//   value={edituserData.preferredLanguage}
//   onChange={handleChange}
//   className="..."
// >
//   {Object.entries(languageOptions).map(([code, label]) => (
//     <option key={code} value={code}>
//       {label}
//     </option>
//   ))}
// </select>
//           </div>

//           <div className="flex justify-between mt-2">
//             <button
//               type="button"
//               onClick={() => setEditProfile(false)}
//               className="text-gray-300 border border-gray-600 px-4 py-1 rounded hover:bg-gray-700"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
//             >
//               Save
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditProfile;
import React, { useEffect, useRef, useState } from "react";
import FormInput from "./Forminputs";
import languageOptions from "../utils/languageOptions";
import Avatar from "./Avatar";
import uploadFile from "../utils/uploadFile";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

const EditProfile = ({ setEditProfile, user, setUser }) => {
  const [edituserData, setEdituserData] = useState({
    name: user?.name || "",
    userID: user?._id,
    profilePic: user?.profilePic || "",
    preferredLanguage: user?.preferredLanguage || "en",
  });

  const [imagePreview, setImagePreview] = useState(user?.profilePic || "");
  const [saving, setSaving] = useState(false);
  const uploadRef = useRef(null);
  const firstFocusableRef = useRef(null);

  // focus first control on open
  useEffect(() => {
    firstFocusableRef.current?.focus();
    const onEsc = (e) => e.key === "Escape" && setEditProfile(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [setEditProfile]);

  const dirty =
    (edituserData.name || "") !== (user?.name || "") ||
    (edituserData.profilePic || "") !== (user?.profilePic || "") ||
    (edituserData.preferredLanguage || "en") !== (user?.preferredLanguage || "en");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dirty || saving) return;
    if (!edituserData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      setSaving(true);
      const { data } = await axios.put(`${API_BASE}/api/updateUser`, edituserData);
      if (data?.success && data?.user) {
        toast.success(data?.message || "Profile updated");
        // preserve token
        setUser({ ...data.user, token: user?.token });
        setEditProfile(false);
      } else {
        throw new Error(data?.message || "Update failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEdituserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (!file.type?.startsWith("image/")) {
        toast.error("Please choose an image file");
        return;
      }
      const t = toast.loading("Uploading image…");
      const uploaded = await uploadFile(file);
      toast.dismiss(t);

      const url = uploaded?.secure_url || uploaded?.url;
      if (!url) throw new Error("Upload failed");

      setEdituserData((prev) => ({ ...prev, profilePic: url }));
      setImagePreview(url);
      toast.success("Image ready");
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      // reset input so the same file can be chosen again
      if (uploadRef.current) uploadRef.current.value = "";
    }
  };

  const handleOpenUploadPhoto = (e) => {
    e.preventDefault();
    uploadRef.current?.click();
  };

  const removePhoto = (e) => {
    e.preventDefault();
    setImagePreview("");
    setEdituserData((p) => ({ ...p, profilePic: "" }));
  };

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => setEditProfile(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[#121418] border border-zinc-700 text-zinc-100 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <p className="text-sm text-zinc-400 mt-1">Update your profile details</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Name */}
          <FormInput
            ref={firstFocusableRef}
            label="Name"
            name="name"
            type="text"
            value={edituserData.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
          />

          {/* Profile picture */}
          <div>
            <h3 className="font-medium mb-2 text-zinc-200">Profile Picture</h3>
            <div className="flex items-center gap-3">
              <Avatar imageUrl={imagePreview} name={edituserData.name} />
              <div className="flex items-center gap-3">
                <button
                  className="text-emerald-400 text-sm underline hover:text-emerald-300"
                  onClick={handleOpenUploadPhoto}
                  type="button"
                >
                  Change Picture
                </button>
                {imagePreview ? (
                  <button
                    className="text-zinc-400 text-sm underline hover:text-zinc-300"
                    onClick={removePhoto}
                    type="button"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                type="file"
                ref={uploadRef}
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Preferred language */}
          <div>
            <label
              htmlFor="preferredLanguage"
              className="block mb-1 text-sm text-zinc-300"
            >
              Preferred Language
            </label>
            <select
              name="preferredLanguage"
              id="preferredLanguage"
              value={edituserData.preferredLanguage}
              onChange={handleChange}
              className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
            >
              {Object.entries(languageOptions).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-zinc-500">
              We’ll use this to auto-translate incoming messages for you.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 border-t border-zinc-700 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setEditProfile(false)}
            className="px-4 py-2 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!dirty || saving || !edituserData.name.trim()}
            className={`px-4 py-2 rounded-lg text-white ${
              !dirty || saving || !edituserData.name.trim()
                ? "bg-blue-900 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

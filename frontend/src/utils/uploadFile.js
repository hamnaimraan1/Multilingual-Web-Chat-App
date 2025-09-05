// // const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_NAME}/auto/upload`;

// // const uploadFile = async (file) => {
// //   const formData = new FormData();
// //   formData.append("file", file);
// //   formData.append("upload_preset", "chat-app");

// //   const response = await fetch(url, {
// //     method: "post",
// //     body: formData,
// //   });

// //   const res = await response.json();
// //   return res;
// // };

// // export default uploadFile;
// // utils/uploadFile.js
// const cloud = process.env.REACT_APP_CLOUDINARY_NAME;
// const PRESET = "chat-app"; // make sure this preset has Use filename=ON, Unique filename=OFF

// const resourceFromFile = (file) => {
//   const t = file?.type || "";
//   if (t.startsWith("image/")) return "image";
//   if (t.startsWith("video/")) return "video";
//   if (t.startsWith("audio/")) return "video"; // audio is stored under 'video' in Cloudinary
//   return "raw"; // PDFs, DOCX, XLSX, zips, etc.
// };

// const baseName = (name = "") => name.replace(/\.[^/.]+$/, ""); // strip extension

// const uploadFile = async (file) => {
//   const resource = resourceFromFile(file);
//   const url = `https://api.cloudinary.com/v1_1/${cloud}/${resource}/upload`;

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", PRESET);

//   // tell Cloudinary to keep the original file name
//   formData.append("use_filename", "true");
//   formData.append("unique_filename", "false");
//   formData.append("public_id", baseName(file.name)); // URL will end with this name

//   // optional: keep docs in a folder
//   if (resource === "raw") formData.append("folder", "chat/docs");

//   const response = await fetch(url, { method: "POST", body: formData });
//   if (!response.ok) throw new Error("Cloudinary upload failed");
//   const res = await response.json(); // has secure_url, original_filename, format, bytes, public_id
//   return res;
// };

// export default uploadFile;
// src/utils/uploadFile.js
const uploadFile = async (file, opts = {}) => {
  const cloud = process.env.REACT_APP_CLOUDINARY_NAME;
  const preset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "chat-app";
  if (!cloud) throw new Error("Missing REACT_APP_CLOUDINARY_NAME");

  // If it's a document, always use resource_type=raw. Otherwise use auto.
  const isDoc = /\.(pdf|docx?|pptx?|xlsx?|csv|txt)$/i.test(file?.name || "");
  const resourceType = opts.resourceType || (isDoc ? "raw" : "auto"); // <-- key line

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`,
    { method: "POST", body: fd }
  );

  const data = await res.json();
  if (!res.ok || !data?.secure_url) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }

  return {
    url: data.secure_url,
    secure_url: data.secure_url,
    bytes: data.bytes,
    public_id: data.public_id,
    resource_type: data.resource_type,
    format: data.format,
  };
};

export default uploadFile;

const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_NAME}/image/upload`;

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "crossping"); 

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  console.log("Cloudinary Name:", process.env.REACT_APP_CLOUDINARY_NAME);

  const res = await response.json();
  return res;

};

export default uploadFile;

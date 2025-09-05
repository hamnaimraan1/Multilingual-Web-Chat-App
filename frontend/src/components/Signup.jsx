// import React, { useState } from "react";
// import { UserCircle } from "lucide-react";
// import Forminputs from "./Forminputs";
// import SubmitButton from "./SubmitButton";
// import { Link, useNavigate } from "react-router-dom";
// import { X } from "lucide-react";
// import uploadFile from "../utils/uploadFile";
// import axios from "axios";
// import { toast } from "sonner";
// const Signup = () => {
//   const navigate = useNavigate();
//   const [RegisterData, setRegisterData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     profilePic: "",
//   });
//   const [uploadImg, setUploadImg] = useState("");
  

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setRegisterData((prev) => {
//       return {
//         ...prev,
//         [name]: value,
//       };
//     });
//   };

//   const handleClearPhoto = (event) => {
//     event.preventDefault();
//     setUploadImg(null);
//   };

//   // const handleUpload = async (event) => {
//   //   const file = event.target.files?.[0];

//   //   const uploadImage = await uploadFile(file);
//   //   setUploadImg(file);
//   //   console.log(uploadImage, "image");

//   //   setRegisterData((prev) => {
//   //     return {
//   //       ...prev,
//   //       profilePic: uploadImage?.url,
//   //     };
//   //   });
//   // };
//   const handleUpload = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;
  
//     try {
//       const uploadImage = await uploadFile(file);
  
//       if (uploadImage?.url) {
//         // Save Cloudinary response
//         setUploadImg(uploadImage);
  
//         // Save URL to register form
//         setRegisterData((prev) => ({
//           ...prev,
//           profilePic: uploadImage.url,
//         }));
  
//         //  Show toast with file name
//         toast.success(`Uploaded: ${file.name}`);
//       } else {
//         toast.error("Image upload failed");
//       }
//     } catch (error) {
//       console.error("Cloudinary Upload Error:", error);
//       toast.error("Something went wrong during image upload");
//     }
//   };
  
  

//   // const handleSubmit = async (event) => {
//   //   event.preventDefault();
//   //   event?.stopPropagation();

//   //   try {
//   //       const res = await axios.post(
//   //           `${process.env.REACT_APP_BACKEND_URL}/api/register`, 
//   //           RegisterData
//   //         );
          
//   //     if (res.data.success) {
//   //       toast.success(res?.data?.message);
//   //       navigate("/login");
//   //     }
//   //   } catch (error) {
//   //     toast.error(error.response?.data?.message);
//   //   }
//   // };
//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     event.stopPropagation();
  
//     // if (!RegisterData.name || !RegisterData.email || !RegisterData.password) {
//     //   toast.error("Please fill in all required fields");
//     //   return;
//     // }
  
//     // try {
//     //   const res = await axios.post(
//     //     `${process.env.REACT_APP_BACKEND_URL}/api/register`,
//     //     RegisterData
//     //   );
  
//     //   if (res.data.success) {
//     //     toast.success(res.data.message);
//     //     navigate("/login");
//     //   }
//     // } catch (error) {
//     //   toast.error(error.response?.data?.message || "Signup failed");
//     // }
//     if (!RegisterData.name || !RegisterData.email || !RegisterData.password) {
//       toast.error("Please fill in all the required fields.");
//       return;
//     }
    
//     try {
//       const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/register`, RegisterData);
    
//       if (res.data.success) {
//         toast.success("Account created successfully! Please log in.");
//         navigate("/login");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Something went wrong during signup.");
//     }
    
//   };
  
//   return (
//     <div className="grid place-content-center h-screen">
//       <div className="bg-white w-96 rounded p-5 shadow-md">
//         <div className="w-fit mx-auto mb-2">
//           <UserCircle size={80} />
//         </div>

//         <h3 className="mt-3 text-center">Welcome to CrossPing</h3>

//         <form onSubmit={handleSubmit} className="grid gap-4 mt-3">
//           <Forminputs
//             label="Name"
//             name="name"
//             type="text"
//             value={RegisterData?.name}
//             placeholder="Enter the name"
//             onChange={handleChange}
//           />
//           <Forminputs
//             label="Email"
//             name="email"
//             type="email"
//             value={RegisterData?.email}
//             placeholder="Enter the email"
//             onChange={handleChange}
//           />
//           <Forminputs
//             label="Password"
//             name="password"
//             type="password"
//             value={RegisterData?.password}
//             placeholder="Enter the password"
//             onChange={handleChange}
//           />
//           <div>
//             <label htmlFor="profilePic">
//               Profile Picture:
//               <div className="h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-primary">
//                 <p className="text-sm mx-w-[300px] text-ellipsis line-clamp-1">
//                   {uploadImg?.name || "upload profile photo"}
//                 </p>
//                 {uploadImg?.name && (
//                   <button
//                     className="text-lg ml-2 hover:text-red-600"
//                     onClick={handleClearPhoto}
//                   >
//                     <X />
//                   </button>
//                 )}
//               </div>
//             </label>

//             <input
//               type="file"
//               id="profilePic"
//               name="profilePic"
//               className="bg-slate-100 px-2 py-1 focus:outline-none hidden"
//               onChange={handleUpload}
//             />
//           </div>
//           <SubmitButton>Submit</SubmitButton>
//         </form>
//        <p className="mt-3 text-center">
//                 Already have an account?{" "}
//                 <Link to="/login" className="text-blue-600">
//                   Login
//                 </Link>
//               </p>
//       </div>
//     </div>
//   );
// };

// export default Signup;
import React, { useState } from "react";
import { UserCircle, X } from "lucide-react";
import Forminputs from "./Forminputs";
import SubmitButton from "./SubmitButton";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../utils/uploadFile";
import axios from "axios";
import { toast } from "sonner";
import { useLocalStorage } from "@mantine/hooks";

const Signup = () => {
  const navigate = useNavigate();
  const [, setUser] = useLocalStorage({
    key: "userData",
    defaultValue: {},
  });

  const [RegisterData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    profilePic: "",
    preferredLanguage: "en", // Default language
  });

  const [uploadImg, setUploadImg] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearPhoto = (event) => {
    event.preventDefault();
    setUploadImg(null);
    setRegisterData((prev) => ({ ...prev, profilePic: "" }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploadImage = await uploadFile(file);

      if (uploadImage?.url) {
        setUploadImg(uploadImage);
        setRegisterData((prev) => ({
          ...prev,
          profilePic: uploadImage.url,
        }));
        toast.success(`Uploaded: ${file.name}`);
      } else {
        toast.error("Image upload failed");
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      toast.error("Something went wrong during image upload");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!RegisterData.name || !RegisterData.email || !RegisterData.password) {
      toast.error("Please fill in all the required fields.");
      return;
    }
console.log("📦 Sending RegisterData:", RegisterData);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/register`,
        RegisterData
      );

      if (res.data.success) {
        toast.success("Account created successfully!");
        // Save user + token in localStorage
        const { user, token } = res.data;
        setUser({ ...user, token });
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong during signup.");
    }
  };

  return (
    <div className="grid place-content-center h-screen">
      <div className="bg-white w-96 rounded p-5 shadow-md">
        <div className="w-fit mx-auto mb-2">
          <UserCircle size={80} />
        </div>

        <h3 className="mt-3 text-center">Welcome to CrossPing</h3>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-3">
          <Forminputs
            label="Name"
            name="name"
            type="text"
            value={RegisterData.name}
            placeholder="Enter the name"
            onChange={handleChange}
          />
          <Forminputs
            label="Email"
            name="email"
            type="email"
            value={RegisterData.email}
            placeholder="Enter the email"
            onChange={handleChange}
          />
          <Forminputs
            label="Password"
            name="password"
            type="password"
            value={RegisterData.password}
            placeholder="Enter the password"
            onChange={handleChange}
          />

          <div>
            <label htmlFor="profilePic">
              Profile Picture:
              <div className="h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-primary cursor-pointer">
                {uploadImg?.url ? (
                  <img
                    src={uploadImg.url}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <p className="text-sm max-w-[300px] text-ellipsis line-clamp-1">
                    Upload profile photo
                  </p>
                )}

                {uploadImg?.url && (
                  <button
                    className="text-lg ml-2 hover:text-red-600"
                    onClick={handleClearPhoto}
                  >
                    <X />
                  </button>
                )}
              </div>
            </label>

            <input
              type="file"
              id="profilePic"
              name="profilePic"
              className="hidden"
              onChange={handleUpload}
            />
          </div>

          <div>
            <label
              htmlFor="preferredLanguage"
              className="block mb-1 text-sm font-medium"
            >
              Preferred Language
            </label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={RegisterData.preferredLanguage}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <SubmitButton>Signup</SubmitButton>
        </form>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

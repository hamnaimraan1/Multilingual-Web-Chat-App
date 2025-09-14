
// // export default Signup;
// import React, { useState } from "react";
// import { UserCircle, X } from "lucide-react";
// import Forminputs from "./Forminputs";
// import SubmitButton from "./SubmitButton";
// import { Link, useNavigate } from "react-router-dom";
// import uploadFile from "../utils/uploadFile";
// import axios from "axios";
// import { toast } from "sonner";
// import { useLocalStorage } from "@mantine/hooks";

// const Signup = () => {
//   const navigate = useNavigate();
//   const [, setUser] = useLocalStorage({
//     key: "userData",
//     defaultValue: {},
//   });

//   const [RegisterData, setRegisterData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     profilePic: "",
//     preferredLanguage: "en", // Default language
//   });

//   const [uploadImg, setUploadImg] = useState(null);

//   const handleChange = (event) => {
//     const { name, value } = event.target;
//     setRegisterData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleClearPhoto = (event) => {
//     event.preventDefault();
//     setUploadImg(null);
//     setRegisterData((prev) => ({ ...prev, profilePic: "" }));
//   };

//   const handleUpload = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     try {
//       const uploadImage = await uploadFile(file);

//       if (uploadImage?.url) {
//         setUploadImg(uploadImage);
//         setRegisterData((prev) => ({
//           ...prev,
//           profilePic: uploadImage.url,
//         }));
//         toast.success(`Uploaded: ${file.name}`);
//       } else {
//         toast.error("Image upload failed");
//       }
//     } catch (error) {
//       console.error("Cloudinary Upload Error:", error);
//       toast.error("Something went wrong during image upload");
//     }
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     event.stopPropagation();

//     if (!RegisterData.name || !RegisterData.email || !RegisterData.password) {
//       toast.error("Please fill in all the required fields.");
//       return;
//     }
// console.log("📦 Sending RegisterData:", RegisterData);

//     try {
//       const res = await axios.post(
//         `${process.env.REACT_APP_BACKEND_URL}/api/register`,
//         RegisterData
//       );

//       if (res.data.success) {
//         toast.success("Account created successfully!");
//         // Save user + token in localStorage
//         const { user, token } = res.data;
//         setUser({ ...user, token });
//         navigate("/");
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
//             value={RegisterData.name}
//             placeholder="Enter the name"
//             onChange={handleChange}
//           />
//           <Forminputs
//             label="Email"
//             name="email"
//             type="email"
//             value={RegisterData.email}
//             placeholder="Enter the email"
//             onChange={handleChange}
//           />
//           <Forminputs
//             label="Password"
//             name="password"
//             type="password"
//             value={RegisterData.password}
//             placeholder="Enter the password"
//             onChange={handleChange}
//           />

//           <div>
//             <label htmlFor="profilePic">
//               Profile Picture:
//               <div className="h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-primary cursor-pointer">
//                 {uploadImg?.url ? (
//                   <img
//                     src={uploadImg.url}
//                     alt="Preview"
//                     className="w-12 h-12 rounded-full object-cover"
//                   />
//                 ) : (
//                   <p className="text-sm max-w-[300px] text-ellipsis line-clamp-1">
//                     Upload profile photo
//                   </p>
//                 )}

//                 {uploadImg?.url && (
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
//               className="hidden"
//               onChange={handleUpload}
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="preferredLanguage"
//               className="block mb-1 text-sm font-medium"
//             >
//               Preferred Language
//             </label>
//             <select
//               id="preferredLanguage"
//               name="preferredLanguage"
//               value={RegisterData.preferredLanguage}
//               onChange={handleChange}
//               className="w-full border px-2 py-1 rounded"
//             >
//               <option value="en">English</option>
//               <option value="ur">Urdu</option>
//               <option value="hi">Hindi</option>
//               <option value="es">Spanish</option>
//               <option value="fr">French</option>
//             </select>
//           </div>

//           <SubmitButton>Signup</SubmitButton>
//         </form>

//         <p className="mt-3 text-center">
//           Already have an account?{" "}
//           <Link to="/login" className="text-blue-600">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Signup;
// export default Signup;
import React, { useEffect, useMemo, useState } from "react";
import { UserCircle, X } from "lucide-react";
import Forminputs from "./Forminputs";
import SubmitButton from "./SubmitButton";
import { Link, useNavigate } from "react-router-dom";
import uploadFile from "../utils/uploadFile";
import axios from "axios";
import { toast } from "sonner";
import { useLocalStorage } from "@mantine/hooks";
import languageOptions from "../utils/languageOptions";

/** helpers */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASS_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/; // 8+, 1 upper, 1 digit, 1 symbol

const Signup = () => {
  const navigate = useNavigate();
  const [, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });

  const [RegisterData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    profilePic: "",
    preferredLanguage: "en",
  });

  const [uploadImg, setUploadImg] = useState(null);
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState("form"); // form -> otp
  const [loading, setLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Email availability state
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  useEffect(() => {
    let t;
    if (cooldown > 0) t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // 🔍 Debounced email availability check
  useEffect(() => {
    if (!RegisterData.email || !EMAIL_RE.test(RegisterData.email)) {
      setEmailExists(false);
      return;
    }
    setCheckingEmail(true);
    const id = setTimeout(async () => {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/check-email`,
          { email: RegisterData.email }
        );
        setEmailExists(!!res.data?.exists);
      } catch {
        // If the check fails, don't block the user; just treat as not existing.
        setEmailExists(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 450); // debounce 450ms
    return () => clearTimeout(id);
  }, [RegisterData.email]);

  const canSubmitForm = useMemo(() => {
    return (
      RegisterData.name.trim().length >= 3 &&
      EMAIL_RE.test(RegisterData.email) &&
      PASS_RE.test(RegisterData.password) &&
      !emailExists &&
      !checkingEmail
    );
  }, [RegisterData, emailExists, checkingEmail]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleClearPhoto = (e) => {
    e.preventDefault();
    setUploadImg(null);
    setRegisterData((p) => ({ ...p, profilePic: "" }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadFile(file);
      if (uploaded?.url) {
        setUploadImg(uploaded);
        setRegisterData((p) => ({ ...p, profilePic: uploaded.url }));
        toast.success(`Uploaded: ${file.name}`);
      } else toast.error("Image upload failed");
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      toast.error("Something went wrong during image upload");
    }
  };

  /** Step 1: validate + (already) checked availability + send OTP */
  const startOtpFlow = async () => {
    const errs = {};
    if (RegisterData.name.trim().length < 3) errs.name = "Name must be at least 3 characters.";
    if (!EMAIL_RE.test(RegisterData.email)) errs.email = "Invalid email format.";
    if (!PASS_RE.test(RegisterData.password))
      errs.password = "Min 8 chars with 1 uppercase, 1 number, and 1 symbol.";
    if (emailExists) errs.email = "Email already registered.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      if (errs.email === "Email already registered.") toast.error(errs.email);
      return;
    }

    try {
      setLoading(true);

      // (Defensive) recheck on server right before sending OTP
      const check = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/check-email`,
        { email: RegisterData.email }
      );
      if (check.data?.exists) {
        setEmailExists(true);
        setErrors((p) => ({ ...p, email: "Email already registered." }));
        toast.error("Email already registered.");
        return;
      }

      const send = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/send-otp`,
        { email: RegisterData.email }
      );

      if (send.data?.success) {
        toast.success("OTP sent to your email.");
        setPhase("otp");
        setCooldown(60);
      } else {
        toast.error("Failed to send OTP. Try again.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not start verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setLoading(true);
      const send = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/send-otp`,
        { email: RegisterData.email }
      );
      if (send.data?.success) {
        toast.success("OTP resent.");
        setCooldown(60);
      } else toast.error("Failed to resend OTP.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Resend failed.");
    } finally {
      setLoading(false);
    }
  };

  /** Step 2: verify OTP, then call your existing /api/register */
  const verifyAndRegister = async () => {
    if (!otp || otp.length < 4) {
      toast.error("Enter the OTP sent to your email.");
      return;
    }
    try {
      setLoading(true);
      const ver = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-otp`,
        { email: RegisterData.email, otp }
      );
      if (!ver.data?.success) {
        toast.error("Invalid or expired OTP.");
        return;
      }
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/register`,
        RegisterData
      );
      if (res.data.success) {
        toast.success("Account created successfully!");
        const { user, token } = res.data;
        setUser({ ...user, token });
        return navigate("/");
      }
      toast.error("Registration failed.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🔤 languages from file (sorted)
  const languageList = useMemo(
    () =>
      Object.entries(languageOptions)
        .map(([code, label]) => ({ code, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  return (
    <div className="grid place-content-center min-h-screen bg-[#0a192f] text-white px-4">
      <div className="bg-[#112240] w-full max-w-md rounded-2xl p-8 shadow-xl border border-[#1b2e4a]">
        <div className="w-fit mx-auto mb-4 text-[#f7c948]">
          <UserCircle size={72} strokeWidth={1.5} />
        </div>

        <h3 className="text-center text-2xl font-bold">Create your account</h3>
        <p className="text-center text-sm text-gray-400 mb-6">
          Verify your email with OTP to continue
        </p>

        {/* Phase: form */}
        {phase === "form" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startOtpFlow();
            }}
            className="grid gap-4"
          >
            <Forminputs
              label="Name"
              name="name"
              type="text"
              value={RegisterData.name}
              placeholder="Your full name"
              onChange={onChange}
              error={errors.name}
              required
              autoComplete="name"
            />

            <Forminputs
              label="Email"
              name="email"
              type="email"
              value={RegisterData.email}
              placeholder="you@example.com"
              onChange={onChange}
              error={
                errors.email ||
                (emailExists ? "Email already registered." : "")
              }
              helper={
                RegisterData.email && EMAIL_RE.test(RegisterData.email)
                  ? checkingEmail
                    ? "Checking availability…"
                    : emailExists
                    ? ""
                    : "This email is available."
                  : ""
              }
              required
              autoComplete="email"
            />

            <Forminputs
              label="Password"
              name="password"
              type="password"
              value={RegisterData.password}
              placeholder="Create a strong password"
              showStrength={true}
              onChange={onChange}
              error={errors.password}
              helper="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
              required
              autoComplete="new-password"
            />

            {/* profile photo */}
            <div>
              <label htmlFor="profilePic" className="block text-sm font-medium text-gray-200 mb-1">
                Profile Picture
              </label>
              <div className="h-14 bg-[#0f1b31] flex justify-between items-center border border-[#243b55] rounded-lg px-3 hover:border-[#4f7dbd] transition">
                <div className="flex items-center gap-3">
                  {uploadImg?.url ? (
                    <img
                      src={uploadImg.url}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">Upload profile photo</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {uploadImg?.url && (
                    <button
                      className="text-sm text-red-300 hover:text-red-400"
                      onClick={handleClearPhoto}
                    >
                      <X />
                    </button>
                  )}
                  <label
                    htmlFor="profilePic"
                    className="text-xs px-3 py-1 rounded-md bg-[#1c2f50] hover:bg-[#23406c] cursor-pointer"
                  >
                    Choose
                  </label>
                </div>
              </div>
              <input
                type="file"
                id="profilePic"
                name="profilePic"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
              />
            </div>

            {/* language */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-200" htmlFor="preferredLanguage">
                Preferred Language
              </label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={RegisterData.preferredLanguage}
                onChange={onChange}
                className="w-full rounded-lg px-3 py-2 bg-[#0f1b31] text-white border border-[#243b55] focus:outline-none focus:ring-2 focus:ring-[#4f7dbd]"
              >
                {languageList.map(({ code, label }) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <SubmitButton loading={loading} disabled={!canSubmitForm}>
              {checkingEmail ? "Checking…" : "Send OTP"}
            </SubmitButton>
          </form>
        )}

        {/* Phase: OTP */}
        {phase === "otp" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-[#0f1b31] border border-[#243b55] p-4 text-sm text-gray-200">
              We’ve sent a one-time code to <span className="text-white font-medium">{RegisterData.email}</span>.
              Enter it below to verify your email and complete signup.
            </div>

            <div className="flex gap-3">
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="flex-1 text-center tracking-widest text-lg rounded-lg px-3 py-3 bg-[#0f1b31] text-white border border-[#243b55] focus:outline-none focus:ring-2 focus:ring-[#4f7dbd]"
                placeholder="Enter 6-digit OTP"
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="px-4 py-3 rounded-lg bg-[#1c2f50] text-white text-sm hover:bg-[#23406c] disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend (${cooldown})` : "Resend"}
              </button>
            </div>

            <SubmitButton
  type="button"
  loading={loading}
  onClick={verifyAndRegister}
>
  Verify & Create Account
</SubmitButton>

            <p className="text-center text-sm text-gray-400">
              Wrong email?{" "}
              <button
                type="button"
                onClick={() => setPhase("form")}
                className="text-[#f7c948] hover:underline"
              >
                Edit
              </button>
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-[#f7c948] hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

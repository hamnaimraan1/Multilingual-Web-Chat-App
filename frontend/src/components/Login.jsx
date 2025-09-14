
// import React, { useMemo, useState } from "react";
// import { UserCircle } from "lucide-react";
// import Forminputs from "./Forminputs";
// import SubmitButton from "./SubmitButton";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "sonner";
// import { useLocalStorage } from "@mantine/hooks";

// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const Login = () => {
//   const [, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });
//   const navigate = useNavigate();

//   const [loginData, setLoginData] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const canSubmit = useMemo(() => {
//     return EMAIL_RE.test(loginData.email) && loginData.password.length >= 6;
//   }, [loginData]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setLoginData((p) => ({ ...p, [name]: value }));
//     setErrors((p) => ({ ...p, [name]: "" }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errs = {};
//     if (!EMAIL_RE.test(loginData.email)) errs.email = "Invalid email format.";
//     if (!loginData.password) errs.password = "Password is required.";
//     if (Object.keys(errs).length) return setErrors(errs);

//     try {
//       setLoading(true);
//       const res = await axios.post(
//         `${process.env.REACT_APP_BACKEND_URL}/api/login`,
//         loginData
//       );
//       if (res.data?.success) {
//         toast.success(`Welcome back, ${res.data.user?.name || "User"}!`);
//         const { user, token } = res.data;
//         setUser({ ...user, token });
//         localStorage.setItem("token", token);
//         navigate("/");
//       } else {
//         toast.error("Invalid email or password.");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Invalid email or password.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="grid place-content-center min-h-screen bg-[#0a192f] text-white px-4">
//       <div className="bg-[#112240] w-full max-w-md rounded-2xl p-8 shadow-xl border border-[#1b2e4a]">
//         <div className="w-fit mx-auto mb-4 text-[#f7c948]">
//           <UserCircle size={72} strokeWidth={1.5} />
//         </div>

//         <h2 className="text-center text-2xl font-bold mb-1">Welcome to CrossPing</h2>
//         <p className="text-center text-sm text-gray-400 mb-6">Log in to your account</p>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <Forminputs
//             label="Email"
//             name="email"
//             type="email"
//             value={loginData.email}
//             placeholder="you@example.com"
//             onChange={handleChange}
//             error={errors.email}
//             required
//             autoComplete="email"
//           />
//           <Forminputs
//             label="Password"
//             name="password"
//             type="password"
//             value={loginData.password}
//             placeholder="Your password"
//             onChange={handleChange}
//             error={errors.password}
//             required
//             autoComplete="current-password"
//           />

//           <SubmitButton loading={loading} disabled={!canSubmit}>
//             Login
//           </SubmitButton>
//         </form>

//         <p className="mt-6 text-center text-sm text-gray-400">
//           New user?{" "}
//           <Link to="/signup" className="text-[#f7c948] hover:underline font-medium">
//             Create an account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useMemo, useState } from "react";
import { UserCircle } from "lucide-react";
import Forminputs from "./Forminputs";
import SubmitButton from "./SubmitButton";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useLocalStorage } from "@mantine/hooks";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => EMAIL_RE.test(loginData.email) && loginData.password.length >= 6,
    [loginData]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!EMAIL_RE.test(loginData.email)) errs.email = "Invalid email format.";
    if (!loginData.password) errs.password = "Password is required.";
    if (Object.keys(errs).length) return setErrors(errs);

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/login`,
        loginData
      );
      if (res.data?.success) {
        toast.success(`Welcome back, ${res.data.user?.name || "User"}!`);
        const { user, token } = res.data;
        setUser({ ...user, token });
        localStorage.setItem("token", token);
        navigate("/");
      } else {
        toast.error("Invalid email or password.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-content-center min-h-screen bg-[#0a0f14] text-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl p-8 shadow-xl border border-zinc-800/70 bg-[#0b1016]">
        <div className="w-fit mx-auto mb-4 text-emerald-400/90">
          <UserCircle size={72} strokeWidth={1.5} />
        </div>

        <h2 className="text-center text-2xl font-bold mb-1 text-zinc-200">
          Welcome to CrossPing
        </h2>
        <p className="text-center text-sm text-zinc-400 mb-6">
          Log in to your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Forminputs
            label="Email"
            name="email"
            type="email"
            value={loginData.email}
            placeholder="you@example.com"
            onChange={handleChange}
            error={errors.email}
            required
            autoComplete="email"
          />
          <Forminputs
            label="Password"
            name="password"
            type="password"
            value={loginData.password}
            placeholder="Your password"
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <SubmitButton loading={loading} disabled={!canSubmit} className="!bg-emerald-600 hover:!bg-emerald-500 !text-white !ring-1 !ring-emerald-400/30">
            Login
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          New user?{" "}
          <Link
            to="/signup"
            className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

// import React from "react";

// const Forminputs = ({ label, name, type, placeholder, value, onChange }) => {
//   return (
//     <div className="flex flex-col gap-1">
//       <label htmlFor="">{label}</label>
//       <input
//         className="bg-slate-100 px-2 py-1 focus:outline-none"
//         type={type}
//         name={name}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//       />
//     </div>
//   );
// };

// export default Forminputs;
import React, { useMemo, useState } from "react";

const strengthLabel = (score) => {
  if (score >= 4) return "Strong";
  if (score === 3) return "Good";
  if (score === 2) return "Weak";
  return "Very Weak";
};

const calcStrength = (v = "") => {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  return s;
};

const Forminputs = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helper,
  required,
  autoComplete,
  showStrength = false, // 👈 new prop
}) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  const strength = useMemo(() => {
    if (!isPassword) return null;
    return calcStrength(value);
  }, [value, isPassword]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-200" htmlFor={name}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          className={`w-full rounded-lg px-3 py-2 bg-[#0f1b31] text-white placeholder-gray-400 border
            ${error ? "border-red-500" : "border-[#243b55]"} focus:outline-none focus:ring-2 
            ${error ? "focus:ring-red-500" : "focus:ring-[#4f7dbd]"} transition`}
          type={isPassword ? (show ? "text" : "password") : type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((p) => !p)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-300 hover:text-white"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {/* helper / error */}
      {helper && !error && (
        <p className="text-[11px] text-gray-400">{helper}</p>
      )}
      {error && <p className="text-[12px] text-red-400">{error}</p>}

      {/* password strength → only when explicitly enabled */}
      {isPassword && value && showStrength && (
        <div className="mt-1">
          <div className="h-1 w-full bg-[#0f1b31] rounded">
            <div
              className={`h-1 rounded ${
                strength >= 4
                  ? "bg-green-500 w-full"
                  : strength === 3
                  ? "bg-yellow-500 w-3/4"
                  : strength === 2
                  ? "bg-orange-500 w-2/4"
                  : "bg-red-500 w-1/4"
              }`}
            />
          </div>
          <p className="text-[11px] mt-1 text-gray-300">
            Password strength: {strengthLabel(strength || 0)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Forminputs;

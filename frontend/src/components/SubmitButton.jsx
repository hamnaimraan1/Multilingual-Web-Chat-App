// import React from "react";

// const SubmitButton = ({ children }) => {
//   return (
//     <button type="submit"className="bg-blue-500 w-full text-white rounded-md p-1">
//       {children}
//     </button>
//   );
// };

// export default SubmitButton;
import React from "react";

const SubmitButton = ({
  children,
  onClick,
  disabled,
  loading,
  type = "submit",
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={
        "w-full rounded-lg px-4 py-2 bg-[#E1AD01] text-white font-semibold shadow-md " +
        "hover:bg-[#d99b00] hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed " +
        className
      }
    >
      {loading ? "Please wait…" : children}
    </button>
  );
};

export default SubmitButton;

import React from "react";

const SubmitButton = ({ children }) => {
  return (
    <button type="submit"className="bg-blue-500 w-full text-white rounded-md p-1">
      {children}
    </button>
  );
};

export default SubmitButton;

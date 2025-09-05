import React from "react";

const Forminputs = ({ label, name, type, placeholder, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="">{label}</label>
      <input
        className="bg-slate-100 px-2 py-1 focus:outline-none"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Forminputs;

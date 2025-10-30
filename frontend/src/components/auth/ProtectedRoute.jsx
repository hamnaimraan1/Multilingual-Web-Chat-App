// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedRoute = ({ children, user, redirect = "/login" }) => {
//   if (!user) return <Navigate to={redirect} />;
//   return children || <Outlet />;
// };

// export default ProtectedRoute;
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children, user, redirect = "/login" }) => {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    // give useLocalStorage time to hydrate
    setBooted(true);
  }, []);

  if (!booted) return null; // or <div>Loading...</div>

  const token =
    user?.token || localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) return <Navigate to={redirect} replace />;

  return children || <Outlet />;
};

export default ProtectedRoute;

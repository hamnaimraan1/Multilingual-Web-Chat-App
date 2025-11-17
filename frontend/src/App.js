

// import { Suspense, lazy } from "react";
// import { Toaster } from "sonner";
// import "./index.css";
// import { Route, Routes, Navigate } from "react-router-dom";
// import { useLocalStorage } from "@mantine/hooks";
// import { Sockets } from "./utils/Sockets";
// import SocketNotifier from "./components/SocketNotifier";
// import DashboardLayout from "./components/DashboardLayout"; // ← use the layout as shell

// // Lazy load pages
// const Login = lazy(() => import("./components/Login"));
// const Signup = lazy(() => import("./components/Signup"));
// const Homepage = lazy(() => import("./components/Homepage"));
// const ChatPage = lazy(() => import("./components/ChatPage"));
// const GroupsChatContainer = lazy(() => import("./components/GroupsChatContainer"));

// function App() {
//   const [user] = useLocalStorage({ key: "userData", defaultValue: null });

//   return (
//     <div className="App bg-black text-white min-h-screen">
//       <Suspense fallback={<div>Loading...</div>}>
//         <Sockets>
//           <SocketNotifier />
//           <Routes>
//             {/* Public */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />

//             {/* Protected shell renders <Side/> once and an <Outlet/> for right pane */}
//             <Route
//               path="/"
//               element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
//             >
//               {/* Right pane content */}
//               <Route index element={<Homepage />} />                         {/* welcome */}
//               <Route path=":userId" element={<ChatPage />} />               {/* DMs */}
//               <Route path="g" element={<GroupsChatContainer embedded />} /> {/* Groups list/right */}
//               <Route path="g/:groupId" element={<GroupsChatContainer embedded />} />
//             </Route>

//             {/* Fallback */}
//             <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
//           </Routes>
//         </Sockets>
//       </Suspense>

//       <Toaster position="top-right" richColors />
//     </div>
//   );
// }

// export default App;
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";
import "./index.css";
import { Route, Routes, Navigate } from "react-router-dom";
import { useLocalStorage } from "@mantine/hooks";
import { Sockets } from "./utils/Sockets";
import SocketNotifier from "./components/SocketNotifier";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // ✅ import the fixed guard
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
// Lazy load pages
const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const Homepage = lazy(() => import("./components/Homepage"));
const ChatPage = lazy(() => import("./components/ChatPage"));
const GroupsChatContainer = lazy(() => import("./components/GroupsChatContainer"));

function App() {
  const [user] = useLocalStorage({ key: "userData", defaultValue: null });

  return (
    <div className="App bg-black text-white min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <Sockets>
          <SocketNotifier />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* ✅ Protected shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Right pane content */}
              <Route index element={<Homepage />} /> {/* welcome */}
              <Route path=":userId" element={<ChatPage />} /> {/* DMs */}
              <Route path="g" element={<GroupsChatContainer embedded />} /> {/* Groups list */}
              <Route path="g/:groupId" element={<GroupsChatContainer embedded />} />
              
            </Route>
             <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to={user ? "/" : "/login"} replace />}
            />
          </Routes>
        </Sockets>
      </Suspense>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;

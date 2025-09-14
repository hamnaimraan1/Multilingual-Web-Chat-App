
// // export default App;
// import { Suspense, lazy } from "react";
// import { Toaster } from "sonner";
// import "./index.css";
// import { Route, Routes, Navigate } from "react-router-dom";
// import { useLocalStorage } from "@mantine/hooks";
// import { Sockets } from "./utils/Sockets";
// import SocketNotifier from "./components/SocketNotifier";

// // Lazy load pages
// const Login = lazy(() => import("./components/Login"));
// const Signup = lazy(() => import("./components/Signup"));
// const Homepage = lazy(() => import("./components/Homepage"));
// const ChatPage = lazy(() => import("./components/ChatPage"));
// const GroupsChatContainer = lazy(() => import("./components/GroupsChatContainer"));

// function App() {
//   const [user] = useLocalStorage({
//     key: "userData",
//     defaultValue: null,
//   });

//   return (
//     <div className="App bg-black text-white min-h-screen">
//       <Suspense fallback={<div>Loading...</div>}>
//         <Sockets>
//           <SocketNotifier />
//           <Routes>
//             {/* Public */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />

//             {/* Protected */}
//             <Route
//               path="/"
//               element={user ? <Homepage /> : <Navigate to="/login" replace />}
//             />
//             <Route
//               path="/:userId"
//               element={user ? <ChatPage /> : <Navigate to="/login" replace />}
//             />

//             {/* Groups (non-embedded only; keep it simple and predictable) */}
//             <Route
//               path="/g"
//               element={user ? <GroupsChatContainer embedded={false} /> : <Navigate to="/login" replace />}
//             />
//             <Route
//               path="/g/:groupId"
//               element={user ? <GroupsChatContainer embedded={false} /> : <Navigate to="/login" replace />}
//             />
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
import DashboardLayout from "./components/DashboardLayout"; // ← use the layout as shell

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
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected shell renders <Side/> once and an <Outlet/> for right pane */}
            <Route
              path="/"
              element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
            >
              {/* Right pane content */}
              <Route index element={<Homepage />} />                         {/* welcome */}
              <Route path=":userId" element={<ChatPage />} />               {/* DMs */}
              <Route path="g" element={<GroupsChatContainer embedded />} /> {/* Groups list/right */}
              <Route path="g/:groupId" element={<GroupsChatContainer embedded />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
          </Routes>
        </Sockets>
      </Suspense>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;

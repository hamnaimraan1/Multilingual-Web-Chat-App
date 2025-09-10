// import { Suspense, lazy } from 'react';
// import { Toaster } from "sonner";
// import './index.css';
// import { Route, Routes, Link } from 'react-router-dom';
// import { useLocalStorage } from "@mantine/hooks";
// import { Sockets } from "./utils/Sockets";
// import ProtectedRoute from './components/auth/ProtectedRoute';
// import Home from './components/Homepage'; 

// // Lazy load login/signup
// const Login = lazy(() => import('./components/Login'));
// const Signup = lazy(() => import('./components/Signup'));

// function App() {
//   const [user] = useLocalStorage({
//     key: "userData",
//     defaultValue: null,
//   });

//   return (
//     <div className="App">
//       {/* Header */}
//       <div className="bg-blue-500 text-white p-5 flex justify-between items-center">
//         <div className="text-xl font-bold">CrossPing</div>
//         <div className="space-x-4">
//           <Link to="/login" className="hover:underline">Login</Link>
//           <Link to="/signup" className="hover:underline">Signup</Link>
//         </div>
//       </div>

//       {/* Routes */}
//       <Suspense fallback={<div>Loading...</div>}>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
          
//           {/*  Protected Routes */}
//           <Route
//             path="/"
//             element={
//               <Sockets>
//                 <ProtectedRoute user={user}>
//                   <Home />
//                 </ProtectedRoute>
//               </Sockets>
//             }
//           />
//         </Routes>
//       </Suspense>

//       {/* Toast Notifications */}
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
// import Groups from "./components/Groups";

// Lazy load pages
const Login = lazy(() => import("./components/Login"));
const Signup = lazy(() => import("./components/Signup"));
const Homepage = lazy(() => import("./components/Homepage"));
const ChatPage = lazy(() => import("./components/ChatPage"));
const GroupsChatContainer = lazy(() => import("./components/GroupsChatContainer"));

// Suppress all warnings

function App() {
  const [user] = useLocalStorage({
    key: "userData",
    defaultValue: null,
  });

  return (
    <div className="App bg-black text-white min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
  <Sockets>
     <SocketNotifier />
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={user ? <Homepage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/:userId"
        element={user ? <ChatPage /> : <Navigate to="/login" replace />}
      />
      

           {/* <Route path="/groups" element={user ? <Groups /> : <Navigate to="/login" replace />} /> */}
{/* <Route
  path="/groups"
  element={user ? <GroupsChatContainer /> : <Navigate to="/login" replace />}
/> */}
 <Route path="groups" element={<GroupsChatContainer embedded />} />
        <Route path="g/:groupId" element={<GroupsChatContainer embedded />} />
    
    </Routes>
  </Sockets>
</Suspense>
    </div>
  );
}

export default App;

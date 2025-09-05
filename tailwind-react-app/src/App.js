import { Suspense, lazy } from 'react';
import './index.css';
import { Route, Routes } from 'react-router-dom';

// Lazy load the Login component
const Login = lazy(() => import('./components/Login'));

const Signup = lazy(() => import('./components/Signup'));
function App() {
  return (
    
    <div className="App">
       <div className="bg-red-500 text-white p-5">
      Tailwind CSS is working!
    </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Suspense>

    </div>
    
  );
}

export default App;

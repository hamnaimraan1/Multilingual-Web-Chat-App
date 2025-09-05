// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css'; // This line MUST be present


// import App from './App';
// import {  MantineProvider } from '@mantine/core';
// import { BrowserRouter} from "react-router-dom";

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <MantineProvider>
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// </MantineProvider>

  
// );
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import App from './App';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from "react-router-dom";
import { Sockets } from "./utils/Sockets"; //  Import socket context provider
console.warn = () => {};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MantineProvider>
    <Sockets> {/* ✅ Wrap with socket context */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Sockets>
  </MantineProvider>
);


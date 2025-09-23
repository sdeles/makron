import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // A importação

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* A correção: <BrowserRouter> precisa envolver o <App /> */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
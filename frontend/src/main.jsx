import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './App.css'

// --- Chỉ cần import duy nhất file router tổng ---
import router from './router/index.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* Cung cấp router đã được cấu hình cho toàn bộ ứng dụng */}
    <RouterProvider router={router} />
  </React.StrictMode>
);
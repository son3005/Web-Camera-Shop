import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import "./assets/styles/MainLayout.css";
import router from "./router/index.jsx";

// 1. Tạo một instance của QueryClient
const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render ứng dụng, cung cấp QueryClient cho toàn bộ cây component
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

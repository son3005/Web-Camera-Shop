import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import { ROUTES } from "@/constants/routes";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Home />} />
    </Routes>
  );
}

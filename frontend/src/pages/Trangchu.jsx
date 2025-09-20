import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../constants/api";
import { useNavigate } from "react-router-dom";

export default function Trangchu(){
  const [user, setUser] = useState(null);
  const nav = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(!token){
      return;
    }
    axios.get(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUser(r.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/dangnhap");
  }

  if(!localStorage.getItem("token")){
    return (
      <div className="bg-white p-6 rounded shadow">
        <h2>Chưa đăng nhập</h2>
        <a href="/dangnhap" className="text-blue-600 underline">Đăng nhập</a>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2>Trang chủ</h2>
      {user ? <div>Xin chào, {user.name || user.email}</div> : <div>Đang tải...</div>}
      <button onClick={logout} className="mt-4 p-2 bg-red-600 text-white rounded">Đăng xuất</button>
    </div>
  )
}

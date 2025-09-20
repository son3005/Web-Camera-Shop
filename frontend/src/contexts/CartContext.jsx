// // src/contexts/CartContext.jsx
// // Context quản lý giỏ hàng toàn cục
// import React, { createContext, useContext, useState } from "react";

// // Tạo context
// const CartContext = createContext();

// // Provider bọc App để tất cả component con dùng được
// export function CartProvider({ children }) {
//   // cartItems: mảng các item { id, name, price, qty, ... }
//   const [cartItems, setCartItems] = useState([]);

//   // Thêm sản phẩm (nếu sản phẩm đã có thì tăng qty)
//   const addToCart = (product) => {
//     setCartItems((prev) => {
//       const idx = prev.findIndex((p) => p.id === product.id);
//       if (idx !== -1) {
//         // tăng qty
//         const copy = [...prev];
//         copy[idx] = { ...copy[idx], qty: (copy[idx].qty || 1) + 1 };
//         return copy;
//       }
//       return [...prev, { ...product, qty: 1 }];
//     });
//   };

//   // Xoá sản phẩm theo id
//   const removeFromCart = (id) => {
//     setCartItems((prev) => prev.filter((p) => p.id !== id));
//   };

//   // Lấy tổng số lượng sản phẩm trong giỏ
//   const totalCount = cartItems.reduce((s, it) => s + (it.qty || 0), 0);

//   return (
//     <CartContext.Provider
//       value={{ cartItems, addToCart, removeFromCart, totalCount }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// // Hook tiện dụng
// export function useCart() {
//   return useContext(CartContext);
// }

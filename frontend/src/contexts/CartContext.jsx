
import React, { createContext, useContext, useState } from "react";
const CartContext = createContext();
export function CartProvider({ children }){
  const [count, setCount] = useState(0);
  function addToCart(product){ setCount(c=>c+1); console.log('Added',product.name); }
  function resetCart(){ setCount(0); }
  return <CartContext.Provider value={{count,addToCart,resetCart}}>{children}</CartContext.Provider>
}
export function useCart(){ return useContext(CartContext); }

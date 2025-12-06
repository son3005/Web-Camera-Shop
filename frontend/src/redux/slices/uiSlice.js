import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme:
    (typeof window !== "undefined" && localStorage.getItem("theme")) || "light",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", state.theme);
      } catch {}
    },
    setTheme: (state, { payload }) => {
      state.theme = payload || "light";
      try {
        localStorage.setItem("theme", state.theme);
      } catch {}
    },
  },
});

export const { toggleTheme, setTheme } = uiSlice.actions;
export default uiSlice.reducer;

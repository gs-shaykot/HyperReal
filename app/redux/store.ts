import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./Slices/ThemeSlice";

export const store = configureStore({
    reducer: { 
        themeToggle: themeReducer
    },
});

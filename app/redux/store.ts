import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./Slices/ThemeSlice"; 

export const store = configureStore({
    reducer: {
        themeToggle: themeReducer, 
    },
});

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatchType = typeof store.dispatch;
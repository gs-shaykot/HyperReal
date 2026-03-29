import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
}

const initialState: ThemeState = {
    mode: 'light', // Safe server-side default — always 'light' on first render
};

const ThemeSlice = createSlice({
    name: 'themeToggle',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            const next = state.mode === 'light' ? 'dark' : 'light';
            state.mode = next;
            // Persist to localStorage on every toggle
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', next);
            }
        },
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
        },
    },
});

export const { toggleTheme, setTheme } = ThemeSlice.actions;
export default ThemeSlice.reducer;
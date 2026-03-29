import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
}

const initialState: ThemeState = {
    mode: 'light',
};

const ThemeSlice = createSlice({
    name: 'themeToggle',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            const next = state.mode === 'light' ? 'dark' : 'light';
            state.mode = next;
        },
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
        },
    },
});

export const { toggleTheme, setTheme } = ThemeSlice.actions;
export default ThemeSlice.reducer;
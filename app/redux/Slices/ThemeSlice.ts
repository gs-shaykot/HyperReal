import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mode: 'light',
}

const ThemeSlice = createSlice({
    name: 'themeToggle',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light'
        }
    }
})

export const { toggleTheme } = ThemeSlice.actions
export default ThemeSlice.reducer
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    mode: 'light',
    categoryId: null,
}

const ThemeSlice = createSlice({
    name: 'themeToggle',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light'
        },
        setCategoryId: (state, action) => {
            state.categoryId = action.payload;
        }
    }
})

export const { toggleTheme, setCategoryId } = ThemeSlice.actions
export default ThemeSlice.reducer
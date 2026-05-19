import { createSlice } from '@reduxjs/toolkit'

const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        isDark: localStorage.getItem('truva_theme') === 'dark' ? true : false,
    },
    reducers: {
        toggleTheme: (state) => {
            state.isDark = !state.isDark
            localStorage.setItem('truva_theme', state.isDark ? 'dark' : 'light')
        },
        setDark: (state) => {
            state.isDark = true
            localStorage.setItem('truva_theme', 'dark')
        },
        setLight: (state) => {
            state.isDark = false
            localStorage.setItem('truva_theme', 'light')
        },
    },
})

export const { toggleTheme, setDark, setLight } = themeSlice.actions
export default themeSlice.reducer
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios.js'

// Signup
export const signup = createAsyncThunk('auth/signup', async (userData, thunkAPI) => {
    try {
        const res = await API.post('/auth/signup', userData)
        localStorage.setItem('truva_token', res.data.token)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
});

// LOGIN
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const res = await API.post('/auth/login', userData)
        localStorage.setItem('truva_token', res.data.token)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
});

// GET ME
export const getMe = createAsyncThunk('auth/getMe', async (_, thunkAPI) => {
    try {
        const res = await API.get('/auth/me')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('truva_token') || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null
            state.token = null
            localStorage.removeItem('truva_token')
        },
        clearError: (state) => {
        state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
        // SIGNUP
        .addCase(signup.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(signup.fulfilled, (state, action) => {
            state.loading = false
            state.user = null
            state.token = null
        })
        .addCase(signup.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // LOGIN
        .addCase(login.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(login.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload.user
            state.token = action.payload.token
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // GET ME
        .addCase(getMe.pending, (state) => {
            state.loading = true
        })
        .addCase(getMe.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload.user
        })
        .addCase(getMe.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
    },
});

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
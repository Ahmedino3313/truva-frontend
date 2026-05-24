import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios.js'

// SIGNUP
export const signup = createAsyncThunk('auth/signup', async (userData, thunkAPI) => {
    try {
        const res = await API.post('/auth/signup', userData)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// LOGIN
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const res = await API.post('/auth/login', userData)
        localStorage.setItem('truva_token', res.data.token)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// GET ME
export const getMe = createAsyncThunk('auth/getMe', async (_, thunkAPI) => {
    try {
        const res = await API.get('/auth/me')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// SEND VERIFICATION EMAIL
export const sendVerification = createAsyncThunk('auth/sendVerification', async (_, thunkAPI) => {
    try {
        const res = await API.post('/auth/send-verification')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// VERIFY EMAIL
export const verifyEmail = createAsyncThunk('auth/verifyEmail', async (code, thunkAPI) => {
    try {
        const res = await API.post('/auth/verify-email', { code })
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// UPDATE PROFILE
export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, thunkAPI) => {
    try {
        const res = await API.patch('/auth/profile', profileData)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// UPLOAD AVATAR
export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (formData, thunkAPI) => {
    try {
        const res = await API.post('/auth/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('truva_token') || null,
        loading: false,
        error: null,
        success: false,
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
        clearSuccess: (state) => {
            state.success = false
        },
    },
    extraReducers: (builder) => {
        builder
            // SIGNUP
            .addCase(signup.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(signup.fulfilled, (state) => {
                state.loading = false
                state.success = true
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
            // SEND VERIFICATION
            .addCase(sendVerification.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(sendVerification.fulfilled, (state) => {
                state.loading = false
                state.success = true
            })
            .addCase(sendVerification.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // VERIFY EMAIL
            .addCase(verifyEmail.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(verifyEmail.fulfilled, (state) => {
                state.loading = false
                state.success = true
                if (state.user) {
                    state.user.isVerified = true
                }
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // UPDATE PROFILE
            .addCase(updateProfile.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.user = action.payload.user
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // UPLOAD AVATAR
            .addCase(uploadAvatar.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.user = action.payload.user
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { logout, clearError, clearSuccess } = authSlice.actions
export default authSlice.reducer
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios.js'

// GET ALL NOTIFICATIONS
export const getNotifications = createAsyncThunk('notifications/getAll', async (_, thunkAPI) => {
    try {
        const res = await API.get('/notifications')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// MARK ONE AS READ
export const markAsRead = createAsyncThunk('notifications/markOne', async (id, thunkAPI) => {
    try {
        const res = await API.patch(`/notifications/${id}/read`)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// MARK ALL AS READ
export const markAllAsRead = createAsyncThunk('notifications/markAll', async (_, thunkAPI) => {
    try {
        const res = await API.patch('/notifications/read/all')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// DELETE ONE NOTIFICATION
export const deleteNotification = createAsyncThunk('notifications/deleteOne', async (id, thunkAPI) => {
    try {
        await API.delete(`/notifications/${id}`)
        return id
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// DELETE ALL NOTIFICATIONS
export const deleteAllNotifications = createAsyncThunk('notifications/deleteAll', async (_, thunkAPI) => {
    try {
        await API.delete('/notifications/delete/all')
        return true
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
    },
    reducers: {
        clearNotificationState: (state) => {
        state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
        // GET ALL NOTIFICATIONS
        .addCase(getNotifications.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(getNotifications.fulfilled, (state, action) => {
            state.loading = false
            state.notifications = action.payload.notifications
            state.unreadCount = action.payload.unreadCount
        })
        .addCase(getNotifications.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // MARK ONE AS READ
        .addCase(markAsRead.fulfilled, (state, action) => {
            state.notifications = state.notifications.map((n) =>
            n.id === action.payload.notification.id
                ? { ...n, isRead: true }
                : n
            )
            state.unreadCount = state.unreadCount > 0
            ? state.unreadCount - 1
            : 0
        })
        // MARK ALL AS READ
        .addCase(markAllAsRead.fulfilled, (state) => {
            state.notifications = state.notifications.map((n) => ({
            ...n,
            isRead: true,
            }))
            state.unreadCount = 0
        })
        // DELETE ONE NOTIFICATION
        .addCase(deleteNotification.fulfilled, (state, action) => {
            const deleted = state.notifications.find(
            (n) => n.id === action.payload
            )
            if (deleted && !deleted.isRead) {
            state.unreadCount = state.unreadCount > 0
                ? state.unreadCount - 1
                : 0
            }
            state.notifications = state.notifications.filter(
            (n) => n.id !== action.payload
            )
        })
        // DELETE ALL NOTIFICATIONS
        .addCase(deleteAllNotifications.fulfilled, (state) => {
            state.notifications = []
            state.unreadCount = 0
        })
    },
})

export const { clearNotificationState } = notificationSlice.actions
export default notificationSlice.reducer
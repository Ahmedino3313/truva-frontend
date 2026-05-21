import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios.js'

// GET ALL SAVINGS GOALS
export const getSavingsGoals = createAsyncThunk('savings/getAll', async (_, thunkAPI) => {
    try {
        const res = await API.get('/savings')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// CREATE SAVINGS GOAL
export const createSavingsGoal = createAsyncThunk('savings/create', async (data, thunkAPI) => {
    try {
        const res = await API.post('/savings', data)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// FUND SAVINGS GOAL
export const fundSavingsGoal = createAsyncThunk('savings/fund', async ({ id, amount }, thunkAPI) => {
    try {
        const res = await API.patch(`/savings/${id}/fund`, { amount })
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// DELETE SAVINGS GOAL
export const deleteSavingsGoal = createAsyncThunk('savings/delete', async (id, thunkAPI) => {
    try {
        await API.delete(`/savings/${id}`)
        return id
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// WITHDRAW SAVINGS GOAL
export const withdrawSavingsGoal = createAsyncThunk('savings/withdraw', async (id, thunkAPI) => {
    try {
        const res = await API.post(`/savings/${id}/withdraw`)
        return { ...res.data, id }
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

const savingsSlice = createSlice({
    name: 'savings',
    initialState: {
        goals: [],
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        clearSavingsState: (state) => {
        state.error = null
        state.success = false
        },
    },
    extraReducers: (builder) => {
        builder
        
        // GET ALL SAVINGS GOALS
        .addCase(getSavingsGoals.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(getSavingsGoals.fulfilled, (state, action) => {
            state.loading = false
            state.goals = action.payload.goals
        })
        .addCase(getSavingsGoals.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })

        // CREATE SAVINGS GOAL
        .addCase(createSavingsGoal.pending, (state) => {
            state.loading = true
            state.error = null
            state.success = false
        })
        .addCase(createSavingsGoal.fulfilled, (state, action) => {
            state.loading = false
            state.success = true
            state.goals.unshift(action.payload.goal)
        })
        .addCase(createSavingsGoal.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })

        // FUND SAVINGS GOAL
        .addCase(fundSavingsGoal.pending, (state) => {
            state.loading = true
            state.error = null
            state.success = false
        })
        .addCase(fundSavingsGoal.fulfilled, (state, action) => {
            state.loading = false
            state.success = true
            state.goals = state.goals.map((goal) =>
            goal.id === action.payload.goal.id ? action.payload.goal : goal
            )
        })
        .addCase(fundSavingsGoal.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })

        // DELETE SAVINGS GOAL
        .addCase(deleteSavingsGoal.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(deleteSavingsGoal.fulfilled, (state, action) => {
            state.loading = false
            state.goals = state.goals.filter(
            (goal) => goal.id !== action.payload
            )
        })
        .addCase(deleteSavingsGoal.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })

        // WITHDRAW SAVINGS GOAL
        .addCase(withdrawSavingsGoal.fulfilled, (state, action) => {
            state.loading = false
            state.success = true
            state.goals = state.goals.filter(
                (goal) => goal.id !== action.payload.id
            )
        })
    },
})

export const { clearSavingsState } = savingsSlice.actions
export default savingsSlice.reducer
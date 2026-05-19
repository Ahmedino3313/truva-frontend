import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios.js'

// GET ALL VIRTUAL CARDS
export const getVirtualCards = createAsyncThunk('cards/getAll', async (_, thunkAPI) => {
    try {
        const res = await API.get('/cards')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// CREATE VIRTUAL CARD
export const createVirtualCard = createAsyncThunk('cards/create', async (_, thunkAPI) => {
    try {
        const res = await API.post('/cards')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// FREEZE OR UNFREEZE CARD
export const toggleFreezeCard = createAsyncThunk('cards/freeze', async (id, thunkAPI) => {
    try {
        const res = await API.patch(`/cards/${id}/freeze`)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// DELETE VIRTUAL CARD
export const deleteVirtualCard = createAsyncThunk('cards/delete', async (id, thunkAPI) => {
    try {
        await API.delete(`/cards/${id}`)
        return id
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

const cardSlice = createSlice({
    name: 'cards',
    initialState: {
        cards: [],
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        clearCardState: (state) => {
        state.error = null
        state.success = false
        },
    },
    extraReducers: (builder) => {
        builder
        // GET ALL VIRTUAL CARDS
        .addCase(getVirtualCards.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(getVirtualCards.fulfilled, (state, action) => {
            state.loading = false
            state.cards = action.payload.cards
        })
        .addCase(getVirtualCards.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // CREATE VIRTUAL CARD
        .addCase(createVirtualCard.pending, (state) => {
            state.loading = true
            state.error = null
            state.success = false
        })
        .addCase(createVirtualCard.fulfilled, (state, action) => {
            state.loading = false
            state.success = true
            state.cards.unshift(action.payload.card)
        })
        .addCase(createVirtualCard.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // FREEZE OR UNFREEZE CARD
        .addCase(toggleFreezeCard.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(toggleFreezeCard.fulfilled, (state, action) => {
            state.loading = false
            state.cards = state.cards.map((card) =>
            card.id === action.payload.card.id ? action.payload.card : card
            )
        })
        .addCase(toggleFreezeCard.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // DELETE VIRTUAL CARD
        .addCase(deleteVirtualCard.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(deleteVirtualCard.fulfilled, (state, action) => {
            state.loading = false
            state.cards = state.cards.filter(
            (card) => card.id !== action.payload
            )
        })
        .addCase(deleteVirtualCard.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
    },
})

export const { clearCardState } = cardSlice.actions
export default cardSlice.reducer
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios.js'

// GET BALANCE
export const getBalance = createAsyncThunk('wallet/getBalance', async (_, thunkAPI) => {
    try {
        const res = await API.get('/wallet/balance')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// FUND WALLET
export const fundWallet = createAsyncThunk('wallet/fundWallet', async (fundData, thunkAPI) => {
    try {
        const res = await API.post('/wallet/fund', fundData)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// GET SAVED CARDS
export const getSavedCards = createAsyncThunk('wallet/getSavedCards', async (_, thunkAPI) => {
    try {
        const res = await API.get('/wallet/saved-cards')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// DELETE SAVED CARD
export const deleteSavedCard = createAsyncThunk('wallet/deleteSavedCard', async (id, thunkAPI) => {
    try {
        await API.delete(`/wallet/saved-cards/${id}`)
        return id
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

const walletSlice = createSlice({
    name: 'wallet',
    initialState: {
        balance: 0,
        accountNumber: '',
        savedCards: [],
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        clearWalletState: (state) => {
            state.error = null
            state.success = false
        },
    },
    extraReducers: (builder) => {
        builder
        // GET BALANCE
        .addCase(getBalance.pending, (state) => {
            state.loading = true
        })
        .addCase(getBalance.fulfilled, (state, action) => {
            state.loading = false
            state.balance = action.payload.balance
            state.accountNumber = action.payload.accountNumber
        })
        .addCase(getBalance.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // FUND WALLET
        .addCase(fundWallet.pending, (state) => {
            state.loading = true
            state.error = null
            state.success = false
        })
        .addCase(fundWallet.fulfilled, (state, action) => {
            state.loading = false
            state.balance = action.payload.newBalance
            state.success = true
        })
        .addCase(fundWallet.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // GET SAVED CARDS
        .addCase(getSavedCards.pending, (state) => {
            state.loading = true
        })
        .addCase(getSavedCards.fulfilled, (state, action) => {
            state.loading = false
            state.savedCards = action.payload.cards
        })
        .addCase(getSavedCards.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // DELETE SAVED CARD
        .addCase(deleteSavedCard.fulfilled, (state, action) => {
            state.savedCards = state.savedCards.filter(
                (card) => card.id !== action.payload
            )
        })
    },
})

export const { clearWalletState } = walletSlice.actions
export default walletSlice.reducer
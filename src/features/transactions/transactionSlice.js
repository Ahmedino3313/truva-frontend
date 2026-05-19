import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import API from '../../api/axios.js'

// GET ALL TRANSACTIONS
export const getTransactions = createAsyncThunk('transactions/getAll', async (_, thunkAPI) => {
    try {
        const res = await API.get('/transactions')
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// LOOKUP TRUVA ACCOUNT
export const lookupAccount = createAsyncThunk('transactions/lookup', async (accountNumber, thunkAPI) => {
    try {
        const res = await API.get(`/transactions/lookup/${accountNumber}`)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// SEND TO TRUVA USER
export const sendToTruvaUser = createAsyncThunk('transactions/sendTruva', async (data, thunkAPI) => {
    try {
        const res = await API.post('/transactions/send/truva', data)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// SEND TO BANK ACCOUNT
export const sendToBankAccount = createAsyncThunk('transactions/sendBank', async (data, thunkAPI) => {
    try {
        const res = await API.post('/transactions/send/bank', data)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

// SEND TO DEBIT CARD
export const sendToCard = createAsyncThunk('transactions/sendCard', async (data, thunkAPI) => {
    try {
        const res = await API.post('/transactions/send/card', data)
        return res.data
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data.message)
    }
})

const transactionSlice = createSlice({
    name: 'transactions',
    initialState: {
        transactions: [],
        lookedUpAccount: null,
        loading: false,
        sendLoading: false,
        error: null,
        success: false,
    },
    reducers: {
        clearTransactionState: (state) => {
            state.error = null
            state.success = false
            state.lookedUpAccount = null
        },
    },
    extraReducers: (builder) => {
        builder
        // GET ALL TRANSACTIONS
        .addCase(getTransactions.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(getTransactions.fulfilled, (state, action) => {
            state.loading = false
            state.transactions = action.payload.transactions
        })
        .addCase(getTransactions.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
        // LOOKUP ACCOUNT
        .addCase(lookupAccount.pending, (state) => {
            state.lookedUpAccount = null
            state.error = null
        })
        .addCase(lookupAccount.fulfilled, (state, action) => {
            state.lookedUpAccount = action.payload.user
        })
        .addCase(lookupAccount.rejected, (state, action) => {
            state.lookedUpAccount = null
            state.error = action.payload
        })
        // SEND TO TRUVA USER
        .addCase(sendToTruvaUser.pending, (state) => {
            state.sendLoading = true
            state.error = null
            state.success = false
        })
        .addCase(sendToTruvaUser.fulfilled, (state, action) => {
            state.sendLoading = false
            state.success = true
            state.transactions.unshift(action.payload.transaction)
        })
        .addCase(sendToTruvaUser.rejected, (state, action) => {
            state.sendLoading = false
            state.error = action.payload
        })
        // SEND TO BANK
        .addCase(sendToBankAccount.pending, (state) => {
            state.sendLoading = true
            state.error = null
            state.success = false
        })
        .addCase(sendToBankAccount.fulfilled, (state, action) => {
            state.sendLoading = false
            state.success = true
            state.transactions.unshift(action.payload.transaction)
        })
        .addCase(sendToBankAccount.rejected, (state, action) => {
            state.sendLoading = false
            state.error = action.payload
        })
        // SEND TO CARD
        .addCase(sendToCard.pending, (state) => {
            state.sendLoading = true
            state.error = null
            state.success = false
        })
        .addCase(sendToCard.fulfilled, (state, action) => {
            state.sendLoading = false
            state.success = true
            state.transactions.unshift(action.payload.transaction)
        })
        .addCase(sendToCard.rejected, (state, action) => {
            state.sendLoading = false
            state.error = action.payload
        })
    },
})

export const { clearTransactionState } = transactionSlice.actions
export default transactionSlice.reducer
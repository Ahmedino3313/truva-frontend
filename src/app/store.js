import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.js'
import walletReducer from '../features/wallet/walletSlice.js'
import transactionReducer from '../features/transactions/transactionSlice.js'
import cardReducer from '../features/cards/cardSlice.js'
import savingsReducer from '../features/savings/savingsSlice.js'
import notificationReducer from '../features/notifications/notificationSlice.js'
import themeReducer from '../features/theme/themeSlice.js'

const store = configureStore({
    reducer: {
        auth: authReducer,
        wallet: walletReducer,
        transactions: transactionReducer,
        cards: cardReducer,
        savings: savingsReducer,
        notifications: notificationReducer,
        theme: themeReducer,
    },
})

export default store
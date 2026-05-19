import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCreditCard, FiCheck, FiTrash2, FiPlus, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import {
    fundWallet,
    getSavedCards,
    deleteSavedCard,
    clearWalletState
} from '../features/wallet/walletSlice.js'
import { getBalance } from '../features/wallet/walletSlice.js'

function FundWallet() {
    const dispatch = useDispatch()
    const { balance, savedCards, loading, success, error } = useSelector((state) => state.wallet)
    const { isDark } = useSelector((state) => state.theme)

    const [showSuccess, setShowSuccess] = useState(false)
    const [useNewCard, setUseNewCard] = useState(false)
    const [selectedCard, setSelectedCard] = useState(null)
    const [cvv, setCvv] = useState('')
    const [amount, setAmount] = useState('')
    const [saveCard, setSaveCard] = useState(false)

    const [newCard, setNewCard] = useState({
        cardHolderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
    })

    useEffect(() => {
        dispatch(getBalance())
        dispatch(getSavedCards())
    }, [dispatch])

    useEffect(() => {
        if (success) {
            setShowSuccess(true)
            dispatch(getBalance())
            setTimeout(() => {
                setShowSuccess(false)
                dispatch(clearWalletState())
                setAmount('')
                setCvv('')
                setSelectedCard(null)
                setNewCard({
                    cardHolderName: '',
                    cardNumber: '',
                    expiryMonth: '',
                    expiryYear: '',
                    cvv: '',
                })
            }, 3000)
        }
    }, [success, dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(clearWalletState())
        }
    }, [error, dispatch])

    const handleFundWithSaved = (e) => {
        e.preventDefault()
        if (!selectedCard) return toast.error('Please select a card')
        if (!cvv) return toast.error('Please enter CVV')
        if (!amount || amount <= 0) return toast.error('Please enter a valid amount')

        dispatch(fundWallet({
            amount: Number(amount),
            cardHolderName: selectedCard.cardHolderName,
            cardNumber: `**** **** **** ${selectedCard.lastFour}`,
            expiryMonth: selectedCard.expiryMonth,
            expiryYear: selectedCard.expiryYear,
            cvv,
            saveCard: false,
        }))
    }

    const handleFundWithNew = (e) => {
        e.preventDefault()
        if (!amount || amount <= 0) return toast.error('Please enter a valid amount')

        dispatch(fundWallet({
            amount: Number(amount),
            cardHolderName: newCard.cardHolderName,
            cardNumber: newCard.cardNumber,
            expiryMonth: newCard.expiryMonth,
            expiryYear: newCard.expiryYear,
            cvv: newCard.cvv,
            saveCard,
        }))
    }

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
    const inputClass = `w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/20 focus:border-[#00c6ff] ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`
    const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`

    const quickAmounts = [50, 100, 250, 500, 1000]

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i)
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

    return (
        <div className="max-w-lg mx-auto">

            {/* Success overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    >
                        <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-4">
                            <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center mx-auto mb-4">
                                <FiCheck className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Wallet Funded!
                            </h3>
                            <p className="text-gray-500 text-sm">
                                ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} has been added to your wallet
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Balance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`rounded-2xl border p-5 mb-5 ${cardBg}`}
            >
                <p className={`text-xs ${textSecondary} mb-1`}>Current Balance</p>
                <p className={`text-3xl font-bold ${textPrimary}`}>
                    ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
            </motion.div>

            {/* Amount */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`rounded-2xl border p-5 mb-5 ${cardBg}`}
            >
                <label className={labelClass}>Amount to Fund</label>
                <div className="relative mb-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`${inputClass} pl-8`}
                    />
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 flex-wrap">
                    {quickAmounts.map((amt) => (
                        <button
                            key={amt}
                            type="button"
                            onClick={() => setAmount(amt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${amount == amt
                                ? 'bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white'
                                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            ${amt}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Saved Cards */}
            {savedCards.length > 0 && !useNewCard && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`rounded-2xl border p-5 mb-5 ${cardBg}`}
                >
                    <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>
                        Saved Cards
                    </h3>

                    <div className="space-y-3">
                        {savedCards.map((card) => (
                            <motion.div
                                key={card.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedCard(card)}
                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${selectedCard?.id === card.id
                                    ? 'border-[#7b2ff7] bg-[#7b2ff7]/5'
                                    : isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {/* Card icon */}
                                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center shrink-0">
                                    <FiCreditCard className="text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold ${textPrimary}`}>
                                        {card.cardType.toUpperCase()} •••• {card.lastFour}
                                    </p>
                                    <p className={`text-xs ${textSecondary}`}>
                                        {card.cardHolderName} · {card.expiryMonth}/{card.expiryYear}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {selectedCard?.id === card.id && (
                                        <div className="w-5 h-5 rounded-full bg-[#7b2ff7] flex items-center justify-center">
                                            <FiCheck className="text-white text-xs" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            dispatch(deleteSavedCard(card.id))
                                            if (selectedCard?.id === card.id) setSelectedCard(null)
                                        }}
                                        className="text-red-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CVV for saved card */}
                    <AnimatePresence>
                        {selectedCard && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-4"
                            >
                                <label className={labelClass}>
                                    Enter CVV for •••• {selectedCard.lastFour}
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        maxLength={3}
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                        placeholder="•••"
                                        className={`${inputClass} pl-11 max-w-30`}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Fund with saved card button */}
                    {selectedCard && (
                        <motion.button
                            type="button"
                            onClick={handleFundWithSaved}
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full mt-4 py-3.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm shadow-lg shadow-[#7b2ff7]/25 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            ) : <FiCreditCard />}
                            {loading ? 'Processing...' : `Fund $${amount || '0'} with •••• ${selectedCard.lastFour}`}
                        </motion.button>
                    )}

                    {/* Use new card */}
                    <button
                        type="button"
                        onClick={() => {
                            setUseNewCard(true)
                            setSelectedCard(null)
                        }}
                        className="w-full mt-3 py-3 rounded-xl border border-dashed text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 border-gray-300 text-gray-500 hover:border-[#7b2ff7] hover:text-[#7b2ff7]"
                    >
                        <FiPlus />
                        Use a different card
                    </button>
                </motion.div>
            )}

            {/* New Card Form */}
            {(useNewCard || savedCards.length === 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`rounded-2xl border p-5 ${cardBg}`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-semibold ${textPrimary}`}>Card Details</h3>
                        {savedCards.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setUseNewCard(false)}
                                className="text-xs text-[#7b2ff7] hover:underline"
                            >
                                Use saved card
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleFundWithNew} className="space-y-4">

                        {/* Cardholder name */}
                        <div>
                            <label className={labelClass}>Cardholder Name</label>
                            <input
                                type="text"
                                value={newCard.cardHolderName}
                                onChange={(e) => setNewCard({ ...newCard, cardHolderName: e.target.value })}
                                placeholder="Name on card"
                                required
                                className={inputClass}
                            />
                        </div>

                        {/* Card number */}
                        <div>
                            <label className={labelClass}>Card Number</label>
                            <div className="relative">
                                <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    maxLength={19}
                                    value={newCard.cardNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 16)
                                        const formatted = val.match(/.{1,4}/g)?.join(' ') || val
                                        setNewCard({ ...newCard, cardNumber: formatted })
                                    }}
                                    placeholder="0000 0000 0000 0000"
                                    required
                                    className={`${inputClass} pl-11`}
                                />
                            </div>
                        </div>

                        {/* Expiry + CVV */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className={labelClass}>Month</label>
                                <select
                                    value={newCard.expiryMonth}
                                    onChange={(e) => setNewCard({ ...newCard, expiryMonth: e.target.value })}
                                    required
                                    className={inputClass}
                                >
                                    <option value="">MM</option>
                                    {months.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Year</label>
                                <select
                                    value={newCard.expiryYear}
                                    onChange={(e) => setNewCard({ ...newCard, expiryYear: e.target.value })}
                                    required
                                    className={inputClass}
                                >
                                    <option value="">YY</option>
                                    {years.map(y => (
                                        <option key={y} value={y}>{String(y).slice(-2)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>CVV</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                    <input
                                        type="password"
                                        maxLength={3}
                                        value={newCard.cvv}
                                        onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                                        placeholder="•••"
                                        required
                                        className={`${inputClass} pl-9`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save card toggle */}
                        <div
                            onClick={() => setSaveCard(!saveCard)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${saveCard
                                ? 'border-[#7b2ff7] bg-[#7b2ff7]/5'
                                : isDark ? 'border-gray-700' : 'border-gray-200'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${saveCard ? 'bg-[#7b2ff7] border-[#7b2ff7]' : 'border-gray-300'}`}>
                                {saveCard && <FiCheck className="text-white text-xs" />}
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${textPrimary}`}>Save card for future payments</p>
                                <p className={`text-xs ${textSecondary}`}>Only last 4 digits stored securely</p>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full py-3.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm shadow-lg shadow-[#7b2ff7]/25 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            ) : <FiCreditCard />}
                            {loading ? 'Processing...' : `Fund Wallet $${amount || '0'}`}
                        </motion.button>

                    </form>
                </motion.div>
            )}

        </div>
    )
}

export default FundWallet
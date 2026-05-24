import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiUser, FiDollarSign, FiCreditCard, FiCheck, FiX } from 'react-icons/fi'
import { BsBank2 } from 'react-icons/bs'
import toast from 'react-hot-toast'
import { sendToTruvaUser, sendToBankAccount, sendToCard, lookupAccount, clearTransactionState } from '../features/transactions/transactionSlice.js'
import { getBalance } from '../features/wallet/walletSlice.js'
import PinModal from '../components/PinModal.jsx'

const tabs = [
    { id: 'truva', label: 'TRUVA', icon: FiUser },
    { id: 'bank', label: 'Bank', icon: BsBank2 },
    { id: 'card', label: 'Card', icon: FiCreditCard },
]

// Simulates account name verification
const firstNames = ['James', 'Michael', 'Robert', 'David', 'William', 'Richard',
    'Joseph', 'Thomas', 'Charles', 'Christopher', 'Sarah', 'Emily',
    'Jessica', 'Ashley', 'Amanda', 'Melissa', 'Stephanie', 'Nicole']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
    'Miller', 'Davis', 'Martinez', 'Wilson', 'Anderson', 'Taylor']

const generateAccountName = (accountNumber) => {
    const seed = accountNumber.split('').reduce((a, b) => a + parseInt(b), 0)
    const first = firstNames[seed % firstNames.length]
    const last = lastNames[(seed * 3) % lastNames.length]
    return `${first} ${last}`
}

function SendMoney() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { balance } = useSelector((state) => state.wallet)
    const { sendLoading, lookedUpAccount, success, error } = useSelector((state) => state.transactions)
    const { isDark } = useSelector((state) => state.theme)

    const [activeTab, setActiveTab] = useState('truva')
    const [showSuccess, setShowSuccess] = useState(false)

    const [banks, setBanks] = useState([])
    const [bankSearch, setBankSearch] = useState('')

    const [verifyingAccount, setVerifyingAccount] = useState(false)
    const [verifiedBankAccount, setVerifiedBankAccount] = useState(null)

    const [showBankDropdown, setShowBankDropdown] = useState(false)

    const [showPinModal, setShowPinModal] = useState(false)
    const [pendingSubmit, setPendingSubmit] = useState(null)

    // TRUVA form
    const [truvaForm, setTruvaForm] = useState({ accountNumber: '', amount: '', note: '' })

    // Bank form
    const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '', amount: '', note: '' })

    // Card form
    const [cardForm, setCardForm] = useState({ cardHolderName: '', cardNumber: '', amount: '', note: '' })

    useEffect(() => {
        dispatch(getBalance())
    }, [dispatch])

    // Fetch bank names
    useEffect(() => {
        fetch('https://www.gov.uk/bank-holidays.json')
            .then(() => {
                // Fallback to FDIC API for US banks
            })
        
        fetch('https://banks.data.fdic.gov/api/institutions?filters=ACTIVE%3A1&fields=NAME&limit=100&sort_by=ASSET&sort_order=DESC&output=json')
            .then(res => res.json())
            .then(data => {
                const bankNames = data.data.map(b => b.data.NAME)
                setBanks(bankNames)
            })
            .catch(() => {
                // fallback if API fails
                setBanks([
                    'JPMorgan Chase Bank', 'Bank of America', 'Wells Fargo Bank',
                    'Citibank', 'US Bank', 'PNC Bank', 'Goldman Sachs Bank',
                    'TD Bank', 'Capital One', 'Ally Bank', 'Truist Bank',
                    'Charles Schwab Bank', 'American Express Bank', 'Discover Bank'
                ])
            })
    }, [])

    useEffect(() => {
        if (success) {
            setShowSuccess(true)
            dispatch(getBalance())
            setTimeout(() => {
                setShowSuccess(false)
                dispatch(clearTransactionState())
                setTruvaForm({ accountNumber: '', amount: '', note: '' })
                setBankForm({ bankName: '', accountNumber: '', accountName: '', amount: '', note: '' })
                setCardForm({ cardHolderName: '', cardNumber: '', amount: '', note: '' })
            }, 3000)
        }
    }, [success, dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(clearTransactionState())
        }
    }, [error, dispatch])

    // Auto veryfify when Bank Account Number is 10
    useEffect(() => {
    if (bankForm.accountNumber.length >= 10 && bankForm.bankName) {
        setVerifyingAccount(true)
        setVerifiedBankAccount(null)
        // Simulate bank account verification (2 seconds like real apps)
        setTimeout(() => {
            setVerifiedBankAccount({
                name: generateAccountName(bankForm.accountNumber),
            })
            setBankForm(prev => ({
                ...prev,
                accountName: generateAccountName(bankForm.accountNumber)
            }))
            setVerifyingAccount(false)
        }, 2000)
    } else {
        setVerifiedBankAccount(null)
    }
    }, [bankForm.accountNumber, bankForm.bankName])


    // Lookup truva account when 10 digits entered
    const [lookingUp, setLookingUp] = useState(false)
    useEffect(() => {
        if (truvaForm.accountNumber.length === 10) {
            setLookingUp(true)
            dispatch(lookupAccount(truvaForm.accountNumber)).finally(() => {
                setLookingUp(false)
            })
        }
    }, [truvaForm.accountNumber, dispatch])


    const handleTruvaSubmit = (e) => {
        e.preventDefault()
        if (truvaForm.amount > balance) return toast.error('Insufficient balance')
        setPendingSubmit('truva')
        setShowPinModal(true)
    }

    const handleBankSubmit = (e) => {
        e.preventDefault()
        if (bankForm.amount > balance) return toast.error('Insufficient balance')
        setPendingSubmit('bank')
        setShowPinModal(true)
    }

    const handleCardSubmit = (e) => {
        e.preventDefault()
        if (cardForm.amount > balance) return toast.error('Insufficient balance')
        setPendingSubmit('card')
        setShowPinModal(true)
    }

    const handlePinSuccess = () => {
        if (pendingSubmit === 'truva') dispatch(sendToTruvaUser(truvaForm))
        if (pendingSubmit === 'bank') dispatch(sendToBankAccount(bankForm))
        if (pendingSubmit === 'card') dispatch(sendToCard(cardForm))
        setPendingSubmit(null)
    }

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
    const inputClass = `w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/20 focus:border-[#00c6ff] ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`
    const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`

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
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Transfer Successful!</h3>
                            <p className="text-gray-500 text-sm">Your money has been sent successfully</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`rounded-2xl border p-5 mb-5 ${cardBg}`}
            >
                <p className={`text-xs ${textSecondary} mb-1`}>Available Balance</p>
                <p className={`text-3xl font-bold ${textPrimary}`}>
                    ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`rounded-2xl border ${cardBg}`}
            >
                {/* Tabs */}
                <div className={`flex border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium cursor-pointer transition-all duration-200 relative ${activeTab === tab.id
                                ? 'text-[#7b2ff7]'
                                : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon className="text-base" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#00c6ff] to-[#7b2ff7]"
                                />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    <AnimatePresence mode="wait">

                        {/* TRUVA Tab */}
                        {activeTab === 'truva' && (
                            <motion.form
                                key="truva"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleTruvaSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className={labelClass}>Account Number</label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        value={truvaForm.accountNumber}
                                        onChange={(e) => setTruvaForm({ ...truvaForm, accountNumber: e.target.value })}
                                        placeholder="Enter 10-digit account number"
                                        required
                                        className={inputClass}
                                    />
                                    
                                    {/* Account lookup result */}
                                    <AnimatePresence>
                                    {/* Looking up spinner */}
                                    {lookingUp && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-2 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
                                        >
                                            <svg className="animate-spin h-4 w-4 text-[#7b2ff7]" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            <p className="text-sm text-gray-500">Verifying account...</p>
                                        </motion.div>
                                    )}

                                    {/* Account found */}
                                    {lookedUpAccount && !lookingUp && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-2 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                {lookedUpAccount.fullName.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-green-700">{lookedUpAccount.fullName}</p>
                                                <p className="text-xs text-green-500">TRUVA Account verified!</p>
                                            </div>
                                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                                <FiCheck className="text-white text-xs" />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Account not found */}
                                    {!lookedUpAccount && !lookingUp && truvaForm.accountNumber.length === 10 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="mt-2 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2"
                                        >
                                            <FiX className="text-red-500 shrink-0" />
                                            <p className="text-sm text-red-600">Account number not found</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                </div>

                                <div>
                                    <label className={labelClass}>Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={truvaForm.amount}
                                            onChange={(e) => setTruvaForm({ ...truvaForm, amount: e.target.value })}
                                            placeholder="0.00"
                                            required
                                            className={`${inputClass} pl-8`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Note <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={truvaForm.note}
                                        onChange={(e) => setTruvaForm({ ...truvaForm, note: e.target.value })}
                                        placeholder="What's this for?"
                                        className={inputClass}
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={sendLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm  cursor-pointer shadow-lg shadow-[#7b2ff7]/25 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sendLoading ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : <FiSend />}
                                    {sendLoading ? 'Sending...' : 'Send Money'}
                                </motion.button>
                            </motion.form>
                        )}

                        {/* Bank Tab */}
                        {activeTab === 'bank' && (
                            <motion.form
                                key="bank"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleBankSubmit}
                                className="space-y-4"
                            >
                                <div className="relative">
                                    <label className={labelClass}>Bank Name</label>
                                    <input
                                        type="text"
                                        value={bankSearch}
                                        onChange={(e) => {
                                            setBankSearch(e.target.value)
                                            setBankForm({ ...bankForm, bankName: e.target.value })
                                            setShowBankDropdown(true)
                                        }}
                                        placeholder="Search for a bank..."
                                        required
                                        className={inputClass}
                                    />
                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {showBankDropdown && bankSearch.length > 1 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className={`absolute z-20 w-full mt-1 rounded-xl border shadow-lg max-h-48 overflow-y-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                                            >
                                                {banks
                                                    .filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()))
                                                    .slice(0, 8)
                                                    .map((bank) => (
                                                        <button
                                                            key={bank}
                                                            type="button"
                                                            onClick={() => {
                                                                setBankForm({ ...bankForm, bankName: bank })
                                                                setBankSearch(bank)
                                                                setShowBankDropdown(false)
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                                        >
                                                            {bank}
                                                        </button>
                                                    ))
                                                }
                                                {banks.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase())).length === 0 && (
                                                    <p className="text-center text-gray-400 text-sm py-3">No bank found</p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label className={labelClass}>Account Number</label>
                                    <input
                                        type="text"
                                        value={bankForm.accountNumber}
                                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                        placeholder="Enter account number"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Account Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={bankForm.accountName}
                                            onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                                            placeholder="Will be verified automatically"
                                            readOnly={!!verifiedBankAccount}
                                            className={`${inputClass} ${verifiedBankAccount ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
                                        />
                                        {/* Verifying spinner */}
                                        {verifyingAccount && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <svg className="animate-spin h-4 w-4 text-[#7b2ff7]" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                </svg>
                                            </div>
                                        )}
                                        {/* Verified checkmark */}
                                        {verifiedBankAccount && !verifyingAccount && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                <FiCheck className="text-white text-xs" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Verified message */}
                                    <AnimatePresence>
                                        {verifiedBankAccount && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-xs text-green-600 mt-1.5 flex items-center gap-1"
                                            >
                                                <FiCheck size={10} /> Account verified successfully
                                            </motion.p>
                                        )}
                                        {!verifiedBankAccount && bankForm.accountNumber.length >= 10 && !verifyingAccount && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-xs text-gray-400 mt-1.5"
                                            >
                                                Enter bank name first to verify
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label className={labelClass}>Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={bankForm.amount}
                                            onChange={(e) => setBankForm({ ...bankForm, amount: e.target.value })}
                                            placeholder="0.00"
                                            required
                                            className={`${inputClass} pl-8`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Note <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={bankForm.note}
                                        onChange={(e) => setBankForm({ ...bankForm, note: e.target.value })}
                                        placeholder="What's this for?"
                                        className={inputClass}
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={sendLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm shadow-lg shadow-[#7b2ff7]/25 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sendLoading ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : <BsBank2 />}
                                    {sendLoading ? 'Sending...' : 'Send to Bank'}
                                </motion.button>
                            </motion.form>
                        )}

                        {/* Card Tab */}
                        {activeTab === 'card' && (
                            <motion.form
                                key="card"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleCardSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <label className={labelClass}>Cardholder Name</label>
                                    <input
                                        type="text"
                                        value={cardForm.cardHolderName}
                                        onChange={(e) => setCardForm({ ...cardForm, cardHolderName: e.target.value })}
                                        placeholder="Name on card"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Card Number</label>
                                    <input
                                        type="text"
                                        maxLength={19}
                                        value={cardForm.cardNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 16)
                                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val
                                            setCardForm({ ...cardForm, cardNumber: formatted })
                                        }}
                                        placeholder="0000 0000 0000 0000"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={cardForm.amount}
                                            onChange={(e) => setCardForm({ ...cardForm, amount: e.target.value })}
                                            placeholder="0.00"
                                            required
                                            className={`${inputClass} pl-8`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Note <span className="text-gray-400 font-normal">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={cardForm.note}
                                        onChange={(e) => setCardForm({ ...cardForm, note: e.target.value })}
                                        placeholder="What's this for?"
                                        className={inputClass}
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={sendLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm shadow-lg shadow-[#7b2ff7]/25 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {sendLoading ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : <FiCreditCard />}
                                    {sendLoading ? 'Sending...' : 'Send to Card'}
                                </motion.button>
                            </motion.form>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
            
            <PinModal
                isOpen={showPinModal}
                onClose={() => setShowPinModal(false)}
                onSuccess={handlePinSuccess}
                title="Enter Transaction PIN"
            />
        </div>
    )
}

export default SendMoney
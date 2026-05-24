import API from '../api/axios.js'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getBalance } from '../features/wallet/walletSlice.js'
import { getTransactions } from '../features/transactions/transactionSlice.js'
import { FiSend, FiDollarSign, FiCreditCard, FiTarget, FiEye, FiEyeOff, FiArrowUpRight, FiArrowDownLeft, FiChevronRight, FiAlertCircle, FiX } from 'react-icons/fi'
import { RiQrCodeLine } from 'react-icons/ri'
import toast from 'react-hot-toast'


const quickActions = [
    { label: 'Send', icon: FiSend, path: '/send', color: 'from-[#00c6ff] to-[#0072ff]' },
    { label: 'Fund', icon: FiDollarSign, path: '/fund', color: 'from-[#7b2ff7] to-[#9d50bb]' },
    { label: 'Cards', icon: FiCreditCard, path: '/cards', color: 'from-[#f093fb] to-[#f5576c]' },
    { label: 'QR Pay', icon: RiQrCodeLine, path: '/qr', color: 'from-[#4facfe] to-[#00f2fe]' },
    { label: 'Savings', icon: FiTarget, path: '/savings', color: 'from-[#43e97b] to-[#38f9d7]' },
]


function Dashboard() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { balance } = useSelector((state) => state.wallet)
    const { transactions } = useSelector((state) => state.transactions)
    const { isDark } = useSelector((state) => state.theme)
    const [showBalance, setShowBalance] = useState(true)
    const [verifyLoading, setVerifyLoading] = useState(false)
    const [showVerifyModal, setShowVerifyModal] = useState(false)
    const [verifyCode, setVerifyCode] = useState('')
    const [codeSent, setCodeSent] = useState(false)

        useEffect(() => {
        dispatch(getBalance())
        dispatch(getTransactions())
    }, [dispatch])

    const recentTransactions = transactions.slice(0, 5)

    const handleSendVerification = async () => {
        try {
            setVerifyLoading(true)
            await API.post('/auth/send-verification')
            setCodeSent(true)
            setShowVerifyModal(true)
            toast.success('Verification code sent to your email!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send code')
        } finally {
            setVerifyLoading(false)
        }
    }

    const handleVerifyEmail = async () => {
        try {
            setVerifyLoading(true)
            await API.post('/auth/verify-email', { code: verifyCode })
            toast.success('Email verified successfully!')
            setShowVerifyModal(false)
            dispatch(getMe())
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid code')
        } finally {
            setVerifyLoading(false)
        }
    }


    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
    const subBg = isDark ? 'bg-gray-800' : 'bg-gray-50'

    return (
        <div className="space-y-5 max-w-4xl mx-auto">
            {/* Email verification modal */}
            <AnimatePresence>
                {showVerifyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Verify your email</h3>
                                <button onClick={() => setShowVerifyModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <FiX size={16} />
                                </button>
                            </div>
                            <p className="text-gray-500 text-sm mb-5">
                                Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{user?.email}</span>
                            </p>
                            <input
                                type="text"
                                maxLength={6}
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value)}
                                placeholder="000000"
                                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 mb-4"
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleVerifyEmail}
                                disabled={verifyLoading || verifyCode.length !== 6}
                                className="w-full py-3.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {verifyLoading ? (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                ) : null}
                                {verifyLoading ? 'Verifying...' : 'Verify Email'}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unverified email banner */}
            {user && !user.isVerified && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                    <div className="flex items-center gap-3">
                        <FiAlertCircle className="text-yellow-500 text-xl shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-yellow-800">Verify your email</p>
                            <p className="text-xs text-yellow-600">Verify your email to secure your account</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSendVerification}
                        disabled={verifyLoading}
                        className="px-4 py-2 rounded-xl bg-yellow-500 text-white text-xs font-semibold hover:bg-yellow-600 transition-colors shrink-0 disabled:opacity-50"
                    >
                        {verifyLoading ? 'Sending...' : 'Verify now'}
                    </motion.button>
                </motion.div>
            )}

            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-3xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-linear-to-br from-[#00c6ff] to-[#7b2ff7]" />
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                        backgroundSize: '60px 60px'
                    }}
                />

                <div className="relative z-10 p-6 lg:p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-white/70 text-sm mb-1">Total Balance</p>
                            <div className="flex items-center gap-3">
                                <h2 className="text-white text-3xl font-bold tracking-tight">
                                    {showBalance
                                        ? `$${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                        : '••••••••'
                                    }
                                </h2>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    {showBalance ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-white/70 text-xs mb-1">Account</p>
                            <p className="text-white font-mono font-semibold text-sm">
                                {user?.accountNumber}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/60 text-xs">Account holder</p>
                            <p className="text-white font-semibold">{user?.fullName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center overflow-hidden">
                                <img src="/src/assets/truva-logo.png" alt="TRUVA" className="w-6 h-6 object-contain" />
                            </div>
                            <span className="text-white font-bold text-sm">TRUVA</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`rounded-2xl border p-5 ${cardBg}`}
            >
                <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>Quick Actions</h3>
                <div className="flex justify-between gap-2">
                    {quickActions.map((action, i) => (
                        <motion.div
                            key={action.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                        >
                            <Link to={action.path} className="flex flex-col items-center gap-2">
                                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                                    <action.icon className="text-white text-xl" />
                                </div>
                                <span className={`text-xs font-medium ${textSecondary}`}>{action.label}</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
            >
                <div className={`rounded-2xl border p-4 ${cardBg}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                            <FiArrowDownLeft className="text-green-500" />
                        </div>
                        <span className={`text-xs ${textSecondary}`}>Money In</span>
                    </div>
                    <p className={`text-xl font-bold ${textPrimary}`}>
                        ${transactions
                            .filter(t => t.receiverId === user?.id)
                            .reduce((sum, t) => sum + t.amount, 0)
                            .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className={`rounded-2xl border p-4 ${cardBg}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                            <FiArrowUpRight className="text-red-500" />
                        </div>
                        <span className={`text-xs ${textSecondary}`}>Money Out</span>
                    </div>
                    <p className={`text-xl font-bold ${textPrimary}`}>
                        ${transactions
                            .filter(t => t.senderId === user?.id && t.type === 'send')
                            .reduce((sum, t) => sum + t.amount, 0)
                            .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`rounded-2xl border ${cardBg}`}
            >
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <h3 className={`text-sm font-semibold ${textPrimary}`}>Recent Transactions</h3>
                    <Link
                        to="/transactions"
                        className="text-xs text-[#7b2ff7] font-medium flex items-center gap-1 hover:underline"
                    >
                        See all <FiChevronRight size={12} />
                    </Link>
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="px-5 pb-5 text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                            <FiDollarSign className="text-gray-400 text-xl" />
                        </div>
                        <p className={`text-sm ${textSecondary}`}>No transactions yet</p>
                        <p className="text-xs text-gray-400 mt-1">Send or receive money to get started</p>
                    </div>
                ) : (
                    <div className="px-3 pb-3">
                        {recentTransactions.map((tx, i) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.05 }}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-colors hover:${subBg}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.receiverId === user?.id ? 'bg-green-50' : 'bg-red-50'}`}>
                                    {tx.receiverId === user?.id
                                        ? <FiArrowDownLeft className="text-green-500" />
                                        : <FiArrowUpRight className="text-red-500" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${textPrimary}`}>
                                        {tx.receiverId === user?.id
                                            ? `From ${tx.sender?.fullName || 'Unknown'}`
                                            : tx.note || 'Transfer'
                                        }
                                    </p>
                                    <p className={`text-xs truncate ${textSecondary}`}>
                                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <p className={`text-sm font-bold shrink-0 ${tx.receiverId === user?.id ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.receiverId === user?.id ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

        </div>
    )
}

export default Dashboard
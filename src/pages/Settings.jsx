import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { toggleTheme } from '../features/theme/themeSlice.js'
import { getMe, logout } from '../features/auth/authSlice.js'
import { getBalance } from '../features/wallet/walletSlice.js'
import { FiUser, FiMoon, FiSun, FiLock, FiLogOut, FiChevronRight, FiShield, FiBell, FiCreditCard, FiHelpCircle, FiCopy, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios.js'

function Settings() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const { balance } = useSelector((state) => state.wallet)
    const { isDark } = useSelector((state) => state.theme)

    const [copied, setCopied] = useState(false)
    const [showPinModal, setShowPinModal] = useState(false)
    const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' })
    const [pinLoading, setPinLoading] = useState(false)

    useEffect(() => {
        dispatch(getMe())
        dispatch(getBalance())
    }, [dispatch])

    const handleCopy = () => {
        navigator.clipboard.writeText(user?.accountNumber)
        setCopied(true)
        toast.success('Account number copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleLogout = () => {
        dispatch(logout())
        toast.success('Logged out successfully')
        navigate('/login')
    }

    const handlePinChange = async (e) => {
        e.preventDefault()
        if (pinForm.newPin !== pinForm.confirmPin) {
            return toast.error('PINs do not match')
        }
        if (pinForm.newPin.length !== 4) {
            return toast.error('PIN must be 4 digits')
        }
        try {
            setPinLoading(true)
            await API.patch('/auth/pin', {
                currentPin: pinForm.currentPin,
                newPin: pinForm.newPin,
            })
            toast.success('Transaction PIN updated!')
            setShowPinModal(false)
            setPinForm({ currentPin: '', newPin: '', confirmPin: '' })
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update PIN')
        } finally {
            setPinLoading(false)
        }
    }

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
    const inputClass = `w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/20 focus:border-[#00c6ff] ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`

    return (
        <div className="max-w-lg mx-auto space-y-5">

            {/* PIN Modal */}
            {showPinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Change Transaction PIN</h3>
                        <p className="text-gray-500 text-sm mb-5">Enter a 4-digit PIN for transactions</p>

                        <form onSubmit={handlePinChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current PIN</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={pinForm.currentPin}
                                    onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                                    placeholder="••••"
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New PIN</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={pinForm.newPin}
                                    onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                                    placeholder="••••"
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New PIN</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={pinForm.confirmPin}
                                    onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                                    placeholder="••••"
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPinModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    type="submit"
                                    disabled={pinLoading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white text-sm font-semibold disabled:opacity-50"
                                >
                                    {pinLoading ? 'Saving...' : 'Save PIN'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className={`text-2xl font-bold ${textPrimary}`}>Settings</h1>
                <p className={`text-sm ${textSecondary}`}>Manage your account preferences</p>
            </motion.div>

            {/* Profile card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`rounded-2xl border p-5 ${cardBg}`}
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-lg font-bold truncate ${textPrimary}`}>{user?.fullName}</p>
                        <p className={`text-sm truncate ${textSecondary}`}>{user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className={`text-xs font-mono ${textSecondary}`}>{user?.accountNumber}</p>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCopy}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
                            >
                                {copied ? <FiCheck size={11} /> : <FiCopy size={11} />}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Balance */}
                <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Available Balance</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>
                        ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`rounded-2xl border overflow-hidden ${cardBg}`}
            >
                <p className={`text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-2 ${textSecondary}`}>
                    Preferences
                </p>

                {/* Dark mode */}
                <div className={`flex items-center justify-between px-5 py-3.5 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            {isDark ? <FiMoon className="text-[#7b2ff7]" /> : <FiSun className="text-yellow-500" />}
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${textPrimary}`}>Dark Mode</p>
                            <p className={`text-xs ${textSecondary}`}>{isDark ? 'On' : 'Off'}</p>
                        </div>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => dispatch(toggleTheme())}
                        className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${isDark ? 'bg-linear-to-r from-[#00c6ff] to-[#7b2ff7]' : 'bg-gray-200'}`}
                    >
                        <motion.div
                            animate={{ x: isDark ? 24 : 2 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
                        />
                    </motion.button>
                </div>

                {/* Notifications */}
                <div className={`flex items-center justify-between px-5 py-3.5 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <FiBell className="text-blue-500" />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${textPrimary}`}>Notifications</p>
                            <p className={`text-xs ${textSecondary}`}>Transaction alerts</p>
                        </div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                    </div>
                </div>

                {/* Biometric */}
                <div className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <FiShield className="text-green-500" />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${textPrimary}`}>Biometric Login</p>
                            <p className={`text-xs ${textSecondary}`}>Face ID / Fingerprint</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
                    </div>
                </div>
            </motion.div>

            {/* Security */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`rounded-2xl border overflow-hidden ${cardBg}`}
            >
                <p className={`text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-2 ${textSecondary}`}>
                    Security
                </p>

                <button
                    onClick={() => setShowPinModal(true)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 border-b transition-colors hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'} ${isDark ? 'border-gray-800' : 'border-gray-100'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <FiLock className="text-orange-500" />
                        </div>
                        <div className="text-left">
                            <p className={`text-sm font-medium ${textPrimary}`}>Transaction PIN</p>
                            <p className={`text-xs ${textSecondary}`}>Change your 4-digit PIN</p>
                        </div>
                    </div>
                    <FiChevronRight className={textSecondary} />
                </button>

                <button
                    className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <FiCreditCard className="text-purple-500" />
                        </div>
                        <div className="text-left">
                            <p className={`text-sm font-medium ${textPrimary}`}>Saved Cards</p>
                            <p className={`text-xs ${textSecondary}`}>Manage your payment cards</p>
                        </div>
                    </div>
                    <FiChevronRight className={textSecondary} />
                </button>
            </motion.div>

            {/* Support */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`rounded-2xl border overflow-hidden ${cardBg}`}
            >
                <p className={`text-xs font-semibold uppercase tracking-wider px-5 pt-4 pb-2 ${textSecondary}`}>
                    Support
                </p>

                <button
                    className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <FiHelpCircle className="text-blue-500" />
                        </div>
                        <div className="text-left">
                            <p className={`text-sm font-medium ${textPrimary}`}>Help Center</p>
                            <p className={`text-xs ${textSecondary}`}>FAQs and support</p>
                        </div>
                    </div>
                    <FiChevronRight className={textSecondary} />
                </button>
            </motion.div>

            {/* App info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className={`rounded-2xl border p-4 ${cardBg}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow flex items-center justify-center overflow-hidden">
                            <img src="/src/assets/truva-logo.PNG" alt="TRUVA" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                            <p className={`text-sm font-semibold ${textPrimary}`}>TRUVA</p>
                            <p className={`text-xs ${textSecondary}`}>Version 1.0.0</p>
                        </div>
                    </div>
                    <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-medium">
                        Up to date
                    </span>
                </div>
            </motion.div>

            {/* Logout */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="w-full py-3.5 rounded-2xl bg-red-50 text-red-500 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            >
                <FiLogOut />
                Log out
            </motion.button>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className={`text-center text-xs ${textSecondary} pb-4`}
            >
                &copy; {new Date().getFullYear()} TRUVA · FDIC Insured · 256-bit encryption
            </motion.p>

        </div>
    )
}

export default Settings
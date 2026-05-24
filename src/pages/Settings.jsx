import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { toggleTheme } from '../features/theme/themeSlice.js'
import { getMe, logout } from '../features/auth/authSlice.js'
import { getBalance } from '../features/wallet/walletSlice.js'
import {
    FiUser, FiMoon, FiSun, FiLock, FiLogOut,
    FiChevronRight, FiShield, FiBell, FiCreditCard,
    FiHelpCircle, FiCopy, FiCheck, FiX, FiCamera,
    FiPhone, FiMapPin, FiEdit2
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios.js'

function Settings() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const { balance } = useSelector((state) => state.wallet)
    const { isDark } = useSelector((state) => state.theme)
    const fileRef = useRef(null)

    const [copied, setCopied] = useState(false)
    const [showPinModal, setShowPinModal] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [biometricEnabled, setBiometricEnabled] = useState(
        localStorage.getItem('truva_biometric') === 'true'
    )
    const [pinForm, setPinForm] = useState({
        currentPin: '', newPin: '', confirmPin: ''
    })
    const [pinLoading, setPinLoading] = useState(false)
    const [profileForm, setProfileForm] = useState({
        fullName: '', phone: '', address: ''
    })
    const [profileLoading, setProfileLoading] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)

    useEffect(() => {
        dispatch(getMe())
        dispatch(getBalance())
    }, [dispatch])

    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.fullName || '',
                phone: user.phone || '',
                address: user.address || '',
            })
        }
    }, [user])

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
    const inputClass = `w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/20 focus:border-[#00c6ff] ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`
    const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`

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
        if (pinForm.newPin !== pinForm.confirmPin) return toast.error('PINs do not match')
        if (pinForm.newPin.length !== 4) return toast.error('PIN must be 4 digits')
        try {
            setPinLoading(true)
            await API.patch('/auth/pin', {
                currentPin: pinForm.currentPin,
                newPin: pinForm.newPin,
            })
            toast.success(user?.hasPin ? 'PIN changed successfully!' : 'PIN created successfully!')
            setShowPinModal(false)
            setPinForm({ currentPin: '', newPin: '', confirmPin: '' })
            dispatch(getMe())
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update PIN')
        } finally {
            setPinLoading(false)
        }
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        try {
            setProfileLoading(true)
            const res = await API.patch('/auth/profile', profileForm)
            toast.success('Profile updated successfully!')
            setShowProfileModal(false)
            dispatch(getMe())
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile')
        } finally {
            setProfileLoading(false)
        }
    }

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB')

        const formData = new FormData()
        formData.append('avatar', file)

        try {
            setAvatarLoading(true)
            await API.post('/auth/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            toast.success('Profile photo updated!')
            dispatch(getMe())
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload photo')
        } finally {
            setAvatarLoading(false)
        }
    }

    const handleBiometric = async () => {
        if (!window.PublicKeyCredential) {
            return toast.error('Biometric not supported on this device')
        }
        try {
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
            if (!available) return toast.error('No biometric sensor found')
            const newValue = !biometricEnabled
            setBiometricEnabled(newValue)
            localStorage.setItem('truva_biometric', String(newValue))
            toast.success(newValue ? 'Biometric login enabled!' : 'Biometric login disabled')
        } catch (err) {
            toast.error('Failed to toggle biometric')
        }
    }

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
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                                {user?.hasPin ? 'Change PIN' : 'Create PIN'}
                            </h3>
                            <button onClick={() => setShowPinModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <FiX size={16} />
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm mb-5">
                            {user?.hasPin ? 'Enter your current PIN then set a new one' : 'Create a 4-digit PIN for transactions'}
                        </p>
                        <form onSubmit={handlePinChange} className="space-y-4">
                            {user?.hasPin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Current PIN</label>
                                    <input
                                        type="password" maxLength={4}
                                        value={pinForm.currentPin}
                                        onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                                        placeholder="••••"
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-center tracking-widest focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New PIN</label>
                                <input
                                    type="password" maxLength={4}
                                    value={pinForm.newPin}
                                    onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                                    placeholder="••••"
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-center tracking-widest focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New PIN</label>
                                <input
                                    type="password" maxLength={4}
                                    value={pinForm.confirmPin}
                                    onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                                    placeholder="••••"
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-center tracking-widest focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowPinModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                                    Cancel
                                </button>
                                <motion.button type="submit" disabled={pinLoading}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white text-sm font-semibold disabled:opacity-50">
                                    {pinLoading ? 'Saving...' : user?.hasPin ? 'Change PIN' : 'Create PIN'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Profile Edit Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
                            <button onClick={() => setShowProfileModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <FiX size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={profileForm.fullName}
                                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                        placeholder="Your full name"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                                <div className="relative">
                                    <FiMapPin className="absolute left-4 top-3.5 text-gray-400" />
                                    <textarea
                                        value={profileForm.address}
                                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                        placeholder="123 Main St, New York, NY 10001"
                                        rows={3}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowProfileModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                                    Cancel
                                </button>
                                <motion.button type="submit" disabled={profileLoading}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white text-sm font-semibold disabled:opacity-50">
                                    {profileLoading ? 'Saving...' : 'Save Changes'}
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
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-2xl font-bold">
                                    {user?.fullName?.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        {/* Camera button */}
                        <input
                            type="file"
                            ref={fileRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => fileRef.current.click()}
                            disabled={avatarLoading}
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center shadow-lg"
                        >
                            {avatarLoading ? (
                                <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            ) : (
                                <FiCamera className="text-white text-xs" />
                            )}
                        </motion.button>
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <p className={`text-lg font-bold truncate ${textPrimary}`}>{user?.fullName}</p>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowProfileModal(true)}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
                            >
                                <FiEdit2 size={14} />
                            </motion.button>
                        </div>
                        <p className={`text-sm truncate ${textSecondary}`}>{user?.email}</p>
                        {user?.phone && (
                            <p className={`text-xs ${textSecondary} flex items-center gap-1 mt-0.5`}>
                                <FiPhone size={10} /> {user.phone}
                            </p>
                        )}
                        {user?.address && (
                            <p className={`text-xs ${textSecondary} flex items-center gap-1 mt-0.5 truncate`}>
                                <FiMapPin size={10} /> {user.address}
                            </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                            <p className={`text-xs font-mono ${textSecondary}`}>{user?.accountNumber}</p>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCopy}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
                            >
                                {copied ? <FiCheck size={11} /> : <FiCopy size={11} />}
                            </motion.button>
                        </div>
                        {/* Verified badge */}
                        <div className="mt-1.5">
                            {user?.isVerified ? (
                                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                                    ✓ Verified
                                </span>
                            ) : (
                                <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full font-medium">
                                    ⚠ Unverified
                                </span>
                            )}
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
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBiometric}
                        className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${biometricEnabled ? 'bg-linear-to-r from-[#00c6ff] to-[#7b2ff7]' : isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
                    >
                        <motion.div
                            animate={{ x: biometricEnabled ? 24 : 2 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
                        />
                    </motion.button>
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
                    className={`w-full flex items-center justify-between px-5 py-3.5 border-b transition-colors ${isDark ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <FiLock className="text-orange-500" />
                        </div>
                        <div className="text-left">
                            <p className={`text-sm font-medium ${textPrimary}`}>Transaction PIN</p>
                            <p className={`text-xs ${textSecondary}`}>
                                {user?.hasPin ? 'Change your 4-digit PIN' : 'Create a transaction PIN'}
                            </p>
                        </div>
                    </div>
                    <FiChevronRight className={textSecondary} />
                </button>

                <button
                    className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
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
                <button className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
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
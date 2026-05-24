import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signup, clearError } from '../features/auth/authSlice.js'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

function Signup() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error } = useSelector((state) => state.auth)

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(clearError())
        }
    }, [error, dispatch])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match')
        }
        if (formData.password.length < 6) {
            return toast.error('Password must be at least 6 characters')
        }
        dispatch(signup({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
        })).unwrap().then(() => {
            toast.success('Account created! Please sign in.')
            navigate('/login')
        }).catch(() => {})
    }

    return (
        <div className="min-h-screen flex bg-gray-50">

            {/* Left panel */}
            <div className="hidden lg:block w-[55%] relative m-5 rounded-3xl overflow-hidden shrink-0">
                <img src="/truva-banner.png" alt="Banking" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-br from-[#00c6ff]/75 to-[#7b2ff7]/90" />
                <div className="relative z-10 h-full flex flex-col justify-between p-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center overflow-hidden">
                            <img src="/truva-logo.png" alt="TRUVA" className="w-8 h-8 object-contain" />
                        </div>
                        <span className="text-white font-bold text-xl">TRUVA</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-white text-5xl font-bold leading-tight mb-5">
                            Join millions<br />banking<br />smarter.
                        </h2>
                        <p className="text-white/80 text-base mb-8">
                            Open your free account in minutes.<br />No hidden fees. Ever.
                        </p>
                        <div className="space-y-4">
                            {[
                                { step: '01', text: 'Create your free account' },
                                { step: '02', text: 'Get your account number instantly' },
                                { step: '03', text: 'Start sending & saving money' },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.step}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="flex items-center gap-4"
                                >
                                    <span className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {item.step}
                                    </span>
                                    <span className="text-white/90 text-sm">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <p className="text-white/35 text-xs">
                        &copy; {new Date().getFullYear()} TRUVA · FDIC Insured · 256-bit encryption
                    </p>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center bg-white px-6 py-10">
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-95"
                >
                    {/* Mobile logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex lg:hidden flex-col items-center mb-8"
                    >
                        <div className="w-16 h-16 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center overflow-hidden mb-3">
                            <img src="/truva-logo.png" alt="TRUVA" className="w-12 h-12 object-contain" />
                        </div>
                        <span className="font-bold text-xl text-gray-900">TRUVA</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-7"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-1 text-center lg:text-left">
                            Create account
                        </h2>
                        <p className="text-gray-500 text-sm text-center lg:text-left">
                            Free forever. No credit card required.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full name */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full name
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all"
                                />
                            </div>
                        </motion.div>

                        {/* Email */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all"
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    required
                                    className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Confirm password */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Confirm password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Repeat your password"
                                    required
                                    className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Submit */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full py-3.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm shadow-lg shadow-[#7b2ff7]/25 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                ) : null}
                                {loading ? 'Creating account...' : 'Create free account'}
                            </motion.button>
                        </motion.div>

                    </form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-xs text-gray-400 mt-4"
                    >
                        By creating an account you agree to our{' '}
                        <span className="text-[#7b2ff7] cursor-pointer hover:underline">Terms</span>
                        {' '}and{' '}
                        <span className="text-[#7b2ff7] cursor-pointer hover:underline">Privacy Policy</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="flex items-center gap-3 my-5"
                    >
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center text-sm text-gray-500"
                    >
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#7b2ff7] font-semibold hover:underline">
                            Sign in
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    )
}

export default Signup
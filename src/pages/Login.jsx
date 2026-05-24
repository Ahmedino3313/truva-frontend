import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../features/auth/authSlice.js'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

function Login() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error, token } = useSelector((state) => state.auth)

    const [formData, setFormData] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (token) navigate('/')
    }, [token, navigate])

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
        dispatch(login(formData))
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* Left Side - Image + Branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden m-4 rounded-3xl">

                <img
                    src="/truva-banner.png"
                    alt="Banking"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-br from-[#00c6ff]/80 to-[#7b2ff7]/90" />

                <div className="relative z-10 flex flex-col justify-between h-full">

                    {/* Top - Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center overflow-hidden">
                            <img
                                src="/truva-logo.png"
                                alt="TRUVA"
                                className="w-8 h-8 object-contain"
                            />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">TRUVA</span>
                    </motion.div>

                    {/* Middle - Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <h2 className="text-white text-4xl font-bold leading-tight mb-4">
                            Banking made<br />simple and smart.
                        </h2>
                        <p className="text-white/80 text-lg">
                            Send money, save goals, and manage your finances — all in one place.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-8">
                            {['Instant transfers', 'Virtual cards', 'Savings goals', 'No hidden fees'].map((f, i) => (
                                <motion.span
                                    key={f}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                                    className="bg-white/20 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full border border-white/20"
                                >
                                    ✓ {f}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bottom - Footer */}
                    <p className="text-white/40 text-sm">
                        &copy; {new Date().getFullYear()} TRUVA · FDIC Insured · 256-bit encryption
                    </p>

                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-sm"
                >

                    {/* Mobile logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex lg:hidden flex-col items-center text-center mb-10"
                    >
                        <div className="w-16 h-16 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden mb-2">
                            <img
                                src="/truva-logo.png"
                                alt="TRUVA"
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">TRUVA</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h2 className="text-gray-900 text-3xl font-bold mb-1 text-center lg:text-left">
                            Welcome back!
                        </h2>
                        <p className="text-gray-500 text-sm mb-8 text-center lg:text-left">
                            Sign in to your TRUVA account
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <label className="text-gray-700 text-sm font-medium mb-1.5 block">
                                Email address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all duration-200"
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-gray-700 text-sm font-medium">
                                    Password
                                </label>
                                <span className="text-[#7b2ff7] text-xs cursor-pointer hover:underline font-medium">
                                    Forgot password?
                                </span>
                            </div>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl pl-11 pr-11 py-3.5 text-sm focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Submit */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold py-3.5 rounded-xl hover:opacity-90 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide shadow-lg shadow-[#7b2ff7]/25 mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : 'Sign in'}
                            </motion.button>
                        </motion.div>

                    </form>

                    {/* Divider */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex items-center gap-3 my-6"
                    >
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-gray-400 text-xs">or</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </motion.div>

                    {/* Signup link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="text-center text-gray-500 text-sm"
                    >
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            className="text-[#7b2ff7] font-semibold hover:underline transition-colors"
                        >
                            Create account
                        </Link>
                    </motion.p>

                    {/* Security note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="mt-8 flex items-center justify-center gap-1 text-center text-xs text-gray-400"
                    >
                        <FiLock className="text-xs" />
                        <span>Protected by 256-bit SSL encryption</span>
                    </motion.p>

                </motion.div>
            </div>
        </div>
    )
}

export default Login
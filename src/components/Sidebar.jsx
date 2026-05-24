import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice.js'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHome, FiSend, FiCreditCard, FiTrendingUp, FiTarget, FiBell, FiSettings, FiLogOut, FiDollarSign, FiGrid, } from 'react-icons/fi'
import { RiQrCodeLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/send', icon: FiSend, label: 'Send Money' },
    { path: '/fund', icon: FiDollarSign, label: 'Fund Wallet' },
    { path: '/transactions', icon: FiGrid, label: 'Transactions' },
    { path: '/analytics', icon: FiTrendingUp, label: 'Analytics' },
    { path: '/cards', icon: FiCreditCard, label: 'Virtual Cards' },
    { path: '/savings', icon: FiTarget, label: 'Savings Goals' },
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/qr', icon: RiQrCodeLine, label: 'QR Payment' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
]

function Sidebar({ isOpen, onClose }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const { isDark } = useSelector((state) => state.theme)
    const { unreadCount } = useSelector((state) => state.notifications)

    const handleLogout = () => {
        dispatch(logout())
        toast.success('Logged out successfully')
        navigate('/login')
    }

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-64 z-30 flex flex-col
                    transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0 lg:z-auto
                    ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border-r
                `}
            >
                {/* Logo */}
                <div className={`flex items-center gap-3 px-6 py-5 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow flex items-center justify-center overflow-hidden">
                        <img src="/truva-logo.png" alt="TRUVA" className="w-7 h-7 object-contain" />
                    </div>
                    <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>TRUVA</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
                                ${isActive
                                    ? 'bg-linear-to-r from-[#00c6ff]/10 to-[#7b2ff7]/10 text-[#7b2ff7]'
                                    : isDark
                                        ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-linear-to-r from-[#00c6ff]/10 to-[#7b2ff7]/10 rounded-xl"
                                        />
                                    )}
                                    <item.icon className={`text-lg relative z-10 ${isActive ? 'text-[#7b2ff7]' : ''}`} />
                                    <span className="relative z-10">{item.label}</span>
                                    {item.path === '/notifications' && unreadCount > 0 && (
                                        <span className="ml-auto relative z-10 bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                    {isActive && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-[#00c6ff] to-[#7b2ff7] rounded-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User and Logout */}
                <div className={`px-3 py-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user?.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.fullName}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200"
                    >
                        <FiLogOut className="text-lg" />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
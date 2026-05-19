import { useSelector, useDispatch } from 'react-redux'
import { FiBell, FiMenu, FiSun, FiMoon } from 'react-icons/fi'
import { toggleTheme } from '../features/theme/themeSlice.js'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function Topbar({ onMenuClick }) {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { isDark } = useSelector((state) => state.theme)
    const { unreadCount } = useSelector((state) => state.notifications)

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`h-16 border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
        >
            {/* Left menu button + page title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                >
                    <FiMenu className="text-xl" />
                </button>

                <div>
                    <h1 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Good {getGreeting()}, {user?.fullName?.split(' ')[0]}
                    </h1>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            {/* Right — dark mode + notifications + avatar */}
            <div className="flex items-center gap-2">

                {/* Dark mode toggle */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => dispatch(toggleTheme())}
                    className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                >
                    {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
                </motion.button>

                {/* Notifications bell */}
                <Link to="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
                    <FiBell className="text-lg" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Link>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center text-white text-sm font-bold ml-1">
                    {user?.fullName?.charAt(0).toUpperCase()}
                </div>

            </div>
        </motion.header>
    )
}

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
}

export default Topbar
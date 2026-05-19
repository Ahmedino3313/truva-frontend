import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { getMe } from '../features/auth/authSlice.js'
import { getNotifications } from '../features/notifications/notificationSlice.js'

function Layout() {
    const dispatch = useDispatch()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { isDark } = useSelector((state) => state.theme)

    useEffect(() => {
        dispatch(getMe())
        dispatch(getNotifications())
    }, [dispatch])

    return (
        <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Topbar */}
                <Topbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <motion.main
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-1 overflow-y-auto p-4 lg:p-6"
                >
                    <Outlet />
                </motion.main>

            </div>
        </div>
    )
}

export default Layout
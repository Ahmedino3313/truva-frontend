import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, } from '../features/notifications/notificationSlice.js'
import { FiBell, FiCheck, FiTrash2, FiDollarSign, FiCreditCard, FiTarget, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

const getNotificationIcon = (type) => {
    switch (type) {
        case 'credit': return { icon: FiDollarSign, bg: 'bg-green-50', color: 'text-green-500' }
        case 'debit': return { icon: FiDollarSign, bg: 'bg-red-50', color: 'text-red-500' }
        case 'card': return { icon: FiCreditCard, bg: 'bg-purple-50', color: 'text-purple-500' }
        case 'savings': return { icon: FiTarget, bg: 'bg-blue-50', color: 'text-blue-500' }
        case 'welcome': return { icon: FiBell, bg: 'bg-yellow-50', color: 'text-yellow-500' }
        default: return { icon: FiAlertCircle, bg: 'bg-gray-50', color: 'text-gray-500' }
    }
}

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

function Notifications() {
    const dispatch = useDispatch()
    const { notifications, unreadCount, loading } = useSelector((state) => state.notifications)
    const { isDark } = useSelector((state) => state.theme)

    useEffect(() => {
        dispatch(getNotifications())
    }, [dispatch])

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead())
        toast.success('All notifications marked as read')
    }

    const handleDeleteAll = () => {
        if (window.confirm('Clear all notifications?')) {
            dispatch(deleteAllNotifications())
            toast.success('All notifications cleared')
        }
    }

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'

    return (
        <div className="max-w-2xl mx-auto">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-5"
            >
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Notifications</h1>
                    <p className={`text-sm ${textSecondary}`}>
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                </div>

                {notifications.length > 0 && (
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleMarkAllRead}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                <FiCheck size={12} />
                                Mark all read
                            </motion.button>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDeleteAll}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                            <FiTrash2 size={12} />
                            Clear all
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {/* Loading skeleton */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`rounded-2xl border p-4 animate-pulse ${cardBg}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-2 bg-gray-200 rounded w-1/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && notifications.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-12 text-center ${cardBg}`}
                >
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#00c6ff]/20 to-[#7b2ff7]/20 flex items-center justify-center mx-auto mb-4">
                        <FiBell className="text-3xl text-[#7b2ff7]" />
                    </div>
                    <p className={`font-semibold text-lg ${textPrimary}`}>No notifications yet</p>
                    <p className={`text-sm mt-1 ${textSecondary}`}>
                        We'll notify you about transactions and updates
                    </p>
                </motion.div>
            )}

            {/* Notifications list */}
            {!loading && notifications.length > 0 && (
                <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                    <AnimatePresence>
                        {notifications.map((notif, i) => {
                            const { icon: Icon, bg, color } = getNotificationIcon(notif.type)
                            return (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.03 }}
                                    className={`flex items-start gap-3 p-4 transition-colors cursor-pointer
                                        ${!notif.isRead ? isDark ? 'bg-[#7b2ff7]/5' : 'bg-[#7b2ff7]/3' : ''}
                                        ${i !== notifications.length - 1 ? `border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}` : ''}
                                        hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'}
                                    `}
                                    onClick={() => {
                                        if (!notif.isRead) dispatch(markAsRead(notif.id))
                                    }}
                                >
                                    {/* Icon */}
                                    <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`${color} text-lg`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-relaxed ${notif.isRead ? textSecondary : textPrimary} ${!notif.isRead ? 'font-medium' : ''}`}>
                                            {notif.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs ${textSecondary}`}>
                                                {timeAgo(notif.createdAt)}
                                            </span>
                                            {!notif.isRead && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#7b2ff7]" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            dispatch(deleteNotification(notif.id))
                                        }}
                                        className="text-gray-300 hover:text-red-400 transition-colors p-1 shrink-0"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

export default Notifications
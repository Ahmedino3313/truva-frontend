import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { getTransactions } from '../features/transactions/transactionSlice.js'
import { FiArrowUpRight, FiArrowDownLeft, FiSearch, FiFilter, FiDownload } from 'react-icons/fi'

function Transactions() {
    const dispatch = useDispatch()
    const { transactions, loading } = useSelector((state) => state.transactions)
    const { user } = useSelector((state) => state.auth)
    const { isDark } = useSelector((state) => state.theme)

    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        dispatch(getTransactions())
    }, [dispatch])

    const filters = ['all', 'send', 'receive', 'fund']

    const filtered = transactions.filter((tx) => {
        const matchSearch = tx.note?.toLowerCase().includes(search.toLowerCase()) ||
            tx.sender?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            tx.receiver?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            String(tx.amount).includes(search)

        const isReceived = tx.receiverId === user?.id
        const matchFilter =
            filter === 'all' ? true :
            filter === 'receive' ? isReceived :
            filter === 'send' ? (!isReceived && tx.type === 'send') :
            tx.type === filter

        return matchSearch && matchFilter
    })

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'

    // Group transactions by date
    const grouped = filtered.reduce((groups, tx) => {
        const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
        })
        if (!groups[date]) groups[date] = []
        groups[date].push(tx)
        return groups
    }, {})

    return (
        <div className="max-w-2xl mx-auto">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-5"
            >
                <h1 className={`text-2xl font-bold ${textPrimary}`}>Transactions</h1>
                <p className={`text-sm ${textSecondary}`}>{transactions.length} total transactions</p>
            </motion.div>

            {/* Search + Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`rounded-2xl border p-4 mb-5 ${cardBg}`}
            >
                {/* Search */}
                <div className="relative mb-3">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search transactions..."
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${filter === f
                                ? 'bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white'
                                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {f === 'all' ? 'All' : f === 'send' ? 'Sent' : f === 'receive' ? 'Received' : 'Funded'}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Transactions list */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`rounded-2xl border p-4 animate-pulse ${cardBg}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                                        <div className="h-2 bg-gray-200 rounded w-1/3" />
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className={`rounded-2xl border p-12 text-center ${cardBg}`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <FiFilter className={`text-2xl ${textSecondary}`} />
                        </div>
                        <p className={`font-semibold ${textPrimary}`}>No transactions found</p>
                        <p className={`text-sm mt-1 ${textSecondary}`}>
                            {search ? 'Try a different search term' : 'Start sending or receiving money'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {Object.entries(grouped).map(([date, txs], groupIndex) => (
                            <div key={date}>
                                {/* Date label */}
                                <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textSecondary}`}>
                                    {date}
                                </p>

                                <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                                    {txs.map((tx, i) => {
                                        const isReceived = tx.receiverId === user?.id
                                        return (
                                            <motion.div
                                                key={tx.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: groupIndex * 0.1 + i * 0.05 }}
                                                className={`flex items-center gap-3 p-4 transition-colors hover:${isDark ? 'bg-gray-800' : 'bg-gray-50'} ${i !== txs.length - 1 ? `border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}` : ''}`}
                                            >
                                                {/* Icon */}
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isReceived ? 'bg-green-50' : 'bg-red-50'}`}>
                                                    {isReceived
                                                        ? <FiArrowDownLeft className="text-green-500 text-lg" />
                                                        : <FiArrowUpRight className="text-red-500 text-lg" />
                                                    }
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${textPrimary}`}>
                                                        {isReceived
                                                            ? `From ${tx.sender?.fullName || 'Unknown'}`
                                                            : tx.note || `To ${tx.receiver?.fullName || 'External'}`
                                                        }
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-xs ${textSecondary}`}>
                                                            {new Date(tx.createdAt).toLocaleTimeString('en-US', {
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                                                            tx.method === 'truva' ? 'bg-purple-50 text-purple-600' :
                                                            tx.method === 'bank' ? 'bg-blue-50 text-blue-600' :
                                                            tx.method === 'card' ? 'bg-orange-50 text-orange-600' :
                                                            'bg-green-50 text-green-600'
                                                        }`}>
                                                            {tx.method}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                            tx.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                        }`}>
                                                            {tx.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <p className={`text-sm font-bold shrink-0 ${isReceived ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isReceived ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </p>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default Transactions
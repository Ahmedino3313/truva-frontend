import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { getTransactions } from '../features/transactions/transactionSlice.js'
import { getBalance } from '../features/wallet/walletSlice.js'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity } from 'react-icons/fi'

function Analytics() {
    const dispatch = useDispatch()
    const { transactions } = useSelector((state) => state.transactions)
    const { balance } = useSelector((state) => state.wallet)
    const { user } = useSelector((state) => state.auth)
    const { isDark } = useSelector((state) => state.theme)

    useEffect(() => {
        dispatch(getTransactions())
        dispatch(getBalance())
    }, [dispatch])

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
    const gridColor = isDark ? '#374151' : '#f3f4f6'
    const tooltipBg = isDark ? '#1f2937' : '#ffffff'

    // Total money in
    const totalIn = transactions
        .filter(tx => tx.receiverId === user?.id)
        .reduce((sum, tx) => sum + tx.amount, 0)

    // Total money out
    const totalOut = transactions
        .filter(tx => tx.senderId === user?.id && tx.type === 'send')
        .reduce((sum, tx) => sum + tx.amount, 0)

    // Total funded
    const totalFunded = transactions
        .filter(tx => tx.type === 'fund')
        .reduce((sum, tx) => sum + tx.amount, 0)

    // Monthly data for area chart
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        const month = date.toLocaleDateString('en-US', { month: 'short' })
        const year = date.getFullYear()
        const monthNum = date.getMonth()

        const income = transactions
            .filter(tx => {
                const d = new Date(tx.createdAt)
                return tx.receiverId === user?.id &&
                    d.getMonth() === monthNum &&
                    d.getFullYear() === year
            })
            .reduce((sum, tx) => sum + tx.amount, 0)

        const expense = transactions
            .filter(tx => {
                const d = new Date(tx.createdAt)
                return tx.senderId === user?.id &&
                    tx.type === 'send' &&
                    d.getMonth() === monthNum &&
                    d.getFullYear() === year
            })
            .reduce((sum, tx) => sum + tx.amount, 0)

        return { month, income, expense }
    })

    // Method breakdown for pie chart
    const methodData = [
        {
            name: 'TRUVA',
            value: transactions.filter(tx => tx.method === 'truva').length,
            color: '#7b2ff7'
        },
        {
            name: 'Bank',
            value: transactions.filter(tx => tx.method === 'bank').length,
            color: '#00c6ff'
        },
        {
            name: 'Card',
            value: transactions.filter(tx => tx.method === 'card').length,
            color: '#f093fb'
        },
        {
            name: 'Savings',
            value: transactions.filter(tx => tx.method === 'savings').length,
            color: '#43e97b'
        },
    ].filter(d => d.value > 0)

    // Daily spending for bar chart (last 7 days)
    const dailyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        const day = date.toLocaleDateString('en-US', { weekday: 'short' })
        const dateStr = date.toDateString()

        const spent = transactions
            .filter(tx => {
                return tx.senderId === user?.id &&
                    tx.type === 'send' &&
                    new Date(tx.createdAt).toDateString() === dateStr
            })
            .reduce((sum, tx) => sum + tx.amount, 0)

        return { day, spent }
    })

    const stats = [
        {
            label: 'Total Balance',
            value: `$${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: FiDollarSign,
            color: 'from-[#00c6ff] to-[#7b2ff7]',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
        },
        {
            label: 'Money In',
            value: `$${totalIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: FiTrendingDown,
            color: 'from-green-400 to-green-600',
            bg: 'bg-green-50',
            text: 'text-green-600',
        },
        {
            label: 'Money Out',
            value: `$${totalOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: FiTrendingUp,
            color: 'from-red-400 to-red-600',
            bg: 'bg-red-50',
            text: 'text-red-600',
        },
        {
            label: 'Total Funded',
            value: `$${totalFunded.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            icon: FiActivity,
            color: 'from-blue-400 to-blue-600',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
        },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-5">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className={`text-2xl font-bold ${textPrimary}`}>Analytics</h1>
                <p className={`text-sm ${textSecondary}`}>Your financial overview</p>
            </motion.div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className={`rounded-2xl border p-4 ${cardBg}`}
                    >
                        <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                            <stat.icon className={`${stat.text} text-lg`} />
                        </div>
                        <p className={`text-xs ${textSecondary} mb-1`}>{stat.label}</p>
                        <p className={`text-lg font-bold ${textPrimary}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Income vs Expense - Area Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`rounded-2xl border p-5 ${cardBg}`}
            >
                <h3 className={`text-sm font-semibold mb-5 ${textPrimary}`}>
                    Income vs Expenses (Last 6 months)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={monthlyData}>
                        <defs>
                            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00c6ff" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00c6ff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7b2ff7" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#7b2ff7" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip
                            contentStyle={{ background: tooltipBg, border: 'none', borderRadius: 12, fontSize: 12 }}
                            formatter={(value) => [`$${value.toLocaleString()}`, '']}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="income" name="Income" stroke="#00c6ff" strokeWidth={2} fill="url(#incomeGrad)" />
                        <Area type="monotone" dataKey="expense" name="Expense" stroke="#7b2ff7" strokeWidth={2} fill="url(#expenseGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Daily spending + Pie chart row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Daily spending - Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={`rounded-2xl border p-5 ${cardBg}`}
                >
                    <h3 className={`text-sm font-semibold mb-5 ${textPrimary}`}>
                        Daily Spending (Last 7 days)
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyData}>
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00c6ff" />
                                    <stop offset="100%" stopColor="#7b2ff7" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                            <Tooltip
                                contentStyle={{ background: tooltipBg, border: 'none', borderRadius: 12, fontSize: 12 }}
                                formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']}
                            />
                            <Bar dataKey="spent" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Transaction methods - Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={`rounded-2xl border p-5 ${cardBg}`}
                >
                    <h3 className={`text-sm font-semibold mb-5 ${textPrimary}`}>
                        Transaction Methods
                    </h3>
                    {methodData.length === 0 ? (
                        <div className="flex items-center justify-center h-48">
                            <p className={`text-sm ${textSecondary}`}>No transactions yet</p>
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie
                                        data={methodData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {methodData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: tooltipBg, border: 'none', borderRadius: 12, fontSize: 12 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Legend */}
                            <div className="flex flex-wrap justify-center gap-3 mt-2">
                                {methodData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                        <span className={`text-xs ${textSecondary}`}>{item.name} ({item.value})</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

        </div>
    )
}

export default Analytics
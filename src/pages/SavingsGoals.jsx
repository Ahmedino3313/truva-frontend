import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { getSavingsGoals, createSavingsGoal, fundSavingsGoal, deleteSavingsGoal, withdrawSavingsGoal, } from '../features/savings/savingsSlice.js'
import { getBalance } from '../features/wallet/walletSlice.js'
import { FiPlus, FiTarget, FiTrash2, FiDollarSign, FiX, FiCheck, FiCalendar, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

const goalColors = [
    { bg: 'from-[#00c6ff] to-[#0072ff]', light: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'from-[#7b2ff7] to-[#9d50bb]', light: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'from-[#f093fb] to-[#f5576c]', light: 'bg-pink-50', text: 'text-pink-600' },
    { bg: 'from-[#43e97b] to-[#38f9d7]', light: 'bg-green-50', text: 'text-green-600' },
    { bg: 'from-[#fa709a] to-[#fee140]', light: 'bg-orange-50', text: 'text-orange-600' },
]

function SavingsGoals() {
    const dispatch = useDispatch()
    const { goals, loading, error, success } = useSelector((state) => state.savings)
    const { balance } = useSelector((state) => state.wallet)
    const { isDark } = useSelector((state) => state.theme)

    const [showCreate, setShowCreate] = useState(false)
    const [fundingGoal, setFundingGoal] = useState(null)
    const [fundAmount, setFundAmount] = useState('')
    const [form, setForm] = useState({
        goalName: '',
        targetAmount: '',
        deadline: '',
    })

    useEffect(() => {
        dispatch(getSavingsGoals())
        dispatch(getBalance())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    useEffect(() => {
        if (success) {
            setShowCreate(false)
            setFundingGoal(null)
            setFundAmount('')
            setForm({ goalName: '', targetAmount: '', deadline: '' })
        }
    }, [success])

    const handleCreate = (e) => {
        e.preventDefault()
        if (!form.goalName || !form.targetAmount) return toast.error('Please fill in all fields')
        dispatch(createSavingsGoal(form))
    }

    const handleFund = (e) => {
        e.preventDefault()
        if (!fundAmount || fundAmount <= 0) return toast.error('Enter a valid amount')
        if (fundAmount > balance) return toast.error('Insufficient balance')
        dispatch(fundSavingsGoal({ id: fundingGoal.id, amount: Number(fundAmount) }))
    }

    const handleDelete = (id) => {
        if (window.confirm('Delete this goal? Your saved amount will be refunded.')) {
            dispatch(deleteSavingsGoal(id)).then((res) => {
                if (!res.error) toast.success('Goal deleted and amount refunded!')
            })
        }
    }

    const handleWithdraw = (goal) => {
        if (window.confirm(`Withdraw $${goal.currentAmount} from "${goal.goalName}" to your wallet?`)) {
            dispatch(withdrawSavingsGoal(goal.id)).then((res) => {
                if (!res.error) {
                    toast.success(`$${goal.currentAmount} withdrawn to wallet!`)
                    dispatch(getBalance())
                }
            })
        }
    }

    const getProgress = (current, target) => {
        return Math.min((current / target) * 100, 100).toFixed(1)
    }

    const getDaysLeft = (deadline) => {
        if (!deadline) return null
        const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
        return days > 0 ? days : 0
    }

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
    const inputClass = `w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/20 focus:border-[#00c6ff] ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`
    const labelClass = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`

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
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Savings Goals</h1>
                    <p className={`text-sm ${textSecondary}`}>
                        Balance: ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white text-sm font-semibold shadow-lg shadow-[#7b2ff7]/25 hover:opacity-90 transition-all"
                >
                    <FiPlus />
                    New Goal
                </motion.button>
            </motion.div>

            {/* Create goal modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-gray-900">Create Savings Goal</h3>
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-200 transition-colors"
                                >
                                    <FiX size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Goal Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.goalName}
                                        onChange={(e) => setForm({ ...form, goalName: e.target.value })}
                                        placeholder="e.g. New Car, Vacation, Emergency Fund"
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Target Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={form.targetAmount}
                                            onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                                            placeholder="0.00"
                                            required
                                            className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Deadline <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.deadline}
                                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all"
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : <FiTarget />}
                                    {loading ? 'Creating...' : 'Create Goal'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fund goal modal */}
            <AnimatePresence>
                {fundingGoal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-gray-900">Fund Goal</h3>
                                <button
                                    onClick={() => setFundingGoal(null)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                                >
                                    <FiX size={16} />
                                </button>
                            </div>

                            <p className="text-gray-500 text-sm mb-5">
                                Adding funds to <span className="font-semibold text-gray-900">"{fundingGoal.goalName}"</span>
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-5">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="font-semibold text-gray-900">
                                        ${fundingGoal.currentAmount} / ${fundingGoal.targetAmount}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] rounded-full"
                                        style={{ width: `${getProgress(fundingGoal.currentAmount, fundingGoal.targetAmount)}%` }}
                                    />
                                </div>
                            </div>

                            <form onSubmit={handleFund} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Amount to add
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={fundAmount}
                                            onChange={(e) => setFundAmount(e.target.value)}
                                            placeholder="0.00"
                                            required
                                            className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00c6ff] focus:ring-2 focus:ring-[#00c6ff]/20 transition-all"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                        Available: ${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full py-3.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : <FiDollarSign />}
                                    {loading ? 'Adding funds...' : 'Add Funds'}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {goals.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-12 text-center ${cardBg}`}
                >
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#00c6ff]/20 to-[#7b2ff7]/20 flex items-center justify-center mx-auto mb-4">
                        <FiTarget className="text-3xl text-[#7b2ff7]" />
                    </div>
                    <p className={`font-semibold text-lg ${textPrimary}`}>No savings goals yet</p>
                    <p className={`text-sm mt-1 mb-5 ${textSecondary}`}>
                        Start saving towards something meaningful
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowCreate(true)}
                        className="px-6 py-3 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white text-sm font-semibold shadow-lg"
                    >
                        Create your first goal
                    </motion.button>
                </motion.div>
            )}

            {/* Goals list */}
            <div className="space-y-4">
                <AnimatePresence>
                    {goals.map((goal, i) => {
                        const progress = getProgress(goal.currentAmount, goal.targetAmount)
                        const daysLeft = getDaysLeft(goal.deadline)
                        const isCompleted = goal.currentAmount >= goal.targetAmount
                        const color = goalColors[i % goalColors.length]

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className={`rounded-2xl border p-5 ${cardBg}`}
                            >
                                {/* Top row */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${color.bg} flex items-center justify-center`}>
                                            <FiTarget className="text-white text-lg" />
                                        </div>
                                        <div>
                                            <p className={`font-semibold ${textPrimary}`}>{goal.goalName}</p>
                                            <p className={`text-xs ${textSecondary} flex items-center gap-1`}>
                                                {isCompleted ? (
                                                    <>
                                                        <FiCheckCircle className="text-green-500" size={14} />
                                                        Completed!
                                                    </>
                                                ) : (
                                                    `${progress}% saved`
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(goal.id)}
                                        className="text-red-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>

                                {/* Progress bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className={textSecondary}>
                                            ${Number(goal.currentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} saved
                                        </span>
                                        <span className={`font-semibold ${textPrimary}`}>
                                            ${Number(goal.targetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className={`w-full h-2.5 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className={`h-full bg-linear-to-r ${color.bg} rounded-full`}
                                        />
                                    </div>
                                </div>

                                {/* Bottom row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {daysLeft !== null && (
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${color.light}`}>
                                                <FiCalendar className={`${color.text} text-xs`} />
                                                <span className={`text-xs font-medium ${color.text}`}>
                                                    {daysLeft === 0 ? 'Due today!' : `${daysLeft} days left`}
                                                </span>
                                            </div>
                                        )}
                                        {isCompleted && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50">
                                                    <FiCheck className="text-green-500 text-xs" />
                                                    <span className="text-xs font-medium text-green-600">Goal reached!</span>
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleWithdraw(goal)}
                                                    className="px-4 py-2 rounded-xl bg-linear-to-r from-green-400 to-green-600 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                                                >
                                                    <FiDollarSign size={12} />
                                                    Withdraw
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>

                                    {!isCompleted && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setFundingGoal(goal)}
                                            className={`px-4 py-2 rounded-xl bg-linear-to-r ${color.bg} text-white text-xs font-semibold shadow-sm`}
                                        >
                                            Add Funds
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default SavingsGoals
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { getVirtualCards, createVirtualCard, toggleFreezeCard, deleteVirtualCard, } from '../features/cards/cardSlice.js'
import { FiPlus, FiEye, FiEyeOff, FiTrash2, FiLock, FiUnlock, FiCheckCircle } from 'react-icons/fi'
import { RiVisaLine, RiMastercardLine } from 'react-icons/ri'
import toast from 'react-hot-toast'

function VirtualCards() {
    const dispatch = useDispatch()
    const { cards, loading, error } = useSelector((state) => state.cards)
    const { user } = useSelector((state) => state.auth)
    const { isDark } = useSelector((state) => state.theme)

    const [showDetails, setShowDetails] = useState({})

    useEffect(() => {
        dispatch(getVirtualCards())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    const toggleDetails = (id) => {
        setShowDetails(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleCreate = () => {
        dispatch(createVirtualCard()).then((res) => {
            if (!res.error) toast.success('Virtual card created!')
        })
    }

    const handleFreeze = (id) => {
        dispatch(toggleFreezeCard(id)).then((res) => {
            if (!res.error) {
                const card = cards.find(c => c.id === id)
                toast.success(card?.isFrozen ? 'Card unfrozen!' : 'Card frozen!')
            }
        })
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            dispatch(deleteVirtualCard(id)).then((res) => {
                if (!res.error) toast.success('Card deleted!')
            })
        }
    }

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'

    const maskCard = (num) => {
        const parts = num.split(' ')
        return parts.map((p, i) => i < 3 ? '••••' : p).join(' ')
    }

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
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Virtual Cards</h1>
                    <p className={`text-sm ${textSecondary}`}>{cards.length}/3 cards created</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreate}
                    disabled={loading || cards.length >= 3}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white text-sm font-semibold shadow-lg shadow-[#7b2ff7]/25 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    ) : <FiPlus />}
                    New Card
                </motion.button>
            </motion.div>

            {/* Empty state */}
            {cards.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-12 text-center ${cardBg}`}
                >
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#00c6ff]/20 to-[#7b2ff7]/20 flex items-center justify-center mx-auto mb-4">
                        <RiVisaLine className="text-3xl text-[#7b2ff7]" />
                    </div>
                    <p className={`font-semibold text-lg ${textPrimary}`}>No virtual cards yet</p>
                    <p className={`text-sm mt-1 mb-5 ${textSecondary}`}>
                        Create a virtual Visa card for online payments
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCreate}
                        className="px-6 py-3 rounded-xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white text-sm font-semibold shadow-lg"
                    >
                        Create your first card
                    </motion.button>
                </motion.div>
            )}

            {/* Cards list */}
            <div className="space-y-5">
                <AnimatePresence>
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                        >
                            {/* Card visual */}
                            <div className={`relative rounded-3xl overflow-hidden h-52 mb-3 ${card.isFrozen ? 'opacity-70' : ''}`}>

                                {/* Background gradient */}
                                <div className="absolute inset-0 bg-linear-to-br from-[#0a0a1a] via-[#1a1040] to-[#0a0a1a]" />

                                {/* Decorative circles */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#7b2ff7]/20" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#00c6ff]/20" />

                                {/* Frozen overlay */}
                                {card.isFrozen && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                        <div className="text-center">
                                            <FiLock className="text-white text-3xl mx-auto mb-2" />
                                            <p className="text-white font-semibold text-sm">Card Frozen</p>
                                        </div>
                                    </div>
                                )}

                                {/* Card content */}
                                <div className="relative z-10 h-full flex flex-col justify-between p-6">

                                    {/* Top row */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                                <img src="/src/assets/truva-logo.png" alt="TRUVA" className="w-6 h-6 object-contain" />
                                            </div>
                                            <span className="text-white/80 text-sm font-semibold">TRUVA</span>
                                        </div>
                                        <div className="w-10 h-7 rounded bg-linear-to-r from-yellow-400 to-yellow-600 opacity-80" />
                                    </div>

                                    {/* Card number */}
                                    <div>
                                        <p className="text-white font-mono text-lg tracking-widest">
                                            {showDetails[card.id] ? card.cardNumber : maskCard(card.cardNumber)}
                                        </p>
                                    </div>

                                    {/* Bottom row */}
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-white/50 text-xs mb-1">Card Holder</p>
                                            <p className="text-white text-sm font-semibold">{user?.fullName}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white/50 text-xs mb-1">Expires</p>
                                            <p className="text-white text-sm font-mono">{card.expiry}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white/50 text-xs mb-1">CVV</p>
                                            <p className="text-white text-sm font-mono">
                                                {showDetails[card.id] ? card.cvv : '•••'}
                                            </p>
                                        </div>
                                        <RiVisaLine className="text-white text-4xl opacity-80" />
                                    </div>
                                </div>
                            </div>

                            {/* Card actions */}
                            <div className={`rounded-2xl border p-4 flex items-center justify-between ${cardBg}`}>
                                <div>
                                    <p className={`text-sm font-semibold ${textPrimary}`}>
                                        •••• {card.cardNumber.slice(-4)}
                                    </p>
                                    <p className={`text-xs flex items-center gap-1 ${textSecondary}`}>
                                        {card.isFrozen ? (
                                            <>
                                                <FiLock className="text-red-500" />
                                                Frozen
                                            </>
                                        ) : (
                                            <>
                                                <FiCheckCircle className="text-green-500" />
                                                Active
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Show/hide details */}
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => toggleDetails(card.id)}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {showDetails[card.id] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </motion.button>

                                    {/* Freeze/unfreeze */}
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleFreeze(card.id)}
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${card.isFrozen
                                            ? 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                                            : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        {card.isFrozen ? <FiUnlock size={16} /> : <FiLock size={16} />}
                                    </motion.button>

                                    {/* Delete */}
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDelete(card.id)}
                                        className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                                    >
                                        <FiTrash2 size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Info note */}
            {cards.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`mt-5 rounded-2xl border p-4 ${cardBg}`}
                >
                    <p className={`text-xs ${textSecondary} text-center flex items-center justify-center gap-1`}>
                        <FiLock className="text-red-500" />
                        <span>Virtual cards are secured with 256-bit encryption. Maximum 3 cards per account.</span>
                    </p>
                </motion.div>
            )}
        </div>
    )
}

export default VirtualCards
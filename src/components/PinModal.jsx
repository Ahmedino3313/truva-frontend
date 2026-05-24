import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiLock } from 'react-icons/fi'
import API from '../api/axios.js'
import toast from 'react-hot-toast'

function PinModal({ isOpen, onClose, onSuccess, title = 'Enter PIN' }) {
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (customPin) => {
        const finalPin = customPin !== undefined ? customPin : pin

        if (String(finalPin).length !== 4) {
            return toast.error('Enter your 4-digit PIN')
        }

        try {
            setLoading(true)
            await API.post('/auth/verify-pin', { pin: String(finalPin) })
            onSuccess()
            setPin('')
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Incorrect PIN')
            setPin('')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (num) => {
        if (loading) return
        if (pin.length < 4) {
            const newPin = pin + num
            setPin(newPin)
            if (newPin.length === 4) {
                setTimeout(() => {
                    handleSubmit(newPin)
                }, 150)
            }
        }
    }

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1))
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl mb-4 sm:mb-0"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center">
                                    <FiLock className="text-white text-sm" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            </div>
                            <button
                                onClick={() => { onClose(); setPin('') }}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                            >
                                <FiX size={16} />
                            </button>
                        </div>

                        {/* PIN dots */}
                        <div className="flex justify-center gap-4 mb-8">
                            {[0, 1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: pin.length === i + 1 ? [1, 1.2, 1] : 1,
                                    }}
                                    transition={{ duration: 0.15 }}
                                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                                        i < pin.length
                                            ? 'bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] border-transparent'
                                            : 'border-gray-300 bg-transparent'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Number pad */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <motion.button
                                    key={num}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleKeyPress(String(num))}
                                    className="h-14 rounded-2xl bg-gray-50 text-gray-900 text-xl font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    {num}
                                </motion.button>
                            ))}
                            <div />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleKeyPress('0')}
                                className="h-14 rounded-2xl bg-gray-50 text-gray-900 text-xl font-semibold hover:bg-gray-100 transition-colors"
                            >
                                0
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleDelete}
                                className="h-14 rounded-2xl bg-gray-50 text-gray-500 text-xl font-semibold hover:bg-gray-100 transition-colors"
                            >
                                ⌫
                            </motion.button>
                        </div>

                        {/* Confirm button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSubmit}
                            disabled={pin.length !== 4 || loading}
                            className="w-full py-3.5 rounded-2xl bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white font-semibold text-sm shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            ) : <FiLock size={14} />}
                            {loading ? 'Verifying...' : 'Confirm'}
                        </motion.button>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default PinModal
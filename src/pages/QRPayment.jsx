import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiDownload, FiShare2, FiCopy, FiCheck } from 'react-icons/fi'
import { RiQrCodeLine } from 'react-icons/ri'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

function QRPayment() {
    const { user } = useSelector((state) => state.auth)
    const { isDark } = useSelector((state) => state.theme)
    const { balance } = useSelector((state) => state.wallet)

    const canvasRef = useRef(null)
    const [copied, setCopied] = useState(false)
    const [amount, setAmount] = useState('')

    const qrData = JSON.stringify({
        name: user?.fullName,
        accountNumber: user?.accountNumber,
        amount: amount || null,
        app: 'TRUVA',
    })

    useEffect(() => {
        if (canvasRef.current && user) {
            QRCode.toCanvas(canvasRef.current, qrData, {
                width: 220,
                margin: 2,
                color: {
                    dark: '#0a0a0f',
                    light: '#ffffff',
                },
            })
        }
    }, [qrData, user])

    const handleCopy = () => {
        navigator.clipboard.writeText(user?.accountNumber)
        setCopied(true)
        toast.success('Account number copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const canvas = canvasRef.current
        const url = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        a.href = url
        a.download = `truva-qr-${user?.accountNumber}.png`
        a.click()
        toast.success('QR code downloaded!')
    }

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: 'Pay me on TRUVA',
                text: `Send money to ${user?.fullName} on TRUVA. Account: ${user?.accountNumber}`,
            })
        } else {
            handleCopy()
        }
    }

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
    const inputClass = `w-full px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/20 focus:border-[#00c6ff] ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`

    return (
        <div className="max-w-md mx-auto">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-5"
            >
                <h1 className={`text-2xl font-bold ${textPrimary}`}>QR Payment</h1>
                <p className={`text-sm ${textSecondary}`}>Share your QR code to receive money</p>
            </motion.div>

            {/* QR Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`rounded-3xl border p-6 mb-5 ${cardBg}`}
            >
                {/* User info */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center text-white font-bold text-lg">
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className={`font-semibold ${textPrimary}`}>{user?.fullName}</p>
                        <p className={`text-xs ${textSecondary}`}>TRUVA Account</p>
                    </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white rounded-2xl shadow-sm">
                        <canvas ref={canvasRef} />
                    </div>
                </div>

                {/* Account number */}
                <div className={`flex items-center justify-between p-3 rounded-xl mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div>
                        <p className={`text-xs ${textSecondary} mb-0.5`}>Account Number</p>
                        <p className={`font-mono font-semibold text-sm ${textPrimary}`}>
                            {user?.accountNumber}
                        </p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCopy}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${copied
                            ? 'bg-green-500 text-white'
                            : isDark ? 'bg-gray-700 text-gray-400' : 'bg-white text-gray-500 shadow-sm'
                            }`}
                    >
                        {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                    </motion.button>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleDownload}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        <FiDownload size={16} />
                        Download
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-linear-to-r from-[#00c6ff] to-[#7b2ff7] text-white shadow-lg shadow-[#7b2ff7]/25 hover:opacity-90 transition-all"
                    >
                        <FiShare2 size={16} />
                        Share
                    </motion.button>
                </div>
            </motion.div>

            {/* Set amount */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`rounded-2xl border p-5 mb-5 ${cardBg}`}
            >
                <h3 className={`text-sm font-semibold mb-3 ${textPrimary}`}>
                    Set Amount (Optional)
                </h3>
                <p className={`text-xs ${textSecondary} mb-3`}>
                    Add a specific amount to your QR code so the sender knows exactly how much to send
                </p>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className={`${inputClass} pl-8`}
                    />
                </div>
                {amount && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-[#7b2ff7] mt-2 flex gap-1"
                    >
                        <>
                            <FiCheck className="text-purple-600" size={14} />
                            <span>QR code updated with ${Number(amount).toLocaleString()} request </span>
                        </>
                    </motion.p>
                )}
            </motion.div>

            {/* How it works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`rounded-2xl border p-5 ${cardBg}`}
            >
                <h3 className={`text-sm font-semibold mb-4 ${textPrimary}`}>How it works</h3>
                <div className="space-y-3">
                    {[
                        { step: '01', text: 'Show your QR code to the sender' },
                        { step: '02', text: 'They scan it with their TRUVA app' },
                        { step: '03', text: 'Money arrives in your wallet instantly' },
                    ].map((item, i) => (
                        <motion.div
                            key={item.step}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex items-center gap-3"
                        >
                            <span className="w-7 h-7 rounded-full bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {item.step}
                            </span>
                            <span className={`text-sm ${textSecondary}`}>{item.text}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}

export default QRPayment
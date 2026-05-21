import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FiUser, FiDollarSign, FiTrash2, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import API from '../api/axios.js'

function Admin() {
    const { isDark } = useSelector((state) => state.theme)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [newBalance, setNewBalance] = useState('')

    const cardBg = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
    const textPrimary = isDark ? 'text-white' : 'text-gray-900'
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users')
            setUsers(res.data.users)
        } catch (err) {
            toast.error('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateBalance = async (id) => {
        if (!newBalance || newBalance < 0) return toast.error('Enter a valid balance')
        try {
            await API.patch(`/admin/users/${id}/balance`, { balance: Number(newBalance) })
            toast.success('Balance updated!')
            setEditingId(null)
            setNewBalance('')
            fetchUsers()
        } catch (err) {
            toast.error('Failed to update balance')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return
        try {
            await API.delete(`/admin/users/${id}`)
            toast.success('User deleted!')
            fetchUsers()
        } catch (err) {
            toast.error('Failed to delete user')
        }
    }

    return (
        <div className="max-w-4xl mx-auto">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5"
            >
                <h1 className={`text-2xl font-bold ${textPrimary}`}>Admin Panel</h1>
                <p className={`text-sm ${textSecondary}`}>{users.length} total users</p>
            </motion.div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`rounded-2xl border p-4 animate-pulse ${cardBg}`}>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {users.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`rounded-2xl border p-4 ${cardBg}`}
                        >
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#00c6ff] to-[#7b2ff7] flex items-center justify-center text-white font-bold shrink-0">
                                        {user.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold ${textPrimary}`}>{user.fullName}</p>
                                        <p className={`text-xs ${textSecondary}`}>{user.email}</p>
                                        <p className={`text-xs font-mono ${textSecondary}`}>{user.accountNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Balance */}
                                    {editingId === user.id ? (
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                <input
                                                    type="number"
                                                    value={newBalance}
                                                    onChange={(e) => setNewBalance(e.target.value)}
                                                    placeholder={user.balance}
                                                    className={`pl-7 pr-3 py-2 rounded-xl border text-sm w-32 focus:outline-none focus:border-[#00c6ff] ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleUpdateBalance(user.id)}
                                                className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center"
                                            >
                                                <FiCheck size={14} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingId(user.id)
                                                setNewBalance(user.balance)
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                                        >
                                            <FiDollarSign size={12} />
                                            ${Number(user.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </button>
                                    )}

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Admin
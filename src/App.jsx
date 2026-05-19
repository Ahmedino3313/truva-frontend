import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Toaster } from 'react-hot-toast'

import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SendMoney from './pages/SendMoney.jsx'
import FundWallet from './pages/FundWallet.jsx'
import Transactions from './pages/Transactions.jsx'
import Analytics from './pages/Analytics.jsx'
import VirtualCards from './pages/VirtualCards.jsx'
import SavingsGoals from './pages/SavingsGoals.jsx'
import Notifications from './pages/Notifications.jsx'
import QRPayment from './pages/QRPayment.jsx'
import Settings from './pages/Settings.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Layout from './components/Layout.jsx'

function App() {
  const { isDark } = useSelector((state) => state.theme)

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/send" element={<SendMoney />} />
                <Route path="/fund" element={<FundWallet />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/cards" element={<VirtualCards />} />
                <Route path="/savings" element={<SavingsGoals />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/qr" element={<QRPayment />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App
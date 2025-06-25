import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { LoadingScreen } from '@/components/ui/loading'
import useAuth from '@/hooks/useAuth'
import { CheckSquare } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, loading, navigate])

  const handleLoginSuccess = () => {
    navigate('/dashboard')
  }

  const handleRegisterRedirect = () => {
    navigate('/authRegister')
  }

  if (loading) {
    return <LoadingScreen text="Checking authentication..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center justify-center sm:justify-start">
          <CheckSquare className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">TaskManager</span>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          
          <div className="flex-1 text-center lg:text-left space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Manage Your Tasks
                <span className="block text-blue-600">Efficiently</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                Organize your work, collaborate with teams, and boost productivity with our simple task management platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <CheckSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Easy Task Creation</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="h-8 w-8 text-green-600 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Team Collaboration</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="h-8 w-8 text-purple-600 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Track Progress</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md order-1 lg:order-2">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={handleRegisterRedirect}
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="text-center text-sm text-gray-500">
          © 2025 TaskManager. Simple task management for everyone.
        </div>
      </div>
    </div>
  )
}

export default Login
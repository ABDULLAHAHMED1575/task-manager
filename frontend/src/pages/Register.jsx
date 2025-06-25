import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RegisterForm from '@/components/auth/RegisterForm'
import { LoadingScreen } from '@/components/ui/loading'
import useAuth from '@/hooks/useAuth'
import { CheckSquare } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()
//   useEffect(() => {
//     if (!loading && isAuthenticated) {
//       navigate('/dashboard')
//     }
//   }, [isAuthenticated, loading, navigate])

  const handleRegisterSuccess = () => {
    navigate('/login')
  }

  const handleSwitchToLogin = () => {
    navigate('/login')
  }

//   if (loading) {
//     return <LoadingScreen text="Checking authentication..." />
//   }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center lg:justify-start sm:justify-start md:justify-center">
          <CheckSquare className="h-8 w-8 text-green-600" />
          <span className="ml-2  text-2xl font-bold text-gray-900">TaskManager</span>
        </div>
      </div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          
          <div className="flex-1 text-center lg:text-left space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Join Our
                <span className="block text-green-600">Task Community</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                Start organizing your work today. Create teams, manage tasks, and boost your productivity with our intuitive platform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-green-500">
                <div className="h-8 w-8 text-green-600 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Team Collaboration</p>
                <p className="text-xs text-gray-500 mt-1">Work together seamlessly</p>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-500">
                <CheckSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Task Management</p>
                <p className="text-xs text-gray-500 mt-1">Stay organized and productive</p>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-purple-500">
                <div className="h-8 w-8 text-purple-600 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Progress Tracking</p>
                <p className="text-xs text-gray-500 mt-1">Monitor your achievements</p>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg shadow-sm border-l-4 border-orange-500">
                <div className="h-8 w-8 text-orange-600 mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900">Goal Achievement</p>
                <p className="text-xs text-gray-500 mt-1">Reach your targets faster</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <div className="flex items-center text-sm text-gray-600">
                <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                Free to start
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                Setup in 2 minutes
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md order-1 lg:order-2">
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="text-center text-sm text-gray-500">
          © 2025 TaskManager. Start your productivity journey today.
        </div>
      </div>
    </div>
  )
}

export default Register
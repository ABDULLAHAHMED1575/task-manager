import { createContext, useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { useToast } from "@/components/ui/toast";

const AuthContext = createContext();
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    useEffect(()=>{
        checkAuth();
    }, [])
    const checkAuth = async () => {
        try {
            const result = await authService.checkAuth()
            if(result.authenticated){
                const savedUser = localStorage.getItem('user')
                if(savedUser){
                    setUser(JSON.parse(savedUser))
                }
            }
        } catch (err) {
            toast.error('Not authenticated')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email,password) => {
        try {
            const response = await authService.login({email,password})
            setUser(response.user)
            localStorage.setItem('user',JSON.stringify(response.user))
            return {success:true,message:'Login successful!'}
        } catch (error) {
            return {success:false,error:error.message}
        }
    }
    const register = async (username,email,password) => {
        try {
            const response = await authService.register({username,email,password})
            setUser(response.user);
            localStorage.setItem('user',JSON.stringify(response.user))
            return {success:true,message:'Registration successful'}
        } catch (error) {
            return {success:false,error:error.message}
        }
    }
    const logout = async () => {
        try {
            await authService.logout()
            setUser(null)
            localStorage.removeItem('user')
            return {success:true,message:'Logged out successfully!'}
        } catch (error) {
            setUser(null)
            localStorage.removeItem('user')
            return {success:true, message:'Logged out successfully!'}
        }
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]                               = useState(null)
  const [userRole, setUserRole]                       = useState(null)
  const [requiresPasswordChange, setRequiresChange]   = useState(false)
  const [loading, setLoading]                         = useState(true)

  const fetchRole = async (userId) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role, requires_password_change')
      .eq('user_id', userId)
      .single()
    if (data) {
      setUserRole(data.role)
      setRequiresChange(data.requires_password_change)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchRole(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchRole(session.user.id).then(() => setLoading(false))
      } else {
        setUserRole(null)
        setRequiresChange(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Loading done after role is fetched
  useEffect(() => {
    if (user && userRole !== null) setLoading(false)
  }, [user, userRole])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  const completePasswordChange = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) {
      await supabase
        .from('user_roles')
        .update({ requires_password_change: false })
        .eq('user_id', user.id)
      setRequiresChange(false)
    }
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      requiresPasswordChange,
      isAdmin: userRole === 'admin',
      loading,
      signIn,
      signOut,
      completePasswordChange,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
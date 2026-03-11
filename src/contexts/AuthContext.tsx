import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
    id: string;
    email: string;
    name: string;
    is_approved: boolean;
    is_admin: boolean;
};

type AuthContextType = {
    user: User | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    login: (user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    useEffect(() => {
        // Here you would normally validate a token with the backend
        // For the sake of this migration, we are simply reviving session state from localStorage
        const storedUser = localStorage.getItem('hub_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setStatus('authenticated');
            } catch (e) {
                setStatus('unauthenticated');
            }
        } else {
            setStatus('unauthenticated');
        }
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
        setStatus('authenticated');
        localStorage.setItem('hub_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        setStatus('unauthenticated');
        localStorage.removeItem('hub_user');
    };

    return (
        <AuthContext.Provider value={{ user, status, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// NextAuth compatability hook for easier migration
export const useSession = () => {
    const { user, status } = useAuth();
    return { data: user ? { user } : null, status };
};

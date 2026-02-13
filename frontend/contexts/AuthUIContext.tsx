import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthMode = 'login' | 'signup';

interface AuthUIContextType {
    authModalVisible: boolean;
    authMode: AuthMode;
    openAuthModal: (mode: AuthMode) => void;
    closeAuthModal: () => void;
}

const AuthUIContext = createContext<AuthUIContextType | undefined>(undefined);

export function AuthUIProvider({ children }: { children: ReactNode }) {
    const [authModalVisible, setAuthModalVisible] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('login');

    const openAuthModal = (mode: AuthMode) => {
        setAuthMode(mode);
        setAuthModalVisible(true);
    };

    const closeAuthModal = () => {
        setAuthModalVisible(false);
    };

    return (
        <AuthUIContext.Provider
            value={{
                authModalVisible,
                authMode,
                openAuthModal,
                closeAuthModal,
            }}
        >
            {children}
        </AuthUIContext.Provider>
    );
}

export function useAuthUI() {
    const context = useContext(AuthUIContext);
    if (context === undefined) {
        throw new Error('useAuthUI must be used within an AuthUIProvider');
    }
    return context;
}


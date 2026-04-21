import React, { createContext, ReactNode, useState } from "react";

type TabContextType = {
    active: string;
    setActive: React.Dispatch<React.SetStateAction<string>>;

    
    badges: Record<string, number>;
    setBadge: (tab: string, count: number) => void;
};

export type TabProviderProps = {
    children: ReactNode;
};

export const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
    const [active, setActive] = useState("");
    const [badges, setBadges] = useState<Record<string, number>>({});


    const setBadge = (tab: string, count: number) => {
    setBadges((prev) => ({
        ...prev,
        [tab]: count,
    }));
};

    return (
    <TabContext.Provider
        value={{
            active,
            setActive,
            badges,    
            setBadge,           
        }}
    >
        {children}
    </TabContext.Provider>
    );
};
import { createContext, ReactNode, useState } from "react";

type TabContextType={
    active: string
    setActive: React.Dispatch<React.SetStateAction<string>>
}

export type TabProviderProps = {
  children: ReactNode;
};

export const TabContext = createContext<TabContextType | undefined>(undefined);

export const TabProvider: React.FC<TabProviderProps> = ({ children }) => {
    const [active, setActive] = useState('')
    
    return <TabContext.Provider value={{ active, setActive }}>{children}</TabContext.Provider>
}
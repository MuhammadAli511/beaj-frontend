import React, { createContext, useState, useContext, useEffect } from 'react';
import useIsMobile from './useIsMobile';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
    const isMobile = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

    useEffect(() => {
        setIsSidebarOpen(!isMobile);
    }, [isMobile]);

    const toggleSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(prevState => !prevState);
        }
    };

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};
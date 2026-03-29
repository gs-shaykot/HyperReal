'use client';
import { store } from '@/app/redux/store';
import React, { ReactNode, useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { setTheme } from '@/app/redux/Slices/ThemeSlice';
import { AppDispatchType } from '@/app/redux/store';

function ThemeInitializer({ children }: { children: ReactNode }) {
    const dispatch = useDispatch<AppDispatchType>();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (saved === 'light' || saved === 'dark') {
            dispatch(setTheme(saved));
        }
        setMounted(true);
    }, [dispatch]);

    if (!mounted) {
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return <>{children}</>;
}

export default function ReduxProvider({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <ThemeInitializer>
                {children}
            </ThemeInitializer>
        </Provider>
    );
}
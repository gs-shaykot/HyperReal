'use client';
import { store } from '@/app/redux/store';
import React, { ReactNode, useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { setTheme } from '@/app/redux/Slices/ThemeSlice';
import { AppDispatchType } from '@/app/redux/store';

function ThemeInitializer({ children }: { children: ReactNode }) {
    const dispatch = useDispatch<AppDispatchType>();
    const [mounted, setMounted] = useState(false);

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
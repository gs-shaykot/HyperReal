import { store } from '@/app/redux/store'
import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'

type childrenType = {
    children: ReactNode
}

export default function ReduxProvider({ children }: childrenType) {
    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}

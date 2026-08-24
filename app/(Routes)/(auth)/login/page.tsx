import LoginForm from '@/app/(Routes)/(auth)/login/LoginForm'
import React, { Suspense } from 'react'

const page = () => {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }>
            <LoginForm />
        </Suspense>
    )
}

export default page
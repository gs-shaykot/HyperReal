import LoginForm from '@/app/(Routes)/(auth)/login/LoginForm'
import React, { Suspense } from 'react'

type LoginPageProps = {
    searchParams: Promise<{
        callbackUrl?: string;
        sessionRevoked?: string;
    }>;
};

const page = async ({ searchParams }: LoginPageProps) => {
    const params = await searchParams;
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading...
                </div>
            }>
            <LoginForm 
                callbackUrl={params.callbackUrl}
                sessionRevoked={params.sessionRevoked === 'true'}
            />
        </Suspense>
    )
}

export default page
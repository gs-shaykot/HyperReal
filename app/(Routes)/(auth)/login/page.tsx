'use client'

import { useActionState, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'; 
import { Eye, EyeOff, TriangleAlert, UserRoundCheck } from 'lucide-react';

type LoginState = {
    success: boolean;
    message: string;
    errors?: {
        email?: string;
        password?: string;
    };
};

const initialState: LoginState = {
    success: false,
    message: "",
    errors: {},
};

const LoginAction = async (prevState: LoginState, formData: FormData): Promise<LoginState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validation
    if (!email || !password) {
        return {
            success: false,
            message: "AUTHENTICATION_FAILED: Missing credentials",
            errors: {
                email: !email ? "Identity required" : undefined,
                password: !password ? "Passcode required" : undefined,
            },
        };
    }

    try {
        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            return {
                success: false,
                message: "ACCESS_DENIED: Invalid credentials",
                errors: {},
            };
        }

        if (res?.ok) {
            return {
                success: true,
                message: "ACCESS_GRANTED: Initializing session...",
                errors: {},
            };
        }

        return {
            success: false,
            message: "SYSTEM_ERROR: Authentication service unavailable",
            errors: {},
        };
    } catch (error) {
        return {
            success: false,
            message: "CRITICAL_ERROR: Connection to mainframe lost",
            errors: {},
        };
    }
};

export const Login = () => {
    const router = useRouter();
    const [state, action, isPending] = useActionState(LoginAction, initialState);  
    const [ShowPassword, setShowPassword] = useState(false);
    
    useEffect(() => {
        if (state.success) {
            setTimeout(() => {
                router.push('/');
            }, 1000);
        }
    }, [state.success, router]);
    
    return (
        <div className={`min-h-screen flex items-center justify-center px-4`}> 
            <div className={`light:bg-gray-100/80 bg-zinc-900/80 w-full max-w-3xl grid grid-cols-1 lg:grid-cols-2 backdrop-blur-md border border-zinc-800 rounded-md overflow-hidden shadow-2xl`}>
                <div className="p-10 flex flex-col justify-center space-y-4">
                    <div>
                        <h1 className={`text-3xl font-extrabold leading-tight`}> 
                            <span className={`light:text-zinc-900 text-white`}>SYSTEM</span><br />
                            <span className="text-second">ACCESS</span>
                        </h1>
                        
                        <p className={`light:text-zinc-700 text-zinc-400 mt-3 text-sm  max-w-sm`}>
                            Enter credentials to access the HyperReal mainframe.
                        </p>
                    </div>

                    {state.message && (
                        <div className={`
                            border-l-4 p-3 rounded-r font-mono text-xs
                            ${state.success
                                ? 'bg-green-950/50 border-green-400 text-green-700'
                                : 'bg-red-950/50 border-red-500 text-red-700'}
                            animate-pulse
                        `}>
                            <div className="flex items-start gap-2">
                                <span className="text-lg">
                                    {state.success ? <UserRoundCheck /> : <TriangleAlert />}
                                </span>
                                <div>
                                    <p className="font-bold tracking-wider">
                                        {state.success ? '[SYSTEM]' : '[ERROR]'}
                                    </p>
                                    <p className="mt-1">{state.message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form action={action} className="space-y-3">
                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    IDENTITY / EMAIL
                                </span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your identity" 
                                className={`light:bg-white light:outline-0 bg-black focus-within:outline-second input w-full border ${state.errors?.email
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-zinc-700 '
                                    } text-gray-400 placeholder:text-zinc-700`}
                                disabled={isPending}
                            />
                            {state.errors?.email && (
                                <p className="text-xs text-red-400 mt-1 font-mono">
                                    &gt; {state.errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    PASSCODE
                                </span>
                            </label>
                            <div className='relative'>
                                <input
                                    type={ShowPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter passcode"
                                    className={`light:bg-white light:outline-0 input w-full bg-black border focus-within:outline-second ${state.errors?.password
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-zinc-700 '
                                        } text-gray-400 placeholder:text-zinc-700`}
                                    disabled={isPending}
                                />
                                {
                                    ShowPassword ?
                                        <Eye size={20} className='text-second cursor-pointer absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} /> :
                                        <EyeOff size={20} className='text-second cursor-pointer  absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} />
                                }
                                {state.errors?.password && (
                                    <p className="text-xs text-red-400 mt-1 font-mono">
                                        &gt; {state.errors.password}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className={`btn w-full tracking-widest font-semibold transition-all ${isPending
                                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                                : 'bg-second text-black hover:bg-lime-400'
                                }`}
                        >
                            {isPending ? (
                                <span className="flex items-center gap-2">
                                    <span className="loading loading-spinner loading-sm"></span>
                                    AUTHENTICATING...
                                </span>
                            ) : state.success ? (
                                'ACCESS GRANTED ✓'
                            ) : (
                                'INITIALIZE SESSION'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-xs light:text-zinc-900 text-zinc-500 font-medium">
                        No identity found?{" "} 
                        <Link href="/register" className={`light:text-zinc-900 text-second font-bold hover:underline cursor-pointer`}>
                            CREATE OPERATIVE ACCOUNT
                        </Link>
                    </p>
                </div>

                {/* RIGHT PANEL */}
                <div className="relative hidden lg:flex items-center justify-center bg-zinc-950 group">

                    {/* Background image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition duration-500"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=60')",
                        }}
                    />

                    {/* Terminal Box */}
                    <div className="relative z-10 bg-white/10 backdrop-blur-md border border-second/60 rounded-lg p-4 w-64 text-sm font-mono text-second">
                        <div className="mb-4 text-lg flex items-center gap-2">
                            &gt;_
                            <span className="w-2 h-4 bg-second animate-pulse"></span>
                        </div>
                        <ul className="space-y-2 text-xs">
                            <li className="opacity-80">&gt; SECURE_CONNECTION_ESTABLISHED</li>
                            <li className="opacity-80">&gt; ENCRYPTION_LEVEL_MAX</li>
                            <li className={`transition-all duration-500 ${state.success
                                ? 'text-green-400 animate-pulse'
                                : 'opacity-80'
                                }`}>
                                &gt; {state.success ? 'ACCESS_GRANTED' : 'AWAITING_CREDENTIALS'}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
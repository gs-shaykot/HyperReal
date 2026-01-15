'use client';
import { RegisterType, UserType } from '@/app/types/RegisterState';
import axios from 'axios';
import { Eye, EyeClosed, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';

const initialState: RegisterType = {
    success: false,
    message: "",
};

export const RegisterUser = async (prevState: RegisterType, formData: FormData) => {
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return {
            success: false,
            message: 'Email and password are required.'
        }
    }

    try {
        const profileImage = formData.get('profileImage') as File | null
        let imageUrl = "https://res.cloudinary.com/dskgvk9km/image/upload/v1767725926/user_bvoihx.png"
        if (profileImage && profileImage.size > 0) {
            const uploadData = new FormData();
            uploadData.append('file', profileImage);

            const uploadRes = await axios.post('/api/uploadImage', uploadData);
            imageUrl = uploadRes.data.secure_url || uploadRes.data.url;
        }

        const UserData: UserType = {
            name: fullName.toUpperCase(),
            email,
            password,
            role: 'USER',
            PhotoUrl: imageUrl,
        }
        const registerProfile = await axios.post("/api/register", UserData)

        return {
            success: true,
            message: `User Registration Successful. Please Login to continue.`,
        }

    } catch (error) {
        return {
            success: false,
            message: 'An error occurred during registration.'
        }
    }
}

export const Register = () => {

    const [ShowPassword, setShowPassword] = useState(false);

    const [state, action, isPending] = useActionState(
        RegisterUser,
        initialState
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-main/95 px-4">
            <div className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-lg shadow-xl">
                {/* Neon top bar */}
                <div className="absolute top-0 left-0 h-1 w-full bg-second rounded-t-lg" />

                <div className="p-8 pt-10 space-y-3">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide leading-tight">
                            <span className="text-white">NEW</span>{" "}
                            <span className="text-second italic">OPERATIVE</span>
                        </h1>

                        <p className="mt-2 text-sm text-zinc-400">
                            Join the syndicate. Early access to drops and exclusive gear.
                        </p>
                    </div>

                    {/* Form */}
                    <form action={action} className="space-y-3">

                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    FULL NAME
                                </span>
                            </label>
                            {/* if anyone type the name should be uppercase */}
                            <input
                                required={true}
                                type="text"
                                name="fullName"
                                className="placeholder:text-zinc-800 text-gray-400 input w-full bg-black border border-zinc-700 focus:border-second focus:outline-none uppercase"
                                placeholder='Enter your full name'
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    EMAIL ADDRESS
                                </span>
                            </label>
                            <input
                                required={true}
                                type="email"
                                name="email"
                                className="placeholder:text-zinc-800 text-gray-400 input w-full bg-black border border-zinc-700 focus:border-second focus:outline-none lowercase"
                                placeholder='Enter your email address'
                            />
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    SET PASSCODE
                                </span>
                            </label>

                            <div className='relative'>
                                <input
                                    required={true}
                                    type={ShowPassword ? "text" : "password"}
                                    name="password"
                                    className="placeholder:text-zinc-800 text-gray-400 input w-full bg-black border border-zinc-700 focus:border-second focus:outline-none relative"
                                    placeholder='Enter your passcode'
                                />
                                {
                                    ShowPassword ?
                                        <Eye size={20} className='text-second absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} /> :
                                        <EyeOff size={20} className='text-second absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} />
                                }

                            </div>
                        </div>


                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    PROFILE IMAGE
                                </span>
                            </label>

                            <input
                                type="file"
                                name="profileImage"
                                className="file-input file-input-neutral w-full bg-black border-zinc-700 text-zinc-400 focus:border-lime-400"
                            />
                        </div>

                        {/* CTA */}
                        <button
                            disabled={isPending}

                            className="btn shadow-none w-full bg-white text-black hover:bg-zinc-200 tracking-widest font-semibold mt-2">
                            {isPending ? "Creating account..." : "Register"}
                        </button>
                    </form>
                    {
                        state.message && (
                            <p className={`text-sm mt-2 text-center ${state.success ? 'text-lime-400' : 'text-red-500'}`}>
                                User Registration {state.success ? 'Successful' : 'Failed'} : {state.message}
                            </p>
                        )
                    }
                    {/* Footer link */}
                    <div className="text-center pt-2">
                        <Link
                            href="/login"
                            className="text-xs text-zinc-500 hover:text-lime-400 tracking-wide"
                        >
                            RETURN TO LOGIN
                        </Link>

                    </div>

                </div>
            </div>
        </div>

    )
}

export default Register;
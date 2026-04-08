'use client';
import { RegisterType, UserType } from '@/app/types/RegisterState';
import { uploadImage } from '@/utils/uploadImage';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import toast from 'react-hot-toast';
import validator from 'validator';

export const Register = () => {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Only image files allowed");
            return;
        }

        setUploading(true);
        setProgress(0);
        try {
            const url = await uploadImage(file, setProgress);
            setImageUrl(url);
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // validations
        if (!email || !password) {
            return toast.error("Email & password required");
        }

        if (!validator.isEmail(email)) {
            return toast.error("Invalid email");
        }

        if (!validator.isStrongPassword(password, {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })) {
            return toast.error("Password must be strong (8+ chars, uppercase, lowercase, number, symbol)");
        }

        if (uploading) {
            return toast.error("Wait for image upload");
        }

        try {
            setLoading(true);

            const userData = {
                name: fullName.toUpperCase(),
                email,
                password,
                role: 'USER',
                PhotoUrl: imageUrl,
            };

            const res = await axios.post("/api/register", userData);

            if (res.status === 200 || res.status === 201) {
                let count = 2;

                const toastId = toast.custom(() => (
                    <div className="bg-black border border-lime-400 text-lime-400 px-6 py-4 rounded-lg font-mono">
                        <p>✅ REGISTRATION SUCCESSFUL</p>
                        <p className="text-xs text-zinc-400">
                            Redirecting in {count}s...
                        </p>
                    </div>
                ));

                const interval = setInterval(() => {
                    count--;

                    toast.custom(() => (
                        <div className="bg-black border border-lime-400 text-lime-400 px-6 py-4 rounded-lg font-mono">
                            <p>✅ REGISTRATION SUCCESSFUL</p>
                            <p className="text-xs text-zinc-400">
                                Redirecting in {count}s...
                            </p>
                        </div>
                    ), { id: toastId });

                    if (count === 0) {
                        clearInterval(interval);
                        router.push('/login');
                    }
                }, 1000);
            }

        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen light:bg-white bg-main/95 flex items-center justify-center  px-4`}>
            <div className={`light:bg-gray-100/80 light:border-t-0 light:border-zinc-800 bg-zinc-900/90 relative w-full max-w-md backdrop-blur-md border border-zinc-800 rounded-lg shadow-xl`}>
                {/* Neon top bar */}
                <div className="absolute top-0 left-0 h-1 w-full bg-second rounded-t-lg" />

                <div className="p-8 pt-10 space-y-3">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide leading-tight">
                            <span className={`light:text-zinc-900 text-white `}>NEW</span>{" "}
                            <span className="text-second italic">OPERATIVE</span>
                        </h1>
                        <p className={`light:text-zinc-700 text-zinc-400 mt-2 text-sm `}>
                            Join the syndicate. Early access to drops and exclusive gear.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-3">

                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    PROFILE IMAGE (OPTIONAL)
                                </span>
                            </label>

                            <input
                                type="file"
                                name="profileImage"
                                onChange={handleImageUpload}
                                className={`light:bg-white bg-black focus-within:outline-second file-input file-input-neutral w-full border-zinc-700 text-zinc-400 focus:border-lime-400`}
                            />
                            {uploading && (
                                <div className="mt-2">
                                    <div className="h-2 w-full bg-zinc-800 rounded overflow-hidden">
                                        <div
                                            className="h-full bg-lime-400 shadow-[0_0_10px_#00ff9c] transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-lime-400 mt-1 font-mono">
                                        Uploading... {progress}%
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    FULL NAME
                                </span>
                            </label>

                            <input
                                required={true}
                                type="text"
                                name="fullName"
                                className={`light:bg-white bg-black focus-within:outline-second placeholder:text-zinc-800 text-gray-400 input w-full border border-zinc-700 uppercase`}
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
                                className={`light:bg-white bg-black focus-within:outline-second placeholder:text-zinc-800 text-gray-400 input w-full border border-zinc-700 lowercase`}
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
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className={`light:bg-white bg-black focus-within:outline-second placeholder:text-zinc-800 text-gray-400 input w-full border border-zinc-700 focus:border-second focus:outline-none relative`}
                                    placeholder='Enter your passcode'
                                />
                                {
                                    showPassword ?
                                        <Eye size={20} className='text-second absolute top-2.5 right-2' onClick={() => setShowPassword(!showPassword)} /> :
                                        <EyeOff size={20} className='text-second absolute top-2.5 right-2' onClick={() => setShowPassword(!showPassword)} />
                                }

                            </div>
                        </div>


                        <button
                            disabled={loading || uploading}
                            className="btn w-full bg-second text-black"
                        >
                            {uploading
                                ? "Uploading image..."
                                : loading
                                    ? "Creating account..."
                                    : "Register"}
                        </button>
                    </form>

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
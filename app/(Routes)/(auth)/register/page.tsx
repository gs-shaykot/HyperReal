'use client';
import { RegisterType, UserType } from '@/app/types/RegisterState';
import { uploadImage } from '@/utils/uploadImage';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import validator from 'validator';

export const Register = () => {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const [cooldown, setCooldown] = useState(0);
    const [sendingOtp, setSendingOtp] = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return;

        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [cooldown]);


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

    const handleSendOtp = async () => {
        if (cooldown > 0) return;

        const email = (document.querySelector('[name="email"]') as HTMLInputElement)?.value;

        if (!email || !validator.isEmail(email)) {
            return toast.error("Email required to send OTP");
        }

        try {
            setSendingOtp(true);

            const res = await axios.post("/api/sendOtp", { email });
            
            if (res.status === 200) {
                setOtpSent(true);
                setCooldown(60); 
                toast.success(res.data.message);
            }

        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setSendingOtp(false);
        }
    };

    const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        const formData = new FormData(form);

        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            return toast.error("Email & password required");
        }

        if (!validator.isEmail(email)) {
            return toast.error("Invalid email");
        }

        if (!validator.isStrongPassword(password, {
            minLength: 8,
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

        if (!otpSent) {
            return toast.error("Please verify your email first ");
        }

        if (!otp || otp.length !== 6) {
            return toast.error("Enter valid OTP");
        }

        
        try {
            setLoading(true);

            const userData = {
                name: fullName.toUpperCase(),
                email: email.toLowerCase(),
                password,
                role: 'USER',
                PhotoUrl: imageUrl,
                otp
            };

            const res = await axios.post("/api/register", userData);

            if (res.status === 200 || res.status === 201) {
                let count = 2;

                const toastId = toast.custom(() => (
                    <div className="bg-black border border-second text-second px-6 py-4 rounded-lg font-mono">
                        <p>✅ REGISTRATION SUCCESSFUL</p>
                        <p className="text-xs text-zinc-400">
                            Redirecting in {count}s...
                        </p>
                    </div>
                ));

                const interval = setInterval(() => {
                    count--;

                    toast.custom(() => (
                        <div className="bg-black border border-second text-second px-6 py-4 rounded-lg font-mono">
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
                                className={`light:bg-white bg-black focus-within:outline-second file-input file-input-neutral w-full border-zinc-700 text-zinc-400 focus:border-second`}
                            />
                            {uploading && (
                                <div className="mt-2">
                                    <div className="h-2 w-full bg-zinc-800 rounded overflow-hidden">
                                        <div
                                            className="h-full bg-second shadow-[0_0_10px_#00ff9c] transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs light:text-zinc-800 text-second mt-1 font-medium font-mono">
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
                                className={`light:bg-white bg-black focus-within:outline-second placeholder:text-zinc-700 placeholder:font-normal light:text-zinc-800 text-second light:font-bold input w-full border border-zinc-700 uppercase`}
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
                                className={`light:bg-white bg-black focus-within:outline-second placeholder:text-zinc-700 placeholder:font-normal light:text-zinc-800 text-second light:font-bold input w-full border border-zinc-700 lowercase`}
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
                                    className={`light:bg-white bg-black focus-within:outline-second placeholder:text-zinc-700 placeholder:font-normal light:text-zinc-800 text-second light:font-bold input w-full border border-zinc-700 focus:border-second focus:outline-none relative`}
                                    placeholder='Enter your passcode'
                                />
                                {
                                    showPassword ?
                                        <Eye size={20} className='text-second absolute top-2.5 right-2' onClick={() => setShowPassword(!showPassword)} /> :
                                        <EyeOff size={20} className='text-second absolute top-2.5 right-2' onClick={() => setShowPassword(!showPassword)} />
                                }

                            </div>
                        </div>

                        {/* OTP SECTION */}
                        <div className="space-y-2">
                            <label className="label">
                                <span className="label-text text-xs tracking-widest text-zinc-500">
                                    EMAIL VERIFICATION CODE
                                </span>
                            </label>

                            <div className="flex gap-2">
                                {/* OTP Input */}
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    className="flex-1 light:bg-white bg-black border border-zinc-700 placeholder:text-zinc-700  placeholder:font-normal light:text-zinc-800 text-second light:font-bold  input focus:border-second focus:outline-none tracking-[0.5em] text-center font-mono"
                                />

                                {/* Send OTP Button */}
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp || cooldown > 0}
                                    className={`px-4 bg-transparent hover:bg-second light:hover:bg-zinc-900 cursor-pointer border light:border-zinc-900 border-second light:text-zinc-900 light:hover:text-white text-second text-xs tracking-widest rounded-md hover:text-black transition-all duration-200 font-mono ${cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}

                                >
                                    {
                                        sendingOtp ? "SENDING..."
                                            : cooldown > 0
                                                ? `RESEND (${cooldown}s)`
                                                : otpSent
                                                    ? "RESEND"
                                                    : "SEND"

                                    }
                                </button>
                            </div> 
                            
                            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">
                                WE WILL SEND A VERIFICATION CODE TO YOUR EMAIL
                            </p>
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
                            className="text-xs text-zinc-500 hover:text-second tracking-wide"
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
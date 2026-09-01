import axios from 'axios';
import { Check, Eye, EyeOff, LockKeyhole, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast';
import zxcvbn from "zxcvbn";

type ChangePassModalProps = {
    open: boolean;
    onCloseAction: () => void;
};

export const ChangePassModal = ({ open, onCloseAction }: ChangePassModalProps) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [ShowPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const passwordRequirements = useMemo(() => {
        return {
            minLength: newPassword.length >= 6,
            numberOrSpecial: /[\d\W_]/.test(newPassword),
        };
    }, [newPassword]);

    const passwordStrength = useMemo(() => {
        if (!newPassword) {
            return {
                score: 0,
                label: "",
            };
        }

        const result = zxcvbn(newPassword);

        return {
            score: result.score,
            label: [
                "Too weak",
                "Weak",
                "Fair",
                "Good",
                "Strong",
            ][result.score],
        };
    }, [newPassword]);

    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            const message = "Please fill in all fields.";
            setError(message);
            toast.error(message);
            return;
        }

        if (!passwordRequirements.minLength) {
            const message = "New password must be at least 6 characters long.";
            setError(message);
            toast.error(message);
            return;
        }

        if (!passwordRequirements.numberOrSpecial) {
            const message = "New password must include at least one number or special character.";
            setError(message);
            toast.error(message);
            return;
        }

        if (currentPassword === newPassword) {
            const message = "New password cannot be the same as the current password.";
            setError(message);
            toast.error(message);
            return;
        }

        if (!passwordsMatch) {
            const message = "New password and confirm password do not match.";
            setError(message);
            toast.error(message);
            return;
        }

        if (passwordStrength.score < 2) {
            const message = "New password is too weak.";
            setError(message);
            toast.error(message);
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await axios.post('/api/user/changePassword', {
                currentPassword,
                newPassword,
            });

            if (res.data.success !== true) {
                const message = res.data.message || res.data.error || "Something went wrong.";
                setError(message);
                toast.error(message);
                return;
            }

            toast.success(res.data.message || "Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setError("");
            onCloseAction();

        }
        catch (error) {
            const message = axios.isAxiosError(error)
                ? (error.response?.data?.message || error.response?.data?.error || "Something went wrong.")
                : (error instanceof Error ? error.message : "Something went wrong.");

            setError(message);
            toast.error(message);
        }
        finally {
            setIsSubmitting(false);
        }
    }


    if (!open) return null;
    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-lg rounded-none border border-zinc-700 bg-main light:bg-white px-4 py-5 shadow-xl text-white light:text-zinc-900">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                    <div className="flex justify-between space-x-4 items-start">
                        <LockKeyhole size={24} className='text-second' />
                        <div>
                            <h1 className='text-lg font-bold mb-1'>CHANGE PASSWORD</h1>
                            <p className='text-xs'>Update your account password.</p>
                        </div>
                    </div>
                    <button onClick={onCloseAction} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                </div>

                <form onSubmit={handleSubmit} className="modal-action mt-2 flex flex-col ">
                    <div className="border-b border-zinc-700 pb-4">
                        <div>
                            <label className="label mb-2 w-full">
                                <div className='flex justify-between w-full items-center'>
                                    <span className="label-text text-xs tracking-widest text-zinc-500">
                                        CURRENT PASSWORD
                                    </span>
                                </div>
                            </label>
                            <div className='relative'>
                                <input
                                    type={ShowPassword ? "text" : "password"}
                                    name="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className={`input w-full rounded-none bg-main focus-within:outline-0 focus:border-second text-gray-400 placeholder:text-zinc-700`}
                                />
                                {
                                    ShowPassword ?
                                        <Eye size={20} className='text-second cursor-pointer absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} /> :
                                        <EyeOff size={20} className='text-second cursor-pointer  absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} />
                                }
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label className="label mb-2 w-full">
                                <div className='flex justify-between w-full items-center'>
                                    <span className="label-text text-xs tracking-widest text-zinc-500">
                                        NEW PASSWORD
                                    </span>
                                </div>
                            </label>
                            <div className='relative'>
                                <input
                                    type={ShowPassword ? "text" : "password"}
                                    name="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className={`input w-full rounded-none bg-main focus-within:outline-0 focus:border-second text-gray-400 placeholder:text-zinc-700`}
                                />
                                {
                                    ShowPassword ?
                                        <Eye size={20} className='text-second cursor-pointer absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} /> :
                                        <EyeOff size={20} className='text-second cursor-pointer  absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} />
                                }
                            </div>
                        </div>

                        <div className="mb-4 mt-1">
                            <label className="label mb-2 w-full">
                                <div className="flex justify-between w-full items-center">
                                    <span className="label-text text-xs tracking-widest text-zinc-500">
                                        PASSWORD STRENGTH:
                                    </span>
                                    <span
                                        className={`text-xs ${passwordStrength.score >= 3
                                            ? "text-second"
                                            : "text-zinc-400"
                                            }`}
                                    >
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            </label>

                            {/* Strength bars */}
                            <div className="grid grid-cols-4 items-center gap-2">
                                {Array.from({ length: 4 }).map(
                                    (_, index) => (
                                        <span
                                            key={index}
                                            className={`h-2 w-full rounded-2xl transition-colors ${index <
                                                passwordStrength.score
                                                ? "bg-second"
                                                : "bg-zinc-600"
                                                }`}
                                        />
                                    )
                                )}
                            </div>

                            {/* Requirements */}
                            <div className="mt-2 flex justify-between gap-4">

                                {/* Minimum length */}
                                <div className="flex items-center space-x-2">
                                    {passwordRequirements.minLength ? (
                                        <Check
                                            size={14}
                                            className="rounded-full bg-second p-0.5 text-zinc-900"
                                        />
                                    ) : (
                                        <X
                                            size={14}
                                            className="rounded-full bg-zinc-600 p-0.5 text-zinc-300"
                                        />
                                    )}

                                    <h3 className="text-[10px]">
                                        At least 6 characters
                                    </h3>
                                </div>

                                {/* Number / special */}
                                <div className="flex items-center space-x-2">
                                    {passwordRequirements.numberOrSpecial ? (
                                        <Check
                                            size={14}
                                            className="rounded-full bg-second p-0.5 text-zinc-900"
                                        />
                                    ) : (
                                        <X
                                            size={14}
                                            className="rounded-full bg-zinc-600 p-0.5 text-zinc-300"
                                        />
                                    )}

                                    <h3 className="text-[10px]">
                                        Include numbers or special characters
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div >
                            <label className="label mb-2 w-full">
                                <div className='flex justify-between w-full items-center'>
                                    <span className="label-text text-xs tracking-widest text-zinc-500">
                                        CONFIRM NEW PASSWORD
                                    </span>
                                </div>
                            </label>
                            <div className='relative'>
                                <input
                                    type={ShowPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className={`input w-full rounded-none bg-main focus-within:outline-0 focus:border-second text-gray-400 placeholder:text-zinc-700`}
                                />
                                {
                                    ShowPassword ?
                                        <Eye size={20} className='text-second cursor-pointer absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} /> :
                                        <EyeOff size={20} className='text-second cursor-pointer  absolute top-2.5 right-2' onClick={() => setShowPassword(!ShowPassword)} />
                                }
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            disabled={isSubmitting}
                            className="btn mt-2 rounded-none border-white bg-transparent hover:bg-white hover:text-black"
                        >
                            CANCEL
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn mt-2 rounded-none bg-second text-zinc-900"
                        >
                            {isSubmitting
                                ? "UPDATING..."
                                : "UPDATE PASSWORD"}
                        </button>
                    </div>
                </form >

                {/* Backdrop */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={onCloseAction}>close</button>
                </form>
            </div >
        </dialog >
    );
}

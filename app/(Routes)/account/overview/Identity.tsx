'use client'
import { EmailVerification } from '@/app/(Routes)/account/overview/EmailVerification';
import { useProfile } from '@/app/Hooks/useProfile';
import { getProfile } from '@/lib/profileApi';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Mail, Phone, Save, Shield, SquarePen, User, X } from 'lucide-react'
import { useSession } from 'next-auth/react';
import { useState } from 'react'
import toast from 'react-hot-toast';

type PendingProfile = {
    id?: string;
    name: string;
    email: string;
    phone: string;
};

export const Identity = () => {
    const { update } = useSession();
    const updateProfileMutation = useProfile();
    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
    });
    const [isEditing, setIsEditing] = useState(false)
    const [open, setOpen] = useState(false);
    const [pendingProfileData, setPendingProfileData] = useState<PendingProfile | null>(null);
    const [formData, setFormData] = useState({
        name: profile?.name ?? "",
        email: profile?.email ?? "",
        phone: profile?.phone ?? "",
    });

    if (isLoading) {
        return (
            <div className="border border-neutral-700 bg-[#0f0f0f] p-5 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-44 bg-zinc-800 rounded" />
                    <div className="h-9 w-20 bg-zinc-800 rounded" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-3 w-20 bg-zinc-800 rounded" />
                            <div className="h-5 w-40 bg-zinc-700 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const sendOtpToNewEmail = async (email: string) => {
        if (!profile?.id) return;

        await axios.post('/api/sendOtp', {
            email,
            purpose: 'PROFILE_UPDATE',
            userId: profile.id,
        });
    };

    const handleSave = async (payload: PendingProfile, otp?: string) => {
        if (
            payload.name === profile?.name &&
            payload.email === profile?.email &&
            payload.phone === profile?.phone
        ) {
            setIsEditing(false);
            setOpen(false);
            setPendingProfileData(null);
            return;
        }

        updateProfileMutation.mutate({ ...payload, otp }, {
            onSuccess: async () => {
                setIsEditing(false);
                setOpen(false);
                setPendingProfileData(null);
                await update();
            },
            onError: () => {
                setPendingProfileData(null);
            }
        });
    };

    const handleSaveClick = async () => {
        const profileData = {
            id: profile?.id,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
        };

        if (!profileData.name || !profileData.email || !profileData.phone) {
            toast.error('Name, email and phone are required.');
            return;
        }

        const emailChanged = profileData.email.toLowerCase() !== profile?.email?.toLowerCase();

        if (!emailChanged) {
            await handleSave(profileData);
            return;
        }

        setPendingProfileData(profileData);

        try {
            await sendOtpToNewEmail(profileData.email);
            setOpen(true);
            toast.success('Verification code sent to your new email.');
        } catch (error: unknown) {
            setOpen(false);
            setPendingProfileData(null);
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to send verification code.');
        }
    };

    return (
        <div className="border border-neutral-700 light:border-zinc-300 bg-[#0f0f0f] light:bg-white p-3">
            <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold light:text-zinc-900 text-white">
                    IDENTITY MATRIX
                </h2>

                <div>
                    {
                        isEditing && (
                            <div className='flex items-center justify-between'>
                                <button onClick={() => setIsEditing(false)} className="mr-2 btn btn-sm btn-outline rounded-none border-0 bg-transparent light:text-zinc-900 text-white hover:bg-[#262626] light:hover:bg-zinc-100 light:hover:text-zinc-900 hover:text-white">
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button onClick={handleSaveClick} className='light:text-white text-black group relative flex btn btn-sm bg-second font-bold shadow-none border-0 rounded-none hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300 hover:scale-105'>

                                    <span className={` flex items-center gap-2`}>
                                        <Save size={16} strokeWidth={2} />
                                        SAVE
                                    </span>
                                </button>
                            </div>
                        )
                    }

                    {open && pendingProfileData && (
                        <EmailVerification
                            email={pendingProfileData.email}
                            open={open}
                            onCloseAction={() => {
                                setOpen(false);
                                setPendingProfileData(null);
                            }}
                            onResend={async () => {
                                await sendOtpToNewEmail(pendingProfileData.email);
                            }}
                            onVerify={async (otp) => {
                                await handleSave(pendingProfileData, otp);
                            }}
                        />
                    )}

                    {
                        !isEditing && (
                            <button onClick={() => {
                                setIsEditing(true);
                                if (profile) {
                                    setFormData({
                                        name: profile.name ?? "",
                                        email: profile.email ?? "",
                                        phone: profile.phone ?? "",
                                    });
                                }
                            }} className="btn btn-sm btn-outline rounded-none border border-zinc-700 light:border-zinc-500 hover:bg-white light:hover:bg-main text-white light:text-zinc-900 hover:text-zinc-900 light:hover:text-white">
                                <SquarePen size={16} />
                                Edit
                            </button>
                        )
                    }

                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">

                <div className={`${isEditing ? "" : "border-b border-zinc-800 light:border-zinc-300"}`}>
                    <div className="flex items-center gap-2 mb-3 ">
                        <User size={18} strokeWidth={0.75} className="light:text-zinc-700 text-zinc-400" />
                        <p className="text-neutral-500 light:text-zinc-800 text-sm">
                            Full Name
                        </p>
                    </div>
                    {
                        !isEditing && (
                            <h3 className="pb-2 text-sm light:text-zinc-900 text-white">{formData.name}</h3>
                        )
                    }

                    {
                        isEditing && (
                            <input type="text" onChange={(e) => setFormData({ ...formData, name: e.target.value })} value={formData.name || "Your Name"} placeholder="Medium" className="input input-md w-full bg-[#0f0f0f] light:bg-white border border-zinc-800 light:border-zinc-300 rounded-none light:text-zinc-900 text-white placeholder:text-zinc-500 light:placeholder:text-zinc-400 focus:border-second outline-0" />
                        )
                    }
                </div>

                <div className="border-b border-zinc-800 light:border-zinc-300">
                    <div className="flex items-center gap-2 mb-3 ">
                        <Shield size={18} strokeWidth={0.75} className="light:text-zinc-700 text-zinc-400" />
                        <p className="text-neutral-500 light:text-zinc-800 text-sm">
                            Role
                        </p>
                    </div>

                    <h3 className="pb-2 text-sm light:text-zinc-900 text-white">{profile?.role}</h3>
                </div>

                <div className={`${isEditing ? "" : "border-b border-zinc-800 light:border-zinc-300"}`}>
                    <div className="flex items-center gap-2 mb-3 ">
                        <Mail size={18} strokeWidth={0.75} className="light:text-zinc-700 text-zinc-400" />
                        <p className="text-neutral-500 light:text-zinc-800 text-sm">
                            Email
                        </p>
                    </div>
                    {
                        !isEditing && (
                            <h3 className="pb-2 text-sm light:text-zinc-900 text-white">{formData.email}</h3>
                        )
                    }

                    {
                        isEditing && (
                            <input type="text" onChange={(e) => setFormData({ ...formData, email: e.target.value })} readOnly={!(isEditing && profile?.authProvider === "EMAIL")} value={formData.email} placeholder="Medium" className="input input-md w-full bg-[#0f0f0f] light:bg-white border border-zinc-800 light:border-zinc-300 rounded-none light:text-zinc-900 text-white placeholder:text-zinc-500 light:placeholder:text-zinc-400 focus:border-second outline-0 disabled:cursor-not-allowed disabled:opacity-80" />
                        )
                    }
                </div>

                <div className={`${isEditing ? "" : "border-b border-zinc-800 light:border-zinc-300"}`}>
                    <div className="flex items-center gap-2 mb-3 ">
                        <Phone size={18} strokeWidth={0.75} className="light:text-zinc-700 text-zinc-400" />
                        <p className="text-neutral-500 light:text-zinc-800 text-sm">
                            Phone
                        </p>
                    </div>
                    {
                        !isEditing && (
                            <h3 className="pb-2 text-sm light:text-zinc-900 text-white">{formData.phone || "+8801XXXXXXXXX"}</h3>
                        )
                    }

                    {
                        isEditing && (
                            <input type="text" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} value={formData.phone || "+8801XXXXXXXXX"} placeholder="Medium" className="input input-md w-full bg-[#0f0f0f] light:bg-white border border-zinc-800 light:border-zinc-300 rounded-none light:text-zinc-900 text-white placeholder:text-zinc-500 light:placeholder:text-zinc-400 focus:border-second outline-0" />
                        )
                    }
                </div>

            </div>

        </div>
    )
}

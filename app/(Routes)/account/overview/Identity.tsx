'use client'
import { useProfile } from '@/app/Hooks/useProfile';
import { getProfile } from '@/lib/profileApi';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, Save, Shield, SquarePen, User, X } from 'lucide-react'
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react'

export const Identity = () => {
    const { update } = useSession();
    const updateProfileMutation = useProfile();
    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
    });
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name ?? "",
                email: profile.email ?? "",
                phone: profile.phone ?? "",
            });
        }
    }, [profile]);
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
    const handleSave = async () => {
        const profileData = {
            id: profile?.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        }

        if (
            profileData.name === profile?.name &&
            profileData.email === profile?.email &&
            profileData.phone === profile?.phone
        ) {
            setIsEditing(false);
            return;
        }

        updateProfileMutation.mutate(profileData, {
            onSuccess: async () => {
                setIsEditing(false);
                await update();
            }
        });
    }
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
                                <button onClick={handleSave} className='light:text-white text-black group relative flex btn btn-sm bg-second font-bold shadow-none border-0 rounded-none hover:shadow-[0_0_20px_rgba(163,230,53,0.8)] transition-all duration-300 hover:scale-105'>

                                    <span className={` flex items-center gap-2`}>
                                        <Save size={16} strokeWidth={2} />
                                        SAVE
                                    </span>
                                </button>
                            </div>
                        )
                    }
                    {
                        !isEditing && (
                            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline rounded-none border border-zinc-700 light:border-zinc-500 hover:bg-white light:hover:bg-main text-white light:text-zinc-900 hover:text-zinc-900 light:hover:text-white">
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

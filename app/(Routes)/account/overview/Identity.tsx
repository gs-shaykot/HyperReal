'use client'
import { useProfile } from '@/app/Hooks/useProfile';
import { getProfile } from '@/lib/profileApi';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, Save, Shield, SquarePen, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Identity = () => {
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
            <div className="border border-neutral-700 bg-[#0f0f0f] p-3">
                <p>Loading...</p>
            </div>
        );
    }
    const handleSave = () => {
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
            onSuccess: () => {
                setIsEditing(false);
            }
        });
    }
    console.log(profile)
    return (
        <div className="border border-neutral-700 bg-[#0f0f0f] p-3">
            <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-bold">
                    Identity Matrix
                </h2>

                <div>
                    {
                        isEditing && (
                            <div className='flex items-center justify-between'>
                                <button onClick={() => setIsEditing(false)} className="mr-2 btn btn-sm btn-outline rounded-none border-0 bg-transparent hover:bg-[#262626] light:hover:bg-zinc-900 hover:text-white">
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
                            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline rounded-none hover:bg-white light:hover:bg-zinc-900 hover:text-zinc-900">
                                <SquarePen size={16} />
                                Edit
                            </button>
                        )
                    }
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">

                <div className={`${isEditing ? "" : "border-b border-zinc-800"}`}>
                    <div className="flex items-center gap-2 mb-3 ">
                        <User size={18} strokeWidth={0.75} />
                        <p className="text-neutral-500 text-sm">
                            Full Name
                        </p>
                    </div>
                    {
                        !isEditing && (
                            <h3 className="pb-2 text-sm">{formData.name}</h3>
                        )
                    }

                    {
                        isEditing && (
                            <input type="text" onChange={(e) => setFormData({ ...formData, name: e.target.value })} value={formData.name || "Your Name"} placeholder="Medium" className="input input-md w-full bg-main rounded-none" />
                        )
                    }
                </div>

                <div className="border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-3 ">
                        <Shield size={18} strokeWidth={0.75} />
                        <p className="text-neutral-500 text-sm">
                            Role
                        </p>
                    </div>

                    <h3 className="pb-2 text-sm">{profile?.authprovider}</h3>
                </div>

                <div className={`${isEditing ? "" : "border-b border-zinc-800"}`}>
                    <div className="flex items-center gap-2 mb-3 ">
                        <Mail size={18} strokeWidth={0.75} />
                        <p className="text-neutral-500 text-sm">
                            Email
                        </p>
                    </div>
                    {
                        !isEditing && (
                            <h3 className="pb-2 text-sm">{formData.email}</h3>
                        )
                    }

                    {
                        isEditing && (
                            <input type="text" onChange={(e) => setFormData({ ...formData, email: e.target.value })} readOnly={!(isEditing && profile?.authProvider === "EMAIL")} value={formData.email} placeholder="Medium" className="input input-md w-full bg-main rounded-none" />
                        )
                    }
                </div>

                <div className={`${isEditing ? "" : "border-b border-zinc-800"}`}>
                    <div className="flex items-center gap-2 mb-3 ">
                        <Phone size={18} strokeWidth={0.75} />
                        <p className="text-neutral-500 text-sm">
                            Phone
                        </p>
                    </div>
                    {
                        !isEditing && (
                            <h3 className="pb-2 text-sm">{formData.phone || "+8801XXXXXXXXX"}</h3>
                        )
                    }

                    {
                        isEditing && (
                            <input type="text" onChange={(e) => setFormData({ ...formData, phone: e.target.value })} value={formData.phone || "+8801XXXXXXXXX"} placeholder="Medium" className="input input-md w-full bg-main rounded-none" />
                        )
                    }
                </div>

            </div>

        </div>
    )
}

'use client';
import { ActiveSessionsModal } from '@/app/(Routes)/account/settings/ActiveSessionsModal';
import { ChangePassModal } from '@/app/(Routes)/account/settings/ChangePassModal';
import { DeleteAccountModal } from '@/app/(Routes)/account/settings/DeleteAccountModal';
import { useSessionQuery } from '@/app/Hooks/useSessionQuery';
import { getSessions } from '@/lib/signoutSession';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    ArrowRight,
    Bell,
    ChevronRight,
    Download,
    HelpCircle,
    LockKeyhole,
    Mail,
    MonitorSmartphone,
    PackageCheck,
    Shield,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';


type ModalType = | 'change-password' | 'active-sessions' | 'delete-account' | 'account-data' | null;
type settingRowType = {
    icon: React.ElementType;
    title: string;
    description: string;
    kind: 'toggle' | 'button';
    modal?: Exclude<ModalType, null>;
}

const settingsSections: {
    icon: React.ElementType;
    label: string;
    description: string;
    rows: settingRowType[];
}[] = [
        {
            icon: Bell,
            label: 'Notification Preferences',
            description: 'Choose what you want to be notified about.',
            rows: [
                {
                    icon: Mail,
                    title: 'Marketing emails',
                    description: 'Updates about new projects, features and more.',
                    kind: 'toggle',
                },
                {
                    icon: PackageCheck,
                    title: 'Order notifications',
                    description: 'Updates about your orders and deliveries.',
                    kind: 'toggle',
                },
            ],
        },

        {
            icon: Shield,
            label: 'Security',
            description: 'Keep your account and data secure.',
            rows: [
                {
                    icon: LockKeyhole,
                    title: 'Change password',
                    description: 'Update your account password.',
                    kind: 'button',
                    modal: 'change-password',
                },
                {
                    icon: MonitorSmartphone,
                    title: 'Active sessions & devices',
                    description: 'Manage your active sessions and devices.',
                    kind: 'button',
                    modal: 'active-sessions',
                },
            ],
        },

        {
            icon: UserRound,
            label: 'Account',
            description: 'Manage your account and privacy.',
            rows: [
                {
                    icon: Trash2,
                    title: 'Delete account',
                    description: 'Permanently delete your account and all data.',
                    kind: 'button',
                    modal: 'delete-account',
                },
                {
                    icon: Download,
                    title: 'Account data & privacy',
                    description: 'Download your data or manage privacy settings.',
                    kind: 'button',
                    modal: 'account-data',
                },
            ],
        },
    ];


export const AllSettings = ({ userNotifications: { marketingNotifications, orderNotifications } }: { userNotifications: { marketingNotifications: boolean; orderNotifications: boolean } }) => {

    const [notifications, setNotifications] = useState({
        marketingEmails: marketingNotifications ?? true,
        orderNotifications: orderNotifications ?? true,
        isSaving: false
    });
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const { data: sessions, isLoading: sessionsLoading } = useQuery({
        queryKey: ["sessions"],
        queryFn: getSessions,
    });
    const signoutMutation = useSessionQuery();

    useEffect(() => {
        console.log("ActiveSessions sessions:", sessions);
    }, [sessions, sessionsLoading]);

    const handleToggle = (key: 'marketingEmails' | 'orderNotifications') => {
        setNotifications((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleNotificationChange = async () => {
        try {
            setNotifications((prev) => ({ ...prev, isSaving: true }));
            const res = await axios.post('/api/account/setting', {
                marketingEmails: notifications.marketingEmails,
                orderNotifications: notifications.orderNotifications,
            });
            console.log('Notification settings updated:', res.data);
            if (res.data.success) {
                toast.success(res.data.message || 'Notification settings updated successfully');
            }
        }
        catch (error) {
            console.error('Error updating notification settings:', error);
        }
        finally {
            setNotifications((prev) => ({ ...prev, isSaving: false }));
        }
    }

    return (
        <section className="min-h-screen text-zinc-100 light:text-zinc-900">
            <div className="mx-auto max-w-300">
                <header className="mb-4 border-b border-[#2a2d30] light:border-black pb-4">
                    <h2 className='text-2xl font-bold italic text-white light:text-zinc-900'>Profile<span className='text-second'> Setting</span></h2>
                    <p className="mt-2 text-[15px] text-[#a7afb8] light:text-zinc-600">
                        Manage your account, security and preferences.
                    </p>
                </header>

                <div className="mt-6 space-y-5">
                    {settingsSections.map(({ icon: SectionIcon, label, description, rows }, idx) => (
                        <div key={label}>
                            <div
                                className="grid overflow-hidden border border-[#2a2d30] light:border-black bg-[#0f0f0f] light:bg-white md:grid-cols-[250px_minmax(0,1fr)]"
                            >
                                <div className="flex items-start gap-4 border-b border-[#2a2d30] light:border-black p-5 md:border-b-0 md:border-r">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-second">
                                        <SectionIcon size={24} strokeWidth={2} />
                                    </div>
                                    <div className="pt-0.5">
                                        <h2 className="text-[15px] font-bold text-white light:text-zinc-900">{label}</h2>
                                        <p className="mt-1 max-w-45 text-[13px] leading-5 text-[#9aa4af] light:text-zinc-600">{description}</p>
                                    </div>
                                </div>
                                <div>
                                    {rows.map(({ icon: RowIcon, title, description: rowDescription, kind, modal }) => {
                                        const toggleKey =
                                            title === 'Marketing emails' ? 'marketingEmails' :
                                                title === 'Order notifications' ? 'orderNotifications' : null;
                                        return (
                                            <div
                                                key={title}
                                                className={`flex items-center justify-between gap-4 border-b border-[#2a2d30] light:border-black ${title === 'Delete account' ? 'bg-red-500/40 light:bg-red-100' : 'light:bg-white'} px-5 py-4 last:border-b-0`}
                                            >
                                                <div className="flex min-w-0 flex-1 items-center gap-4">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#2a2d30] light:border-zinc-300 text-white light:text-zinc-900 bg-transparent">
                                                        <RowIcon className="h-5 w-5" strokeWidth={1.9} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[15px] font-medium text-white light:text-zinc-900">{title}</p>
                                                        <p className="mt-1 text-[13px] leading-5 text-[#8f98a3] light:text-zinc-600">{rowDescription}</p>
                                                    </div>
                                                </div>
                                                {kind === 'toggle' ? (
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            className="toggle toggle-success h-6 w-11 border-none bg-[#2a2d30] light:bg-zinc-200 checked:bg-second"
                                                            checked={toggleKey ? notifications[toggleKey] : false}
                                                            onChange={() => {
                                                                if (toggleKey) handleToggle(toggleKey);
                                                            }}
                                                        />
                                                        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#cbd5e1] light:text-zinc-700">
                                                            {toggleKey && notifications[toggleKey] ? 'ON' : 'OFF'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            if (modal) {
                                                                setActiveModal(modal);
                                                            }
                                                        }}
                                                        type="button"
                                                        aria-label={`Open ${title}`}
                                                        className="btn border border-[#3a3f45] light:border-zinc-300 bg-zinc-950 light:bg-zinc-100 text-white light:text-zinc-900 hover:bg-zinc-800 light:hover:bg-zinc-200"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {
                                    idx === 0 && (
                                        <button
                                            onClick={() => handleNotificationChange()}
                                            className={`btn mt-2 col-span-2 m-2 rounded-none bg-second text-zinc-900 light:text-white`}>{
                                                notifications.isSaving ? 'Saving...' : 'Save Changes'
                                            }</button>
                                    )
                                }
                            </div>
                        </div>
                    ))}

                    {
                        activeModal === 'change-password' && (
                            <ChangePassModal open={true} onCloseAction={() => setActiveModal(null)} />
                        )
                    }
                    {
                        activeModal === 'active-sessions' && (
                            <ActiveSessionsModal
                                open={true}
                                onCloseAction={() => setActiveModal(null)}
                                sessions={sessions}
                                onSignoutSession={(sessionId) => signoutMutation.mutate({ type: "single", sessionId })}
                                onSignoutAllSessions={() => signoutMutation.mutate({ type: "all" })}
                            />
                        )
                    }
                    {
                        activeModal === 'delete-account' && (
                            <DeleteAccountModal open={true} onCloseAction={() => setActiveModal(null)} />
                        )
                    }

                    <div className="grid overflow-hidden border border-[#2a2d30] light:border-black bg-[#0f0f0f] light:bg-white md:grid-cols-[250px_minmax(0,1fr)]">
                        <div className="flex items-center gap-3 border-b border-[#2a2d30] light:border-black p-5 md:border-b-0 md:border-r">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full text-second">
                                <HelpCircle size={24} strokeWidth={2.2} />
                            </div>
                            <h2 className="text-[15px] font-bold text-white light:text-zinc-900">Need help?</h2>
                        </div>

                        <div className="flex flex-col justify-center gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-[13px] leading-5 text-[#9aa4af] light:text-zinc-600">
                                If you have any questions, feel free to reach out via the contact page.
                            </p>

                            <button
                                type="button"
                                className="btn btn-md gap-2 border border-[#3a3f45] light:border-zinc-300 bg-transparent text-white light:text-zinc-900 hover:bg-zinc-900 light:hover:bg-zinc-100 hover:text-white light:hover:text-zinc-900"
                            >
                                <span>Go to Contact</span>
                                <ArrowRight className="h-4 w-4" strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};  
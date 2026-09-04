import axios from "axios";
import {
    Info,
    Laptop,
    LogOut,
    Monitor,
    MonitorDot,
    Smartphone,
    Tablet,
    Trash2,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

type ActiveSessionsModalProps = {
    open: boolean;
    onCloseAction: () => void;
    sessions: ActiveSession[];
    onSignoutSession: (sessionId: string) => void;
    onSignoutAllSessions: () => void;
};

export type ActiveSession = {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    deviceType: string;
    deviceName: string;
    browser: string;
    os: string;
    createdAt: string;
    lastUsed: string;
    expiresAt: string;
    isCurrent: boolean;
};

const DeviceIcon = ({ deviceType }: { deviceType: string }) => {
    const type = deviceType.toLowerCase();

    if (type === "mobile") {
        return <Smartphone size={24} strokeWidth={1.8} />;
    }

    if (type === "tablet") {
        return <Tablet size={24} strokeWidth={1.8} />;
    }

    // Desktop / laptop
    if (type === "desktop") {
        return <Monitor size={24} strokeWidth={1.8} />;
    }

    return <Laptop size={24} strokeWidth={1.8} />;
};


const formatLastActive = (
    lastUsed: string,
    isCurrent: boolean
) => {
    if (isCurrent) {
        return "Now";
    }

    const lastUsedDate = new Date(lastUsed);
    const now = new Date();

    const difference =
        now.getTime() - lastUsedDate.getTime();

    const seconds = Math.floor(
        difference / 1000
    );

    const minutes = Math.floor(
        seconds / 60
    );

    const hours = Math.floor(
        minutes / 60
    );

    const days = Math.floor(
        hours / 24
    );

    if (seconds < 60) {
        return "Just now";
    }

    if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"
            } ago`;
    }

    if (hours < 24) {
        return `${hours} ${hours === 1 ? "hour" : "hours"
            } ago`;
    }

    if (days < 7) {
        return `${days} ${days === 1 ? "day" : "days"
            } ago`;
    }

    return lastUsedDate.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    );
};

const getLocation = (
    session: ActiveSession
) => {
    const parts = [
        session.city,
        session.region,
        session.country,
    ].filter(Boolean);

    if (parts.length === 0) {
        return "Location unavailable";
    }

    return parts.join(", ");
};

export const ActiveSessionsModal = ({
    open,
    onCloseAction,
    sessions,
    onSignoutSession,
    onSignoutAllSessions,
}: ActiveSessionsModalProps) => {

    const handleSignout = async (sessionId: string | null, signoutType: 'single' | 'all') => {
        if (signoutType === 'single') {
            const res = await axios.delete(`/api/account/sessions/${sessionId}`);
            if (res?.data.success) {
                toast.success(res.data.message);
            }
        }
        if (signoutType === 'all') {
            const res = await axios.delete(`/api/account/sessions/others`);
            if (res?.data.success) {
                toast.success(res.data.message);
            }
        }
    }


    if (!open) return null;
    return (
        <dialog className="modal modal-open">
            <div
                className="modal-box max-w-6xl rounded-none border border-zinc-600 bg-main p-0 text-white shadow-2xl light:bg-white light:text-zinc-900 light:border-zinc-300">

                <div className="relative px-4 py-4 border-b border-zinc-800 light:border-zinc-300">
                    <div className="flex justify-between  items-start">

                        <div className="flex justify-between items-start gap-3">
                            <MonitorDot size={24} strokeWidth={1.8} className="text-second" />
                            <div>
                                <h1 className='text-lg font-bold ' >
                                    ACTIVE SESSIONS & DEVICES
                                </h1>

                                <p className="text-sm text-zinc-400 light:text-zinc-500">Manage devices where you're currently signed in.</p>
                            </div>
                        </div>

                    </div>
                    <button onClick={onCloseAction} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </div>

                <div className=" px-4 py-4  ">
                    <div className="grid grid-cols-2 gap-4">

                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`group relative flex items-center gap-5 px-4 py-2 rounded-none border transition-all ${session.isCurrent ? "border-second bg-second/4.5 llight:bg-second/4" : "border-zinc-80 bg-transparent hover:border-zinc-600 light:border-zinc-300 light:hover:border-zinc-400"}`}
                            >
                                {session.isCurrent && (
                                    <span className="absolute left-2 top-3 h-2 w-2 -translate-y-1/2 rounded-full bg-second ring-4 ring-[#090d10] light:ring-white" />
                                )}

                                <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-white light:border-zinc-300 light:bg-zinc-100 light:text-zinc-800"
                                >
                                    <DeviceIcon deviceType={session.deviceType} />
                                </div>


                                {/* ================================= */}
                                {/* DEVICE INFORMATION */}
                                {/* ================================= */}

                                <div className="min-w-0 flex-1">

                                    {/* Device name */}
                                    <div
                                        className="flex flex-wrap items-center gap-x-2 gap-y-1"
                                    >
                                        <h2 className="text-base font-bold tracking-wide" >
                                            {session.deviceName}
                                        </h2>

                                        {session.isCurrent && (
                                            <>
                                                <span className=" text-zinc-500">
                                                    •
                                                </span>

                                                <span className="text-sm font-medium text-second" >
                                                    This Device
                                                </span>
                                            </>
                                        )}
                                    </div>


                                    {/* Browser + location */}
                                    <p className="mt-2 truncate text-sm text-zinc-300 light:text-zinc-600" >
                                        {session.browser}

                                        <span className="mx-2 text-zinc-600">
                                            •
                                        </span>

                                        {getLocation(session)}
                                    </p>


                                    {/* Last active */}
                                    <p
                                        className="mt-1.5 text-sm text-zinc-400 light:text-zinc-500"
                                    >
                                        Last active:{" "}
                                        {formatLastActive(
                                            session.lastUsed,
                                            session.isCurrent
                                        )}
                                    </p>
                                </div>


                                {/* ================================= */}
                                {/* CURRENT BADGE / SIGN OUT */}
                                {/* ================================= */}

                                <div
                                    className="ml-auto shrink-0"
                                >
                                    {session.isCurrent ? (
                                        <span className="inline-flex items-center rounded-md bg-second/10 px-3 py-2 text-xs font-bold tracking-wide text-second" >
                                            CURRENT
                                        </span>
                                    ) : (
                                        <button onClick={() => onSignoutSession(session.id)} type="button" className="cursor-pointer group/logout flex items-center gap-2 text-sm font-semibold text-red-400 transition hover:text-red-300" >
                                            <span>
                                                SIGN OUT
                                            </span>

                                            <Trash2
                                                size={21}
                                                strokeWidth={1.8}
                                                className="transition group-hover/logout:scale-110"
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                    </div>


                    {/* ================================================= */}
                    {/* SIGN OUT OTHER SESSIONS */}
                    {/* ================================================= */}

                    {sessions.some(
                        (session) => !session.isCurrent
                    ) && (
                            <button
                                onClick={() => onSignoutAllSessions()}
                                type="button"
                                className="cursor-pointer mt-5 flex w-full items-center justify-center gap-3 rounded-none border border-zinc-500 bg-transparent px-5 py-4 text-base font-semibold tracking-wide text-white transition hover:bg-zinc-800 light:border-zinc-400 light:text-zinc-900 light:hover:bg-zinc-100"
                            >
                                <LogOut
                                    size={22}
                                    strokeWidth={1.8}
                                />

                                <span>
                                    SIGN OUT OTHER SESSIONS
                                </span>
                            </button>
                        )}


                    {/* ================================================= */}
                    {/* SECURITY INFORMATION */}
                    {/* ================================================= */}

                    <div
                        className="mt-7 flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900/30 px-5 py-5 light:border-zinc-200 light:bg-zinc-50"
                    >
                        {/* Info icon */}
                        <div className="shrink-0 pt-0.5">
                            <Info
                                size={24}
                                strokeWidth={1.8}
                                className="text-second"
                            />
                        </div>

                        <div>
                            <p
                                className="text-sm font-medium text-second"
                            >
                                Don't recognize a device?
                            </p>

                            <p
                                className="mt-1.5 text-sm leading-6 text-zinc-400 light:text-zinc-500"
                            >
                                We recommend signing out of all other
                                sessions and changing your password.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <form
                method="dialog"
                className="modal-backdrop"
            >
                <button
                    type="button"
                    onClick={onCloseAction}
                >
                    close
                </button>
            </form>
        </dialog>
    );
};
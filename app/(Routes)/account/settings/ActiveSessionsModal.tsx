
import { MonitorDot } from 'lucide-react'; 

type ActiveSessionsModalProps = {
    open: boolean;
    onCloseAction: () => void;
    sessions: ActiveSession[];
};

export type ActiveSession = {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    deviceType: string;
    deviceName: string;
    browser: string;
    os: string;
    createdAt: string;
    lastUsed: string;
    expiresAt: string;
    isCurrent: boolean;
};

export const ActiveSessionsModal = ({ open, onCloseAction, sessions }: ActiveSessionsModalProps) => {
    console.log("ActiveSessionsModal sessions:", sessions);
    if (!open) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-lg rounded-none border border-zinc-700 bg-main light:bg-white px-4 py-5 shadow-xl text-white light:text-zinc-900">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                    <div className="flex justify-between space-x-4 items-start">
                        <MonitorDot size={24} className='text-second' />
                        <div>
                            <h1 className='text-lg font-bold mb-1'>Active Sessions and Devices</h1>
                            <p className='text-xs'>Manage your active sessions and devices.</p>
                        </div>
                    </div>
                    <button onClick={onCloseAction} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                </div>

                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div key={session.id} className="border border-base-300 p-3">
                            <p className="font-medium">{session.deviceName}</p>
                            <p className="text-sm opacity-70">{session.browser} on {session.os}</p>
                            {session.isCurrent && (
                                <p className="text-sm text-second">Current session</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Backdrop */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={onCloseAction}>close</button>
                </form>
            </div>
        </dialog>
    );
}

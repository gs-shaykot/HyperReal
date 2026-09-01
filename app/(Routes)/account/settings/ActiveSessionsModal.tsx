import React from 'react'

type ActiveSessionsModalProps = {
    open: boolean;
    onCloseAction: () => void;
};


export const ActiveSessionsModal = ({ open, onCloseAction }: ActiveSessionsModalProps) => {
    if (!open) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-xl rounded-lg border border-base-300 bg-main light:bg-white p-8 shadow-xl text-white light:text-zinc-900">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Active Sessions</h3>
                    <button onClick={onCloseAction} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>

                </div>

                {/* Backdrop */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={onCloseAction}>close</button>
                </form>
            </div>
        </dialog>
    );
}

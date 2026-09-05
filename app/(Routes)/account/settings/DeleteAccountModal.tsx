import axios from "axios";
import {
    AlertTriangle,
    CreditCard,
    FileText,
    Heart,
    MapPin,
    Monitor,
    ShoppingBag,
    Trash,
    X,
} from "lucide-react";

type DeleteAccountModalType = {
    open: boolean;
    onCloseAction: () => void;
};

export const DeleteAccountModal = ({
    open,
    onCloseAction,
}: DeleteAccountModalType) => {
    if (!open) return null;

    const handleDeleteAccount = async () => {
        try {
            const res = await axios.delete("/api/account/delete");
            // yet not implemented.
            if (res.status === 200) { 
                window.location.href = "/";
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    return (
        <dialog className="modal modal-open">
            <div className="modal-box w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-none border border-zinc-700 bg-main p-0 text-white shadow-2xl light:border-zinc-200 light:bg-white light:text-zinc-900">

                <div className="flex items-start justify-between border-b border-zinc-800 px-6 py-5 light:border-zinc-200">
                    <div className="flex items-start gap-4">

                        {/* Icon */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
                            <Trash size={23} strokeWidth={1.8} />
                        </div>

                        {/* Heading */}
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight">
                                Delete account
                            </h1>

                            <p className="mt-1 text-xs text-zinc-400 light:text-zinc-500">
                                This action is permanent and cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* Close */}
                    <button
                        type="button"
                        onClick={onCloseAction}
                        className="cursor-pointer flex h-8 w-8 shrink-0 items-center justify-center rounded-none text-zinc-400 transition hover:bg-zinc-800 hover:text-white light:hover:bg-zinc-100 light:hover:text-zinc-900"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-2">

                    <h2 className=" font-semibold tracking-tight">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-zinc-400 light:text-zinc-500">
                        This will permanently delete your account and all
                        associated data from our system, including:
                    </p>

                    <div className="mt-5 overflow-hidden rounded-none border border-zinc-800 bg-zinc-900/30 light:border-zinc-200 light:bg-zinc-50">

                        {/* Orders */}
                        <div className="flex items-center gap-3.5 px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-zinc-800 text-zinc-300 light:bg-zinc-200 light:text-zinc-600">
                                <ShoppingBag size={17} />
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Orders
                                </p>
                                <p className="text-xs text-zinc-500 light:text-zinc-400">
                                    All your orders and order details
                                </p>
                            </div>
                        </div>


                        {/* Order history */}
                        <div className="flex items-center gap-3.5 px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-zinc-800 text-zinc-300 light:bg-zinc-200 light:text-zinc-600">
                                <FileText size={17} />
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Order history
                                </p>
                                <p className="text-xs text-zinc-500 light:text-zinc-400">
                                    Past order status and history records
                                </p>
                            </div>
                        </div>


                        {/* Payments */}
                        <div className="flex items-center gap-3.5 px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-zinc-800 text-zinc-300 light:bg-zinc-200 light:text-zinc-600">
                                <CreditCard size={17} />
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Payment records
                                </p>
                                <p className="text-xs text-zinc-500 light:text-zinc-400">
                                    Payment information and transaction history
                                </p>
                            </div>
                        </div>


                        {/* Addresses */}
                        <div className="flex items-center gap-3.5 px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-zinc-800 text-zinc-300 light:bg-zinc-200 light:text-zinc-600">
                                <MapPin size={17} />
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Saved addresses
                                </p>
                                <p className="text-xs text-zinc-500 light:text-zinc-400">
                                    Your saved shipping and billing addresses
                                </p>
                            </div>
                        </div>


                        {/* Sessions */}
                        <div className="flex items-center gap-3.5 px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-zinc-800 text-zinc-300 light:bg-zinc-200 light:text-zinc-600">
                                <Monitor size={17} />
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Active sessions
                                </p>
                                <p className="text-xs text-zinc-500 light:text-zinc-400">
                                    All logged-in devices and sessions
                                </p>
                            </div>
                        </div>


                        {/* Cart & Wishlist */}
                        <div className="flex items-center gap-3.5 px-4 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-zinc-800 text-zinc-300 light:bg-zinc-200 light:text-zinc-600">
                                <Heart size={17} />
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Cart & wishlist
                                </p>
                                <p className="text-xs text-zinc-500 light:text-zinc-400">
                                    Items in your cart and wishlist
                                </p>
                            </div>
                        </div>

                    </div>

                    <div className="mt-5 flex gap-3 rounded-none border border-red-500/20 bg-red-500/5 px-4 py-3.5">

                        <AlertTriangle
                            size={20}
                            className="mt-0.5 shrink-0 text-red-400"
                            strokeWidth={1.8}
                        />

                        <div>
                            <p className="text-sm font-medium text-red-400">
                                This action cannot be undone.
                            </p>

                            <p className="mt-1 text-xs leading-5 text-zinc-500 light:text-zinc-400">
                                Once your account is deleted, there is no way
                                to recover your account or its associated data.
                            </p>
                        </div>

                    </div>

                </div>


                <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4 light:border-zinc-200">

                    <button
                        type="button"
                        onClick={onCloseAction}
                        className=" cursor-pointer h-10 rounded-none border border-zinc-700 bg-zinc-900 px-5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 light:border-zinc-300 light:bg-white light:text-zinc-700 light:hover:bg-zinc-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleDeleteAccount}
                        type="button"
                        className=" cursor-pointer flex h-10 items-center gap-2 rounded-none bg-red-500 px-5 text-sm font-medium text-white transition hover:bg-red-600 active:scale-[0.98]"
                    >
                        <Trash size={17} />
                        Delete account
                    </button>

                </div>

            </div>

            {/* Backdrop */}
            <form
                method="dialog"
                className="modal-backdrop"
            >
                <button onClick={onCloseAction}>
                    close
                </button>
            </form>
        </dialog>
    );
};
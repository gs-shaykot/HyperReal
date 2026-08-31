import { Mail, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type AddressModalProps = {
    open: boolean;
    email: string;
    onCloseAction: () => void;
    onResend?: () => Promise<void>;
    onVerify: (otp: string) => Promise<void> | void;
};

export const EmailVerification = ({ open, email, onCloseAction, onResend, onVerify }: AddressModalProps) => {
    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const [cooldown, setCooldown] = useState(120);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!open) return;

        setCode(Array(6).fill(""));
        setCooldown(120);
    }, [open, email]);

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const next = [...code];
        next[index] = digit;
        setCode(next);

        if (digit && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleResend = async () => {
        if (!onResend || isResending || cooldown > 0) return;

        setIsResending(true);

        try {
            await onResend();
            setCooldown(120);
            setCode(Array(6).fill(""));
            toast.success('A new verification code was sent.');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to resend code.');
        } finally {
            setIsResending(false);
        }
    };

    const handleVerify = async () => {
        const otp = code.join("");
        if (otp.length !== 6) {
            toast.error('Enter the 6-digit verification code.');
            return;
        }

        setIsSubmitting(true);
        try {
            await onVerify(otp);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3">
            <div className="relative w-full max-w-2xl border border-[#282828] border-t-4 border-t-second bg-[#101010] p-7 shadow-[0_0_30px_rgba(0,0,0,0.45)]">

                <button onClick={onCloseAction} type="button" aria-label="Close"
                    className="absolute right-7 top-7 z-30 cursor-pointer text-[32px] font-extralight leading-none text-[#999] transition-colors hover:text-[#d0d0d0]">
                    <X size={25} />
                </button>

                <div className="flex justify-between mb-4">
                    <div className="pb-3 flex h-18 w-18 items-center justify-center border border-[#b6ff00] bg-[#101900]">
                        <Mail className="text-second" size={40} />
                    </div>
                    <h3 className="relative -top-5 z-0 -mb-3 pointer-events-none text-[80px] font-bold leading-none text-second/10">OTP</h3>
                </div>

                <h2 className="mb-2 font-mono text-[28px] font-bold uppercase tracking-[0.04em] text-[#f1f1f1]">
                    Verify New Email
                </h2>

                <p className="max-w-143.75 font-mono text-[17px] leading-[1.55] text-[#999]">
                    <span className="text-[#818181]">Identity change detected. A 6-digit security code</span>
                    <br />
                    <span className="text-[#818181]">was transmitted to </span>
                    <span className="text-[#b6ff00]">{email}</span>
                    <span className="text-[#818181]">. Enter it to</span>
                    <br />
                    <span className="text-[#818181]">authorize the update.</span>
                </p>

                <div className="flex gap-4.5 my-5">
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            maxLength={1}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            aria-label={`OTP digit ${index + 1}`}
                            className={`h-15 w-15 border bg-[#0c0c0c] text-center font-mono text-[30px] font-bold text-[#b6ff00] outline-none transition-colors ${index === 0 ? "border-[#b6ff00] shadow-[0_0_22px_rgba(182,255,0,0.14)]" : "border-[#292929] focus:border-[#b6ff00] focus:shadow-[0_0_22px_rgba(182,255,0,0.14)]"}`}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending || cooldown > 0}
                        className="font-mono text-[17px] font-bold tracking-[0.04em] text-[#b6ff00] transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isResending ? 'Sending...' : cooldown > 0 ? 'Resend Code' : 'Resend Code'}
                    </button>

                    <div className="font-mono text-[17px] tracking-[0.04em] text-[#888]">
                        {cooldown > 0 ? `CODE EXPIRES IN ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")}` : 'CODE EXPIRED'}
                    </div>
                </div>

                <div className="mt-5 flex gap-3">
                    <button type="button" onClick={onCloseAction}
                        className="flex h-12 flex-1 items-center justify-center gap-4 border border-[#eeeeee] bg-transparent font-mono text-lg font-bold uppercase tracking-[0.03em] text-[#eeeeee] transition-colors hover:bg-[#181818] cursor-pointer">
                        <span className="font-normal leading-none"><X size={20} /></span>
                        Abort
                    </button>

                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleVerify}
                        className="flex h-12 flex-[1.1] items-center justify-center gap-4 bg-[#719500] font-mono text-lg font-bold uppercase tracking-[0.03em] text-[#090909] transition-colors hover:bg-[#86ad00] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <Shield size={20} />
                        {isSubmitting ? 'Verifying...' : 'Verify & Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};

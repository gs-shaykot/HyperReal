'use client';

import axios from "axios";
import { Eye, EyeOff, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import validator from "validator";


const RecoverAccess = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleSendCode = async () => {
    if (cooldown > 0 || sendingCode) return;

    if (!email || !validator.isEmail(email)) {
      return toast.error("Enter a valid account email first.");
    }

    try {
      setSendingCode(true);

      const res = await axios.post("/api/password-reset/request", {
        email: email.toLowerCase(),
      });

      if (res.status === 200) {
        setOtpSent(true);
        setCooldown(60);
        toast.success(res.data.message);
      }
    }
    catch (error: any) {
      toast.error(error.response?.data?.message)
    }
    finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !validator.isEmail(email)) {
      return toast.error("Enter a valid email address.");
    }

    if (!otpSent) {
      return toast.error("Request a reset code first.");
    }

    if (!otp || otp.length !== 6) {
      return toast.error("Enter the 6-digit reset code.");
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return toast.error("Password must be strong (8+ chars, uppercase, lowercase, number, symbol).");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }

    try {
      setResettingPassword(true);

      const res = await axios.post("/api/password-reset/confirm", {
        email: email.toLowerCase(),
        otp,
        password,
      });

      if (res.status === 200) {
        toast.success("Password updated. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1200);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-white">
      <div className="relative w-full max-w-md overflow-hidden border border-[#1a1f1c]  p-8 shadow-2xl">
        <div className="absolute left-0 top-0 h-full w-1 bg-lime-400" />
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div className="h-px bg-zinc-800 grow mr-4"></div>
          <div className="flex items-center gap-2">
            <span className="text-[#b4ff39] text-[10px] font-mono tracking-widest uppercase">
              access_key_reset
            </span>
            <Terminal size={18} className="text-second dur animate-pulse " />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-black italic tracking-tighter uppercase leading-none">
            Recover Access
          </h1>
          <p className="text-zinc-500 mt-3 text-sm font-medium">
            Request a reset code, verify it, then choose a new password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[3px] text-lime-400">
              Recovery Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@gmail.com"
              className="w-full bg-[#1a1f1c] px-4 py-3 text-gray-300 outline-none placeholder:text-gray-600"
              disabled={resettingPassword}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[3px] text-lime-400">
              Reset Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-DIGIT CODE"
                className="flex-1 bg-[#1a1f1c] px-4 py-3 font-mono tracking-[0.4em] text-gray-300 outline-none placeholder:tracking-[0.2em] placeholder:text-gray-600"
                disabled={resettingPassword}
              />

              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || cooldown > 0 || resettingPassword}
                className={`min-w-28 border cursor-pointer border-lime-400 px-3 py-3 text-xs font-semibold uppercase tracking-[2px] transition ${sendingCode || cooldown > 0 || resettingPassword
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-lime-400 hover:text-black"
                  }`}
              >
                {sendingCode
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend ${cooldown}s`
                    : otpSent
                      ? "Resend"
                      : "Send Code"}
              </button>
            </div>

            <p className="text-[10px] tracking-[2px] text-gray-500">
              The verification code expires after 2 minutes.
            </p>
          </div>

          {otpSent && (
            <>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[3px] text-lime-400">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ENTER NEW PASSCODE"
                    className="w-full bg-[#1a1f1c] px-4 py-3 pr-12 text-gray-300 outline-none placeholder:text-gray-600"
                    disabled={resettingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lime-400"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {/* FIX: EyeOff when visible, Eye when hidden */}
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[3px] text-lime-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="RE-ENTER PASSCODE"
                    className="w-full bg-[#1a1f1c] px-4 py-3 pr-12 text-gray-300 outline-none placeholder:text-gray-600"
                    disabled={resettingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lime-400"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  > 
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={resettingPassword}
            className={`w-full py-3 font-semibold uppercase tracking-[2px] transition ${resettingPassword
              ? "cursor-not-allowed bg-lime-200 text-black/60"
              : "bg-lime-400 text-black hover:bg-lime-300"
              }`}
          >
            {resettingPassword ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs tracking-[2px] text-gray-500 transition hover:text-gray-300">
          <Link href="/login">Return to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RecoverAccess;

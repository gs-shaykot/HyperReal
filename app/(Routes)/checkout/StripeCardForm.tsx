"use client";

import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";

const stripeElementOptions = {
  style: {
    base: {
      color: "#ffffff",
      fontSize: "14px",
      fontFamily: "monospace",
      fontSmoothing: "antialiased",

      "::placeholder": {
        color: "#52525b",
      },
    },

    invalid: {
      color: "#ef4444",

      "::placeholder": {
        color: "#ffffff",
      },
    },
  },
};

type FocusedField = "number" | "expiry" | "cvc" | null;
interface StripeCardFormProps {
  cardHolderName: string;
  onCardHolderNameChange: (value: string) => void;
}

export default function StripeCardForm({ cardHolderName, onCardHolderNameChange }: StripeCardFormProps) {
  const [focusedField, setFocusedField] = useState<FocusedField>(null);


  return (
    <div className="mt-6 space-y-5">

      {/* CARD HOLDER */}
      <div>
        <label className="label label-text text-xs text-gray-400 uppercase">
          Full Name
        </label>

        <input
          name="fullName"
          type="text"
          placeholder="JANE DOE"
          defaultValue={cardHolderName}
          onChange={(e) => onCardHolderNameChange(e.target.value)}
          required
          className="input w-full py-3.5 bg-black border border-gray-900 rounded-none focus:outline-none focus:border-second text-sm tracking-wide placeholder:text-zinc-600"
        />
      </div>

      {/* CARD NUMBER */}
      <div>
        <label className="block text-xs text-gray-400 uppercase mb-2 tracking-wider">
          Card Number
        </label>

        <div
          className={`w-full px-4 py-3.5 bg-black border rounded-none focus:outline-none ${focusedField === "number" ? "border-second" : "border-gray-900"} text-sm tracking-wide placeholder:text-red-500`}>
          <CardNumberElement
            options={stripeElementOptions}
            onFocus={() =>
              setFocusedField("number")
            }
            onBlur={() =>
              setFocusedField(null)
            } />
        </div>

      </div>

      {/* EXPIRY + CVC */}
      <div className="grid grid-cols-2 gap-4">

        {/* EXPIRY */}
        <div>
          <label className="block text-xs text-gray-400 uppercase mb-2 tracking-wider">
            Expiry
          </label>

          <div
            className={`w-full px-4 py-3.5 bg-black border rounded-none focus:outline-none ${focusedField === "expiry" ? "border-second" : "border-gray-900"} text-sm tracking-wide placeholder:text-red-500`}>
            <CardExpiryElement
              options={stripeElementOptions}
              onFocus={() =>
                setFocusedField("expiry")
              }
              onBlur={() =>
                setFocusedField(null)
              }
            />
          </div>
        </div>


        {/* CVC */}

        <div>
          <label className="block text-xs text-gray-400 uppercase mb-2 tracking-wider">
            CVC
          </label>

          <div
            className={`w-full px-4 py-3.5 bg-black border rounded-none focus:outline-none ${focusedField === "cvc" ? "border-second" : "border-gray-900"} text-sm tracking-wide placeholder:text-red-500`}>
            <CardCvcElement
              options={stripeElementOptions}
              onFocus={() =>
                setFocusedField("cvc")
              }
              onBlur={() =>
                setFocusedField(null)
              }
            />
          </div>
        </div>

      </div>

    </div>
  );
}

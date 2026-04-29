import React from "react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

type OctagonProps = {
    icon?: React.ReactNode;
    glow?: boolean;
    color?: string;
    iconSize?: number;
    opacity?: string;
};

export const Octagon = ({
    icon = <Sparkles size={30} strokeWidth={2.2} />,
    glow = false,
    color = "#84cc16",
    iconSize = 30,
    opacity = "opacity-25",
}: OctagonProps) => {
    return (
        <div className="relative w-18 h-18 flex items-center justify-center group">
            {
                glow && (
                    <div className="absolute inset-0 rounded-full bg-second/5 blur-lg animate-pulse" />
                )
            }

            <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full"
                fill="none"
            >
                <polygon
                    points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30"
                    className="octagon-border"
                />

                <polygon
                    points="34,10 66,10 90,34 90,66 66,90 34,90 10,66 10,34"
                    stroke={color}
                    className={`${opacity}`}
                    strokeWidth="3"
                />
            </svg>

            {
                glow && (
                    <div className="absolute w-10 h-10 bg-lime-300/10 blur-md rounded-full animate-pulse" />
                )
            }


            <div className="relative z-10 flex justify-center items-center" style={{ color }}>
                {icon}
            </div>
        </div>
    );
};

import { getAdminCoupons } from "@/utils/AdminUtils/getAdminCoupons";

const CouponsPage = async () => {
    const couponData = await getAdminCoupons();

    return (
        <div className="min-h-screen bg-main p-4 light:bg-white">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold tracking-[0.08em] text-white light:text-zinc-900">
                        COUPONS & DISCOUNTS
                    </h1>

                    <p className="mt-1 font-mono text-xs text-zinc-500">
                        {couponData.active} active coupons
                    </p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label: "ACTIVE",
                        value: couponData.active,
                    },
                    {
                        label: "EXPIRED",
                        value: couponData.expired,
                    },
                    {
                        label: "TOTAL USED",
                        value: couponData.totalUsed,
                    },
                    {
                        label: "TOTAL COUPONS",
                        value: couponData.total,
                    },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="border border-zinc-800 bg-[#101010] p-4 light:border-zinc-200 light:bg-white"
                    >
                        <p className="font-mono text-[10px] tracking-[0.14em] text-zinc-400">
                            {stat.label}
                        </p>

                        <p className="mt-2 text-xl font-bold text-second">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 border border-zinc-800 p-6 text-sm text-zinc-400 light:border-zinc-200">
                Coupon list will be implemented in the next step.
            </div>
        </div>
    );
};

export default CouponsPage;

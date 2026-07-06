import { Identity } from "@/app/(Routes)/account/overview/Identity";
import StatCard from "@/app/(Routes)/account/StatCard";
import { authOptions } from "@/lib/auth";
import { CircleCheckBig, Heart, Mail, Package, Phone, Shield, SquarePen, User, } from "lucide-react";
import { getServerSession } from "next-auth";

export default async function OverviewPage() {
  const session = await getServerSession(authOptions);
  const { id, name, email, image, authProvider } = session?.user || {}; 
  console.log("AuthProvider:", session?.user);

  return (
    <div className="space-y-6 ">

      <div className="grid grid-cols-3 gap-5">
        <StatCard
          title="Orders"
          value={4}
          icon={<Package />}
        />
        <StatCard
          title="Delivered"
          value={1}
          icon={<CircleCheckBig />}
        />
        <StatCard
          title="Wishlist"
          value={3}
          icon={<Heart />}
        />
      </div>

      <Identity id={id as string} name={name as string} email={email as string} image={image as string} authProvider={authProvider as string} />

      <div className="border border-neutral-700 bg-[#0f0f0f] p-6">

        <h2 className="text-3xl font-bold mb-6">
          Recent Activity
        </h2>

        {[1, 2, 3].map((order) => (
          <div
            key={order}
            className="border-b border-neutral-800 py-4 flex justify-between"
          >
            <div>
              <p>ORD-88{order}</p>
              <small className="text-neutral-500">
                2 Items
              </small>
            </div>

            <p className="text-lime-400">
              $200
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}
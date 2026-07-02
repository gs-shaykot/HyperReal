import StatCard from "@/app/(Routes)/account/StatCard";
import { CircleCheckBig, Heart, Package } from "lucide-react";


export default function OverviewPage() {
  return (
    <div className="space-y-6">

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

      <div className="border border-neutral-700 p-6">

        <h2 className="text-3xl font-bold mb-6">
          Identity Matrix
        </h2>

        <div className="grid grid-cols-2 gap-8">

          <div>
            <p className="text-neutral-500">
              Full Name
            </p>

            <h3>GS Shaykot</h3>
          </div>

          <div>
            <p className="text-neutral-500">
              Username
            </p>

            <h3>gsshaykot</h3>
          </div>

          <div>
            <p className="text-neutral-500">
              Email
            </p>

            <h3>gs@email.com</h3>
          </div>

          <div>
            <p className="text-neutral-500">
              Phone
            </p>

            <h3>+8801XXXXXXXXX</h3>
          </div>

        </div>

      </div>

      <div className="border border-neutral-700 p-6">

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
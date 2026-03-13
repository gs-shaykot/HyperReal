import { Banner } from "@/app/components/(Home_Components)/Banner";
import { HeatProduct } from "@/app/components/(Home_Components)/Trending/HeatProduct";
import { LatestProduct } from "@/app/components/(Home_Components)/Latest/LatestProduct";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Category } from "@/app/(Routes)/products/Category";
import { Category_Count } from "@/app/components/(Home_Components)/Category/Category_Count";

export default async function Home() {

  const session = await getServerSession(authOptions);


  if (!session) {
  }

  return (
    <div className=" shadow-gray-300  text-white">
      <Banner />
      <HeatProduct />
      <LatestProduct />
      <Category_Count />
    </div>
  );
}

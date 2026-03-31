import { Banner } from "@/app/components/(Home_Components)/Banner";
import { HeatProduct } from "@/app/components/(Home_Components)/Trending/HeatProduct";
import { LatestProduct } from "@/app/components/(Home_Components)/Latest/LatestProduct";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Category_Count } from "@/app/components/(Home_Components)/Category/Category_Count";
import { Upcoming } from "@/app/components/(Home_Components)/Upcoming/Upcoming";

export default async function Home() { 
  return (
    <div className=" shadow-gray-300  text-white">
      <Banner />
      <HeatProduct />
      <Category_Count />
      <Upcoming />
      <LatestProduct />
    </div>
  );
}

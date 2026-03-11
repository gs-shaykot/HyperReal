import { Banner } from "@/app/components/(Home_Components)/Banner";
import { HeatProduct } from "@/app/components/(Home_Components)/HeatProduct";
import { LatestProduct } from "@/app/components/(Home_Components)/LatestProduct";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Home() {

  const session = await getServerSession(authOptions);


  if (!session) {
  }

  return (
    <div className=" shadow-gray-300  text-white">
      <Banner />
      <HeatProduct />
      <LatestProduct /> 
    </div>
  );
}

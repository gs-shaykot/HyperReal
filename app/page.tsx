import { Banner } from "@/app/components/(Home_Components)/Banner";
import { HeatProduct } from "@/app/components/(Home_Components)/Trending/HeatProduct";
import { LatestProduct } from "@/app/components/(Home_Components)/Latest/LatestProduct";
import { Category_Count } from "@/app/components/(Home_Components)/Category/Category_Count";
import { Upcoming } from "@/app/components/(Home_Components)/Upcoming/Upcoming";
import { ComboPack } from "@/app/components/(Home_Components)/ComboPack/ComboPack";
import { Marquee } from "@/app/components/(Home_Components)/Marquee/Marquee";

export default function Home() {
  return (
    <div className="shadow-gray-300 text-white">
      <Marquee />
      <Banner />
      <HeatProduct />
      <Category_Count />
      <Upcoming />
      <LatestProduct />
      <ComboPack />
    </div>
  );
}

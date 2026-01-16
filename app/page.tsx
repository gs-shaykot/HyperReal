import { Banner } from "@/app/components/(Home_Components)/Banner";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Home() {

  const session = await getServerSession(authOptions);

  // console.log("SERVER SESSION:", session?.user);

  if (!session) {
  }

  return (
    <div className=" shadow-gray-300 bg-main text-white">
      <Banner />
    </div>
  );
}

import prisma from "@/lib/prisma";
import Image from "next/image";

export default function Home() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1 className="border-2 rounded-full border-red-500 p-2">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum harum magni blanditiis deserunt nemo doloremque excepturi quaerat. Vel, non eum.</h1>
    </div>
  );
}

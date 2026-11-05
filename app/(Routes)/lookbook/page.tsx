import prisma from "@/lib/prisma";
import LookbookExperience from "./LookbookExperience";

export const metadata = {
  title: "Lookbook | HYPERREAL",
  description: "Explore curated HyperReal editorial looks and discover the pieces behind each style.",
};

export default async function LookbookPage() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, name: true, price: true,
      category: { select: { name: true, slug: true } },
      productImages: { select: { imageUrl: true }, take: 1 },
    },
  });
  return <LookbookExperience products={products} />;
}
import prisma from "@/lib/prisma";
import LookbookExperience from "./LookbookExperience";

export const metadata = {
  title: "Lookbook | HYPERREAL",
  description: "Explore curated HyperReal editorial looks and discover the pieces behind each style.",
};

export default async function LookbookPage() {
  const rows = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true, name: true, price: true,
      category: { select: { name: true, slug: true } },
      productImages: { select: { imageUrl: true } },
    },
  });
  // Convert Prisma Decimal to a plain number before crossing the Server/Client boundary.
  const products = rows.map(product => ({ ...product, price: Number(product.price) }));
  return <LookbookExperience products={products} />;
}

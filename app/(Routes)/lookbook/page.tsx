import prisma from "@/lib/prisma";
import LookbookExperience from "./LookbookExperience";

export const metadata = {
  title: "Lookbook | HYPERREAL",
  description: "Explore curated HyperReal editorial looks and discover the pieces behind each style.",
};

export default async function LookbookPage() {
  // Fetch the full image set per product: hotspot matching must not depend on
  // whichever image happens to be first in the product gallery.
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true, name: true, price: true,
      category: { select: { name: true, slug: true } },
      productImages: { select: { imageUrl: true } },
    },
  });
  return <LookbookExperience products={products} />;
}

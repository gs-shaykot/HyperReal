interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;
}

export interface CategoryProps {
  categories: {
    id: string
    name: string
    slug: string
    createdAt: Date
  }[],
  activeId?: string | number | null;
  products?: Product[] | null;
}

// export interface ExtendedCategoryProps extends CategoryProps {
//   activeId: string | number | null;
//   setActiveId: (id: string | number | null) => void;
// }
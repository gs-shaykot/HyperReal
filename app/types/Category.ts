export interface CategoryProps {
  categories: {
    id: string
    name: string
    slug: string
    createdAt: Date
  }[],
  activeId?: string | number | null;
}

// export interface ExtendedCategoryProps extends CategoryProps { 
//   activeId: string | number | null;
//   setActiveId: (id: string | number | null) => void;
// }
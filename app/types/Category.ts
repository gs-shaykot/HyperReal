export interface CategoryProps {
  categories: {
    id: string
    name: string
    slug: string
    createdAt: Date
  }[]
}

export interface ExtendedCategoryProps extends CategoryProps { 
  activeId: string | number | null;
  setActiveId: (id: string | number | null) => void;
}
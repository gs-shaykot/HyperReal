
interface Category {
  id: string
  name: string 
}

export interface ProductType {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;

  category: {    
    name: string;
    slug: string;
  };              

  productImages: {      
    imageUrl: string;    
  }[];                         

  productVariants?: {
    id: string;
    size: string | number;
    color: string;
    stock: number;
  }[];
}

export interface ProductProps {
  products?: ProductType[];
}

export interface ProductLayoutProps {
  categories: Category[];
  activeId?: string | null;
  products?: ProductType[];
}

export interface ProductDetailsProps{
  product: ProductType;
}
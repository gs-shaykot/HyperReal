
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
  };              

  productImages: {      
    imageUrl: string;    
  }[];                         

  ProductVariants?: any[];
}

export interface ProductProps {
  products?: ProductType[];
}

export interface ProductLayoutProps {
  categories: Category[];
  activeId?: string | null;
  products?: ProductType[];
}

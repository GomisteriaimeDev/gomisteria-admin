// Types.ts
export interface IServiceCartBoxProps {
    serviceName: string;
    date: string;
    time: string;
    size: number;
    peopleCount: number;
    total: string;
    note: string;
}
export interface ICartItemProps {
    serviceName: string;
    date: string;
    time: string;
    size: number;
    peopleCount: number;
    total: string;
    note: string;
    image: any;
}
export interface IProductDetails {
    use: string;
    sezona: string;
    zhurma: string;
    madhesiaGomes: string;
    terrenVeshtire: string;
    indeksiNgarkeses: string;
    indeksiShpejtesise: string;
    konsumiKarburantit: string;
}

export interface IProduct {
    id: string;
    name: string;
    description: string;
    stock: number;
    price: number;
    salePercent: number;
    salePrice: number;
    category: string;
    marka: string;
    details: IProductDetails;
    tags: string;
    images: any;
}

export interface ICartItem {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    product: IProduct;
    items: any;
}

export interface ICart {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    items: ICartItem[];
}

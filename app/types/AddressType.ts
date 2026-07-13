export type AddressType = {
    id?: string;
    userId?: string;
    label?: string;
    fullName: string;
    street: string;
    city: string;
    house: string;
    zipCode: string;
    country: string;
    phone: string;
    createdAt?: Date;
    isDefault?: boolean;
}
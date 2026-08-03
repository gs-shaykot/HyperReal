export type couponType = {
    id?: string
    code: string;
    type: string;
    value: number;
    minSpend: number;
    maxDiscount?: number | null;
    newUserOnly?: boolean | null;
    limit?: number | null;
    usedCount: number;
    expiryDate?: Date | null;
}

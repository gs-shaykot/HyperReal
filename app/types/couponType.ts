export type couponType = {
    code: string;
    type: 'percent' | 'flat';
    value: number;
    minSpend: number;
    maxDiscount?: number | null;
    newUserOnly?: boolean | null;
}

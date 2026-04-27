export type couponType = {
    code: string;
    type: 'percent' | 'flat';
    value: number;
    minSpend: number;
    maxDiscount?: number;
    newUserOnly?: boolean;
}

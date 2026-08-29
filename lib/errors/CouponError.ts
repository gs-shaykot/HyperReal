export class CouponError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CouponError";
    }
}
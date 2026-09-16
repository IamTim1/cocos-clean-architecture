export type PaymentStatus = "pending" | "paying" | "paid" | "failed";

/** 第 1 层：实体。换渠道仍成立：一笔订单能不能开付、能不能标成功。 */
export class PaymentOrder {
    constructor(
        public readonly id: string,
        public readonly amount: number,
        private status: PaymentStatus = "pending",
    ) {}

    getStatus(): PaymentStatus {
        return this.status;
    }

    canStartPay(): boolean {
        return this.status === "pending";
    }

    markPaying(): void {
        if (!this.canStartPay()) {
            throw new Error("订单当前不能支付");
        }
        this.status = "paying";
    }

    markPaid(): void {
        if (this.status !== "paying") {
            throw new Error("只有支付中的订单可以标为成功");
        }
        this.status = "paid";
    }

    markFailed(): void {
        if (this.status !== "paying") {
            throw new Error("只有支付中的订单可以标为失败");
        }
        this.status = "failed";
    }
}

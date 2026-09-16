import { PaymentOrder } from "../domain/PaymentOrder";
import { NetworkPort } from "./ports/NetworkPort";
import { SessionStore } from "./SessionStore";

/** 第 2 层：未登录不能付；同时只允许一笔在途支付。 */
export class PayUseCase {
    private inFlight = false;
    private seq = 0;

    constructor(
        private readonly net: NetworkPort,
        private readonly store: SessionStore,
    ) {}

    isPaying(): boolean {
        return this.inFlight;
    }

    async run(amount: number): Promise<PaymentOrder> {
        const session = this.store.get();
        if (!session || !session.isAuthenticated()) {
            throw new Error("未登录不能支付");
        }
        if (this.inFlight) {
            throw new Error("支付中不能再付");
        }

        const order = new PaymentOrder(`ord-${Date.now()}-${++this.seq}`, amount);
        order.markPaying();
        this.inFlight = true;
        try {
            const res = await this.net.request({
                url: "/pay",
                method: "POST",
                body: {
                    action: "pay",
                    orderId: order.id,
                    amount: order.amount,
                    openid: session.openid,
                },
            });
            if (!res.ok) {
                order.markFailed();
                throw new Error(res.error || "支付失败");
            }
            order.markPaid();
            return order;
        } finally {
            this.inFlight = false;
        }
    }
}

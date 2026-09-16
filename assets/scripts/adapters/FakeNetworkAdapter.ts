import { HttpRequest, HttpResponse, NetworkPort } from "../application/ports/NetworkPort";

export class FakeNetworkAdapter implements NetworkPort {
    failNextLogin = false;
    failNextPay = false;

    async request(req: HttpRequest): Promise<HttpResponse> {
        const action = String((req.body && req.body.action) || "");
        if (action === "login") {
            if (this.failNextLogin) {
                this.failNextLogin = false;
                return { ok: false, status: 500, data: {}, error: "Fake 登录失败" };
            }
            return {
                ok: true,
                status: 200,
                data: { openid: "fake-openid", token: "fake-token" },
            };
        }
        if (action === "pay") {
            if (this.failNextPay) {
                this.failNextPay = false;
                return { ok: false, status: 500, data: {}, error: "Fake 支付失败" };
            }
            return { ok: true, status: 200, data: { paid: true } };
        }
        return { ok: false, status: 404, data: {}, error: "未知请求" };
    }
}

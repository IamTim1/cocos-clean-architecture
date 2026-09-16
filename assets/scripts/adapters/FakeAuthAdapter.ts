import { AuthPort } from "../application/ports/AuthPort";

export class FakeAuthAdapter implements AuthPort {
    failNext = false;

    async getLoginCode(): Promise<string> {
        if (this.failNext) {
            this.failNext = false;
            throw new Error("Fake 渠道拒绝登录");
        }
        return "fake-code";
    }
}

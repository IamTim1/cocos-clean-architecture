import { AuthPort } from "../application/ports/AuthPort";

/** 预览用：模仿 wx.login 的异步回调，并不调用真微信。 */
export class SimulatedWeChatAuthAdapter implements AuthPort {
    getLoginCode(): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => resolve("sim-wx-code"), 80);
        });
    }
}

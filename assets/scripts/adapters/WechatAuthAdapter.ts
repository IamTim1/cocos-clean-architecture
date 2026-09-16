import { AuthPort } from "../application/ports/AuthPort";

function getWx(): { login?: Function } | undefined {
    return (globalThis as { wx?: { login?: Function } }).wx;
}

/** 第 3 层：真 wx.login。圆心仍然只认 AuthPort。 */
export class WechatAuthAdapter implements AuthPort {
    getLoginCode(): Promise<string> {
        const wx = getWx();
        if (!wx || typeof wx.login !== "function") {
            return Promise.reject(new Error("当前环境没有 wx.login"));
        }
        return new Promise((resolve, reject) => {
            wx.login({
                success: (res: { code?: string }) => {
                    if (res && res.code) {
                        resolve(res.code);
                    } else {
                        reject(new Error("wx.login 未返回 code"));
                    }
                },
                fail: (err: { errMsg?: string }) => reject(new Error(err && err.errMsg ? err.errMsg : "wx.login fail")),
            });
        });
    }
}

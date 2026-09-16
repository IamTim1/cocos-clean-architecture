import { HttpRequest, HttpResponse, NetworkPort } from "../application/ports/NetworkPort";
import { translateEchoToApp } from "./echoTranslate";

function getWx(): { request?: Function } | undefined {
    return (globalThis as { wx?: { request?: Function } }).wx;
}

/** 第 3 层：真 wx.request，URL 来自第 4 层配置（默认 httpbin echo）。 */
export class WechatNetworkAdapter implements NetworkPort {
    constructor(private readonly apiBaseUrl: string) {}

    request(req: HttpRequest): Promise<HttpResponse> {
        const wx = getWx();
        if (!wx || typeof wx.request !== "function") {
            return Promise.reject(new Error("当前环境没有 wx.request"));
        }
        const url = req.url.startsWith("http") ? req.url : this.apiBaseUrl;
        return new Promise((resolve, reject) => {
            wx.request({
                url,
                method: req.method,
                data: req.body || {},
                header: { "content-type": "application/json" },
                success: (res: { statusCode?: number; data?: unknown }) => {
                    const status = res.statusCode || 0;
                    const raw = (res.data && typeof res.data === "object") ? res.data as Record<string, unknown> : {};
                    resolve(translateEchoToApp(req, raw, status));
                },
                fail: (err: { errMsg?: string }) => reject(new Error(err && err.errMsg ? err.errMsg : "wx.request fail")),
            });
        });
    }
}

import { HttpRequest, HttpResponse, NetworkPort } from "../application/ports/NetworkPort";
import { translateEchoToApp } from "./echoTranslate";

/**
 * 预览用：内部长得像 wx.request({ success / fail })，但不碰真 wx。
 */
export class SimulatedWeChatNetworkAdapter implements NetworkPort {
    request(req: HttpRequest): Promise<HttpResponse> {
        return new Promise((resolve, reject) => {
            const wxLike = {
                request(options: {
                    url: string;
                    method: string;
                    data: unknown;
                    success: (res: { statusCode: number; data: Record<string, unknown> }) => void;
                    fail: (err: { errMsg: string }) => void;
                }) {
                    setTimeout(() => {
                        options.success({
                            statusCode: 200,
                            data: { json: options.data as Record<string, unknown> },
                        });
                    }, 80);
                },
            };
            wxLike.request({
                url: req.url,
                method: req.method,
                data: req.body || {},
                success: (res) => resolve(translateEchoToApp(req, res.data, res.statusCode)),
                fail: (err) => reject(new Error(err.errMsg)),
            });
        });
    }
}

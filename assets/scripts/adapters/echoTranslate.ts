import { HttpRequest, HttpResponse } from "../application/ports/NetworkPort";

/**
 * 第 3 层翻译：把 echo/httpbin 的回包收成用例认识的 data。
 * 圆心永远看不到 httpbin 的 json 字段。
 */
export function translateEchoToApp(req: HttpRequest, raw: Record<string, unknown>, status: number): HttpResponse {
    const payload = (raw.json as Record<string, unknown>) || raw;
    const action = String((req.body && req.body.action) || payload.action || "");
    if (status < 200 || status >= 300) {
        return { ok: false, status, data: {}, error: `HTTP ${status}` };
    }
    if (action === "login") {
        const code = String((req.body && req.body.code) || "echo");
        return {
            ok: true,
            status,
            data: {
                openid: `wx-echo-${code}`,
                token: `wx-token-${code}`,
            },
        };
    }
    if (action === "pay") {
        return { ok: true, status, data: { paid: true } };
    }
    return { ok: false, status, data: {}, error: "未知 action" };
}

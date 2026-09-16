/** 第 2 层定义的端口：圆心只认这张形状，不认 wx / httpbin。 */
export interface HttpRequest {
    url: string;
    method: "GET" | "POST";
    body?: Record<string, unknown>;
}

export interface HttpResponse {
    ok: boolean;
    status: number;
    data: Record<string, unknown>;
    error?: string;
}

export interface NetworkPort {
    request(req: HttpRequest): Promise<HttpResponse>;
}

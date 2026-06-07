interface Env {
    AURA_CACHE: KVNamespace;
    AURA_ASSETS: R2Bucket;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        
        // 1. Hardening Perimetral en Capa de Aplicación (Filtro de métodos HTTP)
        if (request.method !== "GET" && request.method !== "POST") {
            return new Response("Método No Permitido", { status: 405 });
        }

        // 2. Lógica de Enrutamiento Dinámico en el Edge
        if (url.pathname === "/api/config") {
            // Intenta extraer configuración global desde Cloudflare KV distribuidor
            const cachedConfig = await env.AURA_CACHE.get("global_config");
            return new Response(cachedConfig || JSON.stringify({ status: "online", version: "v2.0.0" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 3. Respuesta base con cabeceras estrictas de seguridad (Mitigación OWASP)
        const response = new Response("Proyecto Aura V2: Arquitectura de Alta Disponibilidad Validada.", {
            status: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
        });

        // Inyección de políticas de seguridad HTTP (Security Headers)
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("X-Frame-Options", "DENY");
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
        response.headers.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none';");
        response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

        return response;
    },
};

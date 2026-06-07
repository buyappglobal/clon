interface Env {
    GEMINI_API_KEY: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "X-Content-Type-Options": "nosniff"
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // Endpoint de consulta IA que sustituye la funcionalidad de Antigravity
        if (url.pathname === "/api/chat" && request.method === "POST") {
            try {
                const body: any = await request.json();
                const userMessage = body.message || "Hola";

                // Petición directa al Core de Google AI Studio con tu API Key segura
                const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

                const aiResponse = await fetch(googleApiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: userMessage }] }]
                    })
                });

                const aiData: any = await aiResponse.json();
                const replyText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta del modelo.";

                return new Response(JSON.stringify({ success: true, response: replyText }), {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });

            } catch (error: any) {
                return new Response(JSON.stringify({ success: false, error: error.message }), {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }
        }

        return new Response("<h1>Entorno Sandbox: Clon de Pruebas Activo y Conectado a AI Studio</h1>", {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" }
        });
    },
};

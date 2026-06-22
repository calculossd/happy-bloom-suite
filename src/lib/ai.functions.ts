import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ChatInput = z.object({
  prompt: z.string().min(1).max(8000),
  system: z.string().max(4000).optional(),
});

export const okLojaChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { text: "", error: "LOVABLE_API_KEY ausente. Ative o Lovable AI." };
    }

    const systemPrompt =
      data.system ??
      `Você é o OkLoja, assistente de IA especialista em impressão 3D, gestão de oficina maker, precificação, marketing e relacionamento com clientes. Responda em português do Brasil, de forma curta, prática e amigável. Use bullets quando útil.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
          "X-Lovable-AIG-SDK": "raw-fetch",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: data.prompt },
          ],
        }),
      });

      if (res.status === 429) return { text: "", error: "Limite de uso atingido. Tente novamente em alguns segundos." };
      if (res.status === 402) return { text: "", error: "Créditos de IA esgotados. Adicione créditos na sua workspace." };
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return { text: "", error: `Erro do Lovable AI (${res.status}): ${body.slice(0, 200)}` };
      }
      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = json.choices?.[0]?.message?.content ?? "";
      return { text, error: null as string | null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { text: "", error: `Falha de conexão com o gateway: ${msg}` };
    }
  });

const ImageInput = z.object({
  prompt: z.string().min(1).max(4000),
});

export const generateStoryImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ImageInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { image: "", error: "LOVABLE_API_KEY ausente." };

    const fullPrompt = `Crie uma imagem vertical no formato Story 9:16 (1080x1920), visualmente impactante para postar no WhatsApp Status / Instagram Stories sobre impressão 3D. Estilo moderno, cores vibrantes, espaço para texto. Tema: ${data.prompt}`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: fullPrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (res.status === 429) return { image: "", error: "Limite atingido, tente em alguns segundos." };
      if (res.status === 402) return { image: "", error: "Créditos de IA esgotados." };
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        return { image: "", error: `Erro (${res.status}): ${body.slice(0, 200)}` };
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
      };
      const image = json.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? "";
      if (!image) return { image: "", error: "Sem imagem na resposta." };
      return { image, error: null as string | null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { image: "", error: `Falha: ${msg}` };
    }
  });

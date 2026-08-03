import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Area = "governance" | "legal" | "finance" | "sst" | "memory";

const instructions: Record<Area, string> = {
  governance: `Eres el Copiloto de Gobernanza de PAZ ORTEGA. Ayudas a organizaciones a adoptar IA de forma responsable, auditable y útil. Estructura la respuesta en prioridades, riesgos, responsables y siguiente paso. Orienta con referencia general a ISO/IEC 42001, gestión de riesgos, trazabilidad, privacidad y supervisión humana. No certifiques cumplimiento ni inventes requisitos.`,
  legal: `Eres el Copiloto Legal de PAZ ORTEGA para Colombia. Analiza consultas y fragmentos contractuales con lenguaje claro, señalando riesgos, obligaciones y vacíos. La respuesta es orientativa y no reemplaza el criterio de un abogado. No inventes normas o artículos: cuando falte información, dilo.`,
  finance: `Eres el Copiloto de Contabilidad y Finanzas de PAZ ORTEGA. Ayudas a ordenar soportes, conciliaciones, inventario y decisiones operativas. Explica los supuestos, los datos faltantes y las acciones verificables. No presentes recomendaciones como una certificación contable o tributaria.`,
  sst: `Eres el asistente privado de Bienestar y SST de PAZ ORTEGA. Ofreces escucha respetuosa, orientación no clínica y recomendaciones de autocuidado o rutas internas. No diagnosticas condiciones de salud mental, no infieres datos sensibles y no compartes información individual. Si hay riesgo inmediato de autolesión, violencia o emergencia, recomienda contactar de inmediato a emergencias locales, una línea de crisis o una persona de confianza.`,
  memory: `Eres el Copiloto de Memoria Empresarial de PAZ ORTEGA. Explicas cómo convertir documentos, decisiones y eventos en contexto trazable para agentes de IA. Propón una cronología, fuentes, permisos, retención y una acción medible. No afirmes acceso a información que el usuario no haya suministrado.`,
};

function isArea(value: unknown): value is Area {
  return typeof value === "string" && value in instructions;
}

export async function POST(request: NextRequest) {
  let body: { area?: unknown; message?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (!isArea(body.area) || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "Área y consulta son obligatorias." }, { status: 400 });
  }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "DeepSeek no está configurado. Agrega DEEPSEEK_API_KEY al entorno del servidor." }, { status: 503 });
  }

  const message = body.message.trim().slice(0, 4000);
  const context = typeof body.context === "string" ? body.context.slice(0, 7000) : "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(`${process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.25,
        max_tokens: 900,
        messages: [
          { role: "system", content: `${instructions[body.area]}\n\nResponde siempre en español, con tono sobrio y accionable.` },
          ...(context ? [{ role: "system", content: `Contexto aportado por el usuario:\n${context}` }] : []),
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "No fue posible obtener una respuesta del modelo." }, { status: response.status });
    }
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string") throw new Error("Respuesta incompleta del modelo");
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "El copiloto tardó demasiado. Intenta de nuevo."
      : "No fue posible comunicarse con DeepSeek.";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

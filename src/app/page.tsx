"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type Area = "governance" | "legal" | "finance" | "sst" | "memory";

function isArea(value: string | null): value is Area {
  return value === "governance" || value === "legal" || value === "finance" || value === "sst" || value === "memory";
}

const areas: Array<{ id: Area; number: string; title: string; eyebrow: string; description: string; accent: string }> = [
  { id: "governance", number: "01", title: "Gobernanza de IA", eyebrow: "El eje transversal", description: "Estrategia, reglas, riesgos y acompañamiento para una adopción de IA que se pueda explicar y sostener.", accent: "lime" },
  { id: "legal", number: "02", title: "Legal Tech", eyebrow: "Decisiones jurídicas informadas", description: "Asistente legal, copiloto documental y memoria contextual para equipos que necesitan responder con rigor.", accent: "cyan" },
  { id: "finance", number: "03", title: "Contabilidad y Finanzas", eyebrow: "Trazabilidad operativa", description: "Conciliación, soportes, inventario y un copiloto que convierte la operación diaria en información accionable.", accent: "gold" },
  { id: "sst", number: "04", title: "SST y Bienestar", eyebrow: "Cuidado con privacidad", description: "Herramientas para RH y acompañamiento privado para trabajadores, con consentimiento como regla de acceso.", accent: "rose" },
];

const prompts: Record<Area, string[]> = {
  governance: ["¿Cómo empezar una evaluación de madurez de IA?", "Propón un registro inicial de riesgos de IA."],
  legal: ["¿Qué riesgos ves en una cláusula de confidencialidad?", "Resume las obligaciones de este contrato."],
  finance: ["¿Cómo priorizar los descuadres de inventario?", "¿Qué soportes faltan para el cierre de hoy?"],
  sst: ["Me siento sobrecargado esta semana. ¿Cómo puedo empezar?", "¿Cómo comunicar una inquietud de forma segura?"],
  memory: ["Diseña una cronología para decisiones comerciales.", "¿Qué permisos debe tener nuestra memoria empresarial?"],
};

const context: Record<Area, string> = {
  governance: "Organización en etapa de exploración. Busca adoptar IA con responsables, trazabilidad y evaluación de riesgos.",
  legal: "Contexto de demostración. El usuario puede adjuntar o seleccionar fragmentos documentales cuando el sistema se conecte a su repositorio autorizado.",
  finance: "Contexto de demostración: cierre diario, conciliación entre ventas, inventario físico y soportes. Los datos productivos deben provenir de fuentes autorizadas.",
  sst: "Espacio individual y privado. No se debe revelar ni resumir información personal para RH sin consentimiento explícito del trabajador.",
  memory: "La empresa quiere conservar decisiones y documentos como una cronología consultable, con permisos por fuente y retención definida.",
};

function Copilot({ area, title }: { area: Area; title: string }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function ask(value?: string) {
    const query = (value ?? message).trim();
    if (!query || state === "loading") return;
    setState("loading"); setReply("");
    try {
      const result = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ area, message: query, context: context[area] }) });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error || "No se pudo generar la respuesta.");
      setReply(data.reply); setMessage(""); setState("idle");
    } catch (error) {
      setReply(error instanceof Error ? error.message : "No se pudo generar la respuesta."); setState("error");
    }
  }
  function submit(event: FormEvent) { event.preventDefault(); ask(); }

  return <aside className="copilot">
    <div className="copilot-head"><div><span className="status-dot" /> Copiloto activo</div><small>DeepSeek · contexto por área</small></div>
    <h3>{title}</h3>
    <p className="copilot-copy">Consulta sobre el caso y recibe una respuesta situada, clara y accionable.</p>
    <div className="suggestions">{prompts[area].map((prompt) => <button key={prompt} onClick={() => ask(prompt)}>{prompt}</button>)}</div>
    <form onSubmit={submit} className="ask-form">
      <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escribe una consulta…" aria-label={`Consulta para ${title}`} />
      <button className="send" type="submit" disabled={state === "loading"}>{state === "loading" ? "Analizando…" : "Consultar"}</button>
    </form>
    {reply && <div className={`reply ${state === "error" ? "reply-error" : ""}`}><span>{state === "error" ? "Atención" : "Respuesta"}</span><p>{reply}</p></div>}
  </aside>;
}

function PrototypeFrame({ title, detail, src }: { title: string; detail: string; src?: string }) {
  if (!src) {
    return <section className="prototype-frame prototype-frame-empty" aria-label={`Prototipo operativo de ${title}`}>
      <div className="prototype-frame-head"><div><span className="status-dot status-dot-pending" /> Prototipo en despliegue</div><b>{title}</b><small>{detail}</small></div>
      <div className="prototype-empty"><p>Este prototipo se ejecuta como una aplicación independiente y aún no tiene una URL pública configurada.</p><small>Defina <code>NEXT_PUBLIC_LEGAL_URL</code> o <code>NEXT_PUBLIC_FINANCE_URL</code> con la URL de despliegue para activarlo aquí.</small></div>
    </section>;
  }
  return <section className="prototype-frame" aria-label={`Prototipo operativo de ${title}`}>
    <div className="prototype-frame-head"><div><span className="status-dot" /> Prototipo operativo · DeepSeek conectado</div><b>{title}</b><small>{detail}</small></div>
    <iframe src={src} title={`Prototipo ${title}`} loading="eager" />
  </section>;
}

function Governance() {
  return <div className="workspace-grid governance-grid"><section className="workspace-main">
    <p className="section-kicker">Gobernanza transversal</p><h2>La confianza es una capacidad de operación.</h2>
    <p className="lead">Somos una consultora especializada en transformar la Inteligencia Artificial en una capacidad estratégica y duradera para su empresa: gobernada, trazable y alineada con su propósito.</p>
    <div className="governance-quote"><span>Nuestra filosofía</span><strong>“Los frenos te ayudan a conducir más rápido. La gobernanza da la seguridad para acelerar la innovación.”</strong><small>— El paradigma PAZ ORTEGA</small></div>
    <div className="maturity"><div><b>1</b><span>Gobernamos</span><small>Evaluamos contexto, riesgos, procesos, responsabilidades y objetivos antes de escribir una línea de código.</small></div><div><b>2</b><span>Aplicamos</span><small>Diseñamos soluciones claras para cada área específica: legal, finanzas, talento o procesos.</small></div><div><b>3</b><span>Implementamos</span><small>Construimos y entrenamos la solución; automatización, chatbots o agentes con validación humana.</small></div><div><b>4</b><span>Evolucionamos</span><small>Monitoreo continuo humano–tecnología para consolidar memoria empresarial viva.</small></div></div>
    <div className="governance-services"><article><b>Gobernanza transversal</b><p>Definimos reglas, gestionamos riesgos, asignamos responsabilidades y aplicamos criterios de ética y calidad.</p></article><article><b>Implementación por áreas</b><p>Contratos, riesgos, contabilidad y finanzas, alertas, reportes, bienestar y salud mental organizacional.</p></article><article><b>Desarrollo tecnológico</b><p>Automatizaciones, agentes de IA y chatbots especializados para procesos repetitivos o complejos.</p></article><article><b>Nuestra capa diferencial</b><p>Convertimos bases de datos y documentos históricos en conocimiento trazable que entiende su propio contexto.</p></article></div>
    <div className="standards-board"><div><h3>Estándares globales</h3><p>Trabajamos alineados con ISO/IEC 42001, aplicamos el ciclo PHVA y usamos NIST AI RMF para identificar, cuantificar y mitigar riesgos.</p></div><div className="maturity-table"><span>Nivel de empresa</span><span>Estado inicial frecuente</span><span>Objetivo con PAZ ORTEGA</span><b>Políticas</b><p>Inexistentes o fracturadas; sin reglas claras sobre privacidad y finalidad.</p><p>Políticas integradas con seguridad, privacidad y flujos de aprobación.</p><b>Procesos e infraestructura</b><p>Reportes manuales, herramientas dispersas y trabajo ad-hoc.</p><p>Procesos automatizados e integrados en el ciclo de vida del producto.</p><b>Cultura y recursos</b><p>La tecnología no es prioridad; el esfuerzo depende de individuos.</p><p>La directiva prioriza IA responsable y los recursos se sostienen con coherencia.</p></div></div>
    <div className="impact-grid"><article><b>Claridad y decisión</b><p>El personal sabe exactamente a quién dirigir sus solicitudes y la decisión se toma sin burocracia paralizante.</p></article><article><b>Continuidad y prevención</b><p>Cada implementación tiene un responsable claro, trazabilidad y documentación para aprender de incidentes.</p></article><article><b>Ventaja competitiva</b><p>Confianza, escalabilidad y agilidad estratégica basada en datos y evidencia.</p></article></div>
  </section><Copilot area="governance" title="Copiloto de Gobernanza" /></div>;
}

function Legal() {
  return <div className="product-area"><div className="product-intro"><p className="section-kicker">Legal Tech</p><h2>Asistente legal y Copiloto documental.</h2><p>Un entorno completo para consultas laborales y comerciales, análisis de fragmentos y memoria de contexto autorizada.</p></div><PrototypeFrame title="Paz Ortega · Legal Tech" detail="Derecho Laboral y Comercial · Colombia" src={process.env.NEXT_PUBLIC_LEGAL_URL} /></div>;
}

function Finance() {
  return <div className="product-area"><div className="product-intro"><p className="section-kicker">Contabilidad y Finanzas</p><h2>Conciliación inteligente en vivo.</h2><p>Ventas, inventario, soportes y un Copiloto que explica las diferencias para acelerar el cierre operativo.</p></div><PrototypeFrame title="VerdeCuadra · Finanzas" detail="Conciliación de inventario, ventas y soportes" src={process.env.NEXT_PUBLIC_FINANCE_URL} /></div>;
}

function SST() {
  const [consent, setConsent] = useState(false); const [checked, setChecked] = useState(false);
  return <div className="product-area"><div className="product-intro"><p className="section-kicker">SST y Bienestar</p><h2>Bienestar individual. Gestión responsable.</h2><p>Un producto dual: operación preventiva para RH y acompañamiento confidencial para cada trabajador.</p></div><section className="sst-product"><header><b>PAZ ORTEGA <i>BIENESTAR</i></b><span>Organización demo · Agosto 2026</span><button>Centro de ayuda</button></header><div className="sst-app"><aside><b>Gestión SST</b><button className="sst-active">Resumen</button><button>Programas</button><button>Baterías</button><button>Alertas agregadas</button><hr /><b>Trabajador</b><button>Mi espacio privado</button><button>Recursos de apoyo</button></aside><main><div className="product-status"><span><i />Vista RH · solo datos agregados</span><small>Privacidad por diseño</small></div><h3>Panorama de bienestar</h3><p>Indicadores para prevenir riesgos sin exponer información personal.</p><div className="rh-metrics"><div><small>Participación semanal</small><b>78%</b><em>+ 8 pts.</em></div><div><small>Alertas preventivas</small><b>04</b><em className="warning">Revisar programa</em></div><div><small>Programas activos</small><b>06</b><em>Al día</em></div></div><div className="program-list"><b>Programas SST en seguimiento</b><span>Batería de riesgo psicosocial <em>82% completado</em></span><span>Prevención de burnout <em>En curso</em></span><span>Formación en seguridad <em>93% completado</em></span></div><div className="privacy-card"><div><span className="lock">⌾</span><h3>Espacio del trabajador</h3><p>Las respuestas y conversaciones son privadas. RH solo accede con una autorización que la persona puede retirar.</p></div><div className="checkin"><span>¿Cómo te has sentido hoy?</span><div>{["Bien", "Con carga", "Necesito apoyo"].map((item) => <button key={item} className={checked ? "chosen" : ""} onClick={() => setChecked(true)}>{item}</button>)}</div><label><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> Autorizo compartir un resumen con mi organización.</label><small>{consent ? "Puedes retirar este consentimiento cuando quieras." : "Sin consentimiento, esta interacción permanece individual."}</small></div></div></main><Copilot area="sst" title="Asistente de Bienestar" /></div></section></div>;
}

function Memory() {
  return <div className="product-area"><div className="product-intro"><p className="section-kicker">Stack y memoria empresarial</p><h2>Contexto que se conserva y se puede explicar.</h2><p>Procesamiento local, permisos por fuente y cronología para que los agentes recuperen decisiones con fundamento.</p></div><section className="memory-product"><header><b>PAZ ORTEGA <i>MEMORIA</i></b><span>Entorno privado · fuentes autorizadas</span><button>Configurar fuentes</button></header><div className="memory-app"><aside><b>Memoria empresarial</b><button className="memory-active">Cronología</button><button>Fuentes conectadas</button><button>Permisos</button><button>Políticas de retención</button></aside><main><div className="memory-kpis"><span>Fuentes conectadas <b>12</b></span><span>Eventos trazables <b>2.481</b></span><span>Políticas activas <b>18</b></span></div><h3>Cronología de contexto</h3><div className="timeline"><div><time>HOY · COMERCIAL</time><b>Decisión comercial aprobada</b><p>Se guarda con fuente, responsable, vigencia y permisos de acceso.</p></div><div><time>JUL 18 · GOBERNANZA</time><b>Política de datos actualizada</b><p>El agente recupera la versión vigente, no una copia desactualizada.</p></div><div><time>JUN 04 · OPERACIÓN</time><b>Incidente operativo resuelto</b><p>La lección queda disponible para el siguiente caso similar.</p></div></div><div className="source-list"><b>Fuentes de contexto</b><span>Repositorio documental <em>Conectado</em></span><span>ERP y reportes <em>Conectado</em></span><span>Políticas internas <em>Actualizado hoy</em></span></div></main><Copilot area="memory" title="Copiloto de Memoria" /></div></section></div>;
}

export default function Home() {
  const [active, setActive] = useState<Area>("governance");
  const workRef = useRef<HTMLElement>(null);
  const activeTitle = useMemo(() => active === "memory" ? "Stack y Memoria" : areas.find((area) => area.id === active)?.title, [active]);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("area");
    if (isArea(requested)) setActive(requested);
  }, []);
  function select(area: Area) { setActive(area); requestAnimationFrame(() => workRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); }
  return <main>
    <header className="topbar"><a href="#inicio" className="brand"><span>PAZ ORTEGA</span><i>IA</i></a><nav>{areas.map((area) => <button key={area.id} className={active === area.id ? "active" : ""} onClick={() => select(area.id)}>{area.title}</button>)}<button className={active === "memory" ? "active" : ""} onClick={() => select("memory")}>Stack</button></nav><button className="contact" onClick={() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })}>Conversemos <span>↗</span></button></header>
    <section id="inicio" className="hero"><div className="eyebrow">GOBERNANZA ESTRATÉGICA Y OPERATIVA</div><h1>Decisiones humanas<br />para sistemas <em>inteligentes.</em></h1><p>Convertimos la IA en una capacidad estratégica, segura y duradera: con gobierno, copilotos especializados y memoria empresarial.</p><div className="hero-actions"><button onClick={() => select("governance")}>Explorar soluciones <span>↓</span></button><a href="#propuesta">Conocer nuestro enfoque</a></div><div className="hero-ledger"><span>ISO/IEC 42001</span><span>IA responsable</span><span>Procesamiento local</span><span>Memoria trazable</span></div></section>
    <section id="propuesta" className="proposal"><p className="section-kicker">Por qué PAZ ORTEGA</p><div><h2>La gobernanza no frena la innovación. <em>La hace confiable.</em></h2><p>Diseñamos reglas, gestionamos riesgos y construimos soluciones de IA conectadas al contexto real de su organización.</p></div><div className="principles"><article><b>01</b><h3>Mitigar riesgos</h3><p>Protegemos la confianza de clientes, equipos y reguladores.</p></article><article><b>02</b><h3>Abrir la caja negra</h3><p>Hacemos que los sistemas puedan explicarse y supervisarse.</p></article><article><b>03</b><h3>Alinear la adopción</h3><p>Convertimos casos de uso en capacidades responsables.</p></article></div></section>
    <section className="services"><div className="section-heading"><p className="section-kicker">Soluciones por capacidad</p><h2>Una arquitectura, cuatro formas de generar valor.</h2></div><div className="service-grid">{areas.map((area) => <button className={`service-card ${area.accent}`} onClick={() => select(area.id)} key={area.id}><span>{area.number}</span><small>{area.eyebrow}</small><h3>{area.title}</h3><p>{area.description}</p><i>Explorar <b>↗</b></i></button>)}</div></section>
    <section id="workspace" ref={workRef} className="workspace" aria-label={`Área ${activeTitle}`}><div className="workspace-nav"><span>PAZ ORTEGA / SOLUCIONES</span><b>{activeTitle}</b><button onClick={() => select("memory")}>Memoria empresarial ↗</button></div>{active === "governance" && <Governance />}{active === "legal" && <Legal />}{active === "finance" && <Finance />}{active === "sst" && <SST />}{active === "memory" && <Memory />}</section>
    <section className="how"><p className="section-kicker">Cómo lo hacemos</p><div><h2>Del contexto a la<br /><em>capacidad sostenible.</em></h2><ol><li><b>01</b><span>Gobernamos <small>Contexto, riesgos y responsabilidades antes de escribir una línea de código.</small></span></li><li><b>02</b><span>Aplicamos <small>Diseñamos la solución adecuada para cada proceso y cada equipo.</small></span></li><li><b>03</b><span>Implementamos <small>Construimos agentes y automatizaciones con validación humana.</small></span></li><li><b>04</b><span>Evolucionamos <small>La memoria y la mejora continua mantienen el sistema útil en el tiempo.</small></span></li></ol></div></section>
    <footer id="contacto"><div><a className="brand" href="#inicio"><span>PAZ ORTEGA</span><i>IA</i></a><h2>¿Conversamos?</h2><p>Incorpore inteligencia artificial con confianza, rentabilidad y responsabilidad.</p></div><div className="footer-links"><span>Arquitectura de IA</span><span>Gobernanza y calidad</span><span>Memoria empresarial</span><span>Colombia · LATAM</span></div><div className="diagnostic"><div className="qr-frame"><QRCodeSVG value="https://paz-ortega-ia.vercel.app/" size={122} bgColor="#f5f5ef" fgColor="#102033" level="M" includeMargin /></div><div><b>Inicie su diagnóstico</b><p>Escanee el código o ingrese a:</p><a href="https://paz-ortega-ia.vercel.app/" target="_blank" rel="noreferrer">paz-ortega-ia.vercel.app ↗</a></div></div></footer>
  </main>;
}

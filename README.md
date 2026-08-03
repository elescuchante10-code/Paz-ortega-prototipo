# PAZ ORTEGA Platform

Portal comercial y demostrador funcional para las capacidades de Gobernanza de IA, Legal Tech, Contabilidad y Finanzas, SST y Memoria Empresarial.

## Configuración

1. Copie `.env.example` como `.env.local`.
2. Defina `DEEPSEEK_API_KEY` únicamente en el entorno del servidor.
3. Defina `NEXT_PUBLIC_LEGAL_URL` y `NEXT_PUBLIC_FINANCE_URL` con la URL pública de despliegue de esos prototipos (Legal Tech y Finanzas). Sin estas variables, la plataforma muestra un aviso de "en despliegue" en vez de un iframe roto.
4. Instale dependencias con `npm install` y ejecute `npm run dev`.

La ruta `POST /api/copilot` envía las consultas a DeepSeek desde el servidor. La clave nunca se entrega al navegador. Cada área usa instrucciones propias; la interacción de SST es individual, no se persiste en esta versión y no se expone a RH.

Para producción, conecte los repositorios documentales, autenticación, control de permisos, consentimiento auditable y cifrado antes de procesar información real de clientes o datos sensibles de trabajadores.

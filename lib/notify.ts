import "server-only";

/**
 * Stub for the WhatsApp "new material" notification (mirrors the original
 * mockWhatsApp). Wire up a real provider (e.g. Twilio / WhatsApp Cloud API) later.
 */
export function notifyWhatsApp(phone: string | null) {
  if (!phone) return;
  console.log(`\n📱 [WhatsApp] → ${phone}`);
  console.log(`   "Claudia te ha enviado nuevos documentos"\n`);
}

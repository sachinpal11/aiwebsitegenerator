/** "+91 98765 43210" -> "+919876543210" */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** WhatsApp click-to-chat link; assumes an Indian number when no country code is given. */
export function whatsappHref(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  return `https://wa.me/${digits}`;
}

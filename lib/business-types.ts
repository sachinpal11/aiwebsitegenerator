export const businessTypes = [
  { id: "salon", label: "Salon & Beauty", labelHi: "सैलून और ब्यूटी" },
  { id: "tuition", label: "Tuition Centre", labelHi: "ट्यूशन सेंटर" },
  { id: "restaurant", label: "Restaurant & Café", labelHi: "रेस्टोरेंट और कैफ़े" },
  { id: "boutique", label: "Boutique", labelHi: "बुटीक" },
  { id: "clinic", label: "Clinic", labelHi: "क्लिनिक" },
  { id: "services", label: "Local Services", labelHi: "लोकल सर्विस" },
] as const;

export type BusinessTypeId = (typeof businessTypes)[number]["id"];

export const styles = ["modern", "traditional", "colorful"] as const;
export type Style = (typeof styles)[number];

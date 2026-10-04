/** Checks every hand-written sample against every template schema. Run: npm run check:samples */
import { toZod } from "@/lib/slots";
import { templateMeta } from "@/templates/meta";
import { samples } from "@/templates/samples";
let failed = false;
for (const t of templateMeta) for (const s of samples) {
  const r = toZod(t.slots).safeParse(s.content);
  if (!r.success) failed = true;
  console.log(t.id, s.businessType, r.success ? "ok" : r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
}
process.exit(failed ? 1 : 0);

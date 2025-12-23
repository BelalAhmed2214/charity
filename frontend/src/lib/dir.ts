export type TextDir = "rtl" | "ltr";

const rtlRegex =
	/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const ltrRegex = /[A-Za-z]/g;

export function detectDir(text: unknown, fallback: TextDir = "ltr"): TextDir {
	const s = typeof text === "string" ? text : `${text ?? ""}`;
	const t = s.trim();
	if (!t) return fallback;
	const rtl = (t.match(rtlRegex) || []).length;
	const ltr = (t.match(ltrRegex) || []).length;
	return rtl > ltr ? "rtl" : "ltr";
}

export function alignClass(dir: TextDir): string {
	return dir === "rtl" ? "text-right" : "text-left";
}

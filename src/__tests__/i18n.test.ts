import { describe, expect, it } from "vitest";
import {
  FEATUREDROP_TRANSLATIONS,
  formatDateForLocale,
  formatRelativeTimeForLocale,
  getLocaleDirection,
  resolveLocale,
  resolveTranslations,
} from "../i18n";

describe("resolveTranslations", () => {
  it("returns english defaults when locale is omitted", () => {
    const t = resolveTranslations();
    expect(t.whatsNewTitle).toBe("What's New");
    expect(t.loadMore).toBe("Load more");
    expect(t.newFeatureCount(2)).toBe("2 new features");
  });

  it("resolves locale dictionaries with locale-aware formatters", () => {
    const t = resolveTranslations("fr");
    expect(t.whatsNewTitle).toBe("Nouveautés");
    expect(t.markAllRead).toBe("Tout marquer comme lu");
    expect(t.stepOf(2, 5)).toBe("Etape 2 sur 5");
    expect(t.newFeatureCount(0)).toBe("Aucune nouveaute");
  });

  it("applies custom overrides over locale defaults", () => {
    const t = resolveTranslations("es", {
      submit: "Enviar ahora",
    });
    expect(t.submit).toBe("Enviar ahora");
    expect(t.close).toBe("Cerrar");
  });

  it("normalizes locale aliases and detects rtl direction", () => {
    expect(resolveLocale("ES-MX")).toBe("es");
    expect(resolveLocale("zh-CN")).toBe("zh-cn");
    expect(getLocaleDirection("ar")).toBe("rtl");
    expect(getLocaleDirection("fr")).toBe("ltr");
  });

  it("formats dates with locale-aware output", () => {
    expect(formatDateForLocale("2026-02-20T00:00:00Z", "en")).toContain("2026");
    expect(formatDateForLocale("2026-02-20T00:00:00Z", "ar")).toMatch(/2026|٢٠٢٦/);
  });

  it("formats relative time per locale", () => {
    const now = "2026-02-27T00:00:00Z";
    expect(formatRelativeTimeForLocale("2026-02-25T00:00:00Z", "en", { now })).toContain("ago");
    expect(formatRelativeTimeForLocale("2026-02-25T00:00:00Z", "es", { now })).toMatch(
      /hace|ayer|anteayer/,
    );
  });

  it("every locale has full key parity with English and non-empty strings", () => {
    const englishKeys = Object.keys(FEATUREDROP_TRANSLATIONS.en).sort();
    for (const locale of Object.keys(FEATUREDROP_TRANSLATIONS)) {
      const t = resolveTranslations(locale);
      expect(Object.keys(t).sort(), `locale ${locale} key set`).toEqual(englishKeys);
      for (const key of englishKeys) {
        const value = t[key as keyof typeof t];
        if (typeof value === "string") {
          expect(value.length, `locale ${locale} key ${key}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("resolves the 7 newly-added locales with locale-aware formatters", () => {
    expect(resolveTranslations("ru").whatsNewTitle).toBe("Что нового");
    expect(resolveTranslations("ru").stepOf(2, 5)).toBe("Шаг 2 из 5");
    expect(resolveTranslations("ru").newFeatureCount(1)).toBe("1 новая функция");

    expect(resolveTranslations("it").whatsNewTitle).toBe("Novità");
    expect(resolveTranslations("nl").close).toBe("Sluiten");
    expect(resolveTranslations("tr").submit).toBe("Gönder");
    expect(resolveTranslations("pl").stepOf(3, 4)).toBe("Krok 3 z 4");
    expect(resolveTranslations("id").cancel).toBe("Batal");
    expect(resolveTranslations("vi").gotIt).toBe("Đã hiểu");
  });
});

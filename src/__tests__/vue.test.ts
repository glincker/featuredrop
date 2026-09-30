import { describe, it, expect } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { FeatureDropProvider, useFeatureDrop, useNewCount } from "../vue";
import { MemoryAdapter } from "../adapters/memory";
import type { FeatureManifest } from "../types";

const manifest: FeatureManifest = [
  {
    id: "dark-mode",
    label: "Dark Mode",
    releasedAt: "2026-02-01T00:00:00Z",
    showNewUntil: "2026-12-01T00:00:00Z",
    sidebarKey: "/settings",
  },
  {
    id: "expired",
    label: "Old Feature",
    releasedAt: "2024-01-01T00:00:00Z",
    showNewUntil: "2024-06-01T00:00:00Z",
  },
];

/**
 * Mounts <FeatureDropProvider> with a child that calls `setup()` during its
 * own setup, then hands back whatever `setup()` returned. No @vue/test-utils
 * needed — just Vue's own createApp mounted to a detached element.
 */
function mountWithProvider<T>(setup: () => T): { result: T; unmount: () => void } {
  let result!: T;
  const ChildProbe = defineComponent({
    setup() {
      result = setup();
      return () => null;
    },
  });
  const storage = new MemoryAdapter();
  const app = createApp({
    render: () =>
      h(FeatureDropProvider, { manifest, storage }, { default: () => h(ChildProbe) }),
  });
  app.mount(document.createElement("div"));
  return { result, unmount: () => app.unmount() };
}

describe("vue integration", () => {
  it("useFeatureDrop exposes new features, count, and dismiss actions", () => {
    const { result, unmount } = mountWithProvider(() => useFeatureDrop());

    expect(result.newCount.value).toBe(1);
    expect(result.newFeatures.value.map((f) => f.id)).toEqual(["dark-mode"]);
    expect(result.isNew("/settings")).toBe(true);

    result.dismiss("dark-mode");
    expect(result.newCount.value).toBe(0);

    unmount();
  });

  it("useNewCount reflects the live count", () => {
    const { result, unmount } = mountWithProvider(() => useNewCount());
    expect(result.value).toBe(1);
    unmount();
  });

  it("useFeatureDrop throws when used outside a provider", () => {
    expect(() => useFeatureDrop()).toThrow(/FeatureDropProvider/);
  });
});

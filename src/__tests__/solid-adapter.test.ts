import { createRoot } from "solid-js";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MemoryAdapter } from "../adapters";
import { createManifest } from "../helpers";
import { createFeatureDropStore, useFeatureDrop } from "../solid";

// Fixture dates below are anchored to this instant.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-02-25T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("solid adapter", () => {
  it("creates a store with signal accessors and adapter actions", () => {
    createRoot((dispose) => {
      const manifest = createManifest([
        {
          id: "ai-journal",
          label: "AI Journal",
          releasedAt: "2026-02-20T00:00:00Z",
          showNewUntil: "2026-03-20T00:00:00Z",
          sidebarKey: "journal",
        },
      ]);
      const storage = new MemoryAdapter();
      const store = createFeatureDropStore({ manifest, storage });

      expect(store.newCount()).toBe(1);
      expect(store.isNew("journal")).toBe(true);

      store.dismiss("ai-journal");
      expect(store.newCount()).toBe(0);

      void store.dismissAll();
      expect(store.newCount()).toBe(0);

      dispose();
    });
  });

  it("exports hooks", () => {
    expect(typeof useFeatureDrop).toBe("function");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { emptyCVData } from "../types/cv";
import {
  clearCVDraft,
  CV_FORM_STEP_COUNT,
  loadCVDraft,
  mergeCVDataFromStorage,
  saveCVDraft,
} from "./cvDraftStorage";

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    _store: store,
  };
}

describe("mergeCVDataFromStorage", () => {
  it("returns defaults for invalid payload", () => {
    const data = mergeCVDataFromStorage(null);
    expect(data.experiences).toEqual([]);
    expect(data.template).toBe("classic");
  });

  it("parses englishContexts on languages", () => {
    const data = mergeCVDataFromStorage({
      languages: [
        {
          id: "1",
          language: "Anglais",
          level: "Courant",
          englishContexts: ["professional", "invalid"],
        },
      ],
    });

    expect(data.languages[0].englishContexts).toEqual(["professional"]);
  });

  it("keeps structuredDescription on experiences when present", () => {
    const data = mergeCVDataFromStorage({
      experiences: [
        {
          id: "e1",
          position: "Dev",
          company: "Co",
          structuredDescription: true,
          description: "● Titre : detail",
        },
      ],
    });

    expect(data.experiences[0].structuredDescription).toBe(true);
  });

  it("parses template and accent color when valid", () => {
    const data = mergeCVDataFromStorage({
      template: "classic_dev",
      accentColor: "teal",
    });

    expect(data.template).toBe("classic_dev");
    expect(data.accentColor).toBe("teal");
  });

  it("falls back to defaults for invalid template and accent", () => {
    const data = mergeCVDataFromStorage({
      template: "unknown",
      accentColor: "neon",
    });

    expect(data.template).toBe(emptyCVData.template);
    expect(data.accentColor).toBe(emptyCVData.accentColor);
  });

  it("merges personal info fields from storage", () => {
    const data = mergeCVDataFromStorage({
      personalInfo: {
        firstName: "Marie",
        lastName: "Martin",
        title: "Dev",
      },
    });

    expect(data.personalInfo.firstName).toBe("Marie");
    expect(data.personalInfo.lastName).toBe("Martin");
    expect(data.personalInfo.title).toBe("Dev");
    expect(data.personalInfo.email).toBe("");
  });
});

describe("localStorage draft round-trip", () => {
  let storage: ReturnType<typeof createStorageMock>;

  beforeEach(() => {
    storage = createStorageMock();
    vi.stubGlobal("localStorage", storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("saveCVDraft and loadCVDraft restore data and step", () => {
    const draft = {
      ...emptyCVData,
      personalInfo: { ...emptyCVData.personalInfo, firstName: "Test" },
      template: "classic_dev" as const,
    };

    saveCVDraft(draft, 3);
    const loaded = loadCVDraft();

    expect(loaded).not.toBeNull();
    expect(loaded?.data.personalInfo.firstName).toBe("Test");
    expect(loaded?.data.template).toBe("classic_dev");
    expect(loaded?.step).toBe(3);
  });

  it("loadCVDraft clamps step to valid range", () => {
    saveCVDraft(emptyCVData, 99);
    expect(loadCVDraft()?.step).toBe(CV_FORM_STEP_COUNT - 1);
  });

  it("loadCVDraft returns null for missing or invalid JSON", () => {
    expect(loadCVDraft()).toBeNull();
    storage.setItem("cvforge-draft", "not-json");
    expect(loadCVDraft()).toBeNull();
  });

  it("loadCVDraft supports legacy payload without wrapper", () => {
    storage.setItem(
      "cvforge-draft",
      JSON.stringify({
        personalInfo: { firstName: "Legacy", lastName: "" },
        template: "creative",
      }),
    );

    const loaded = loadCVDraft();
    expect(loaded?.data.personalInfo.firstName).toBe("Legacy");
    expect(loaded?.data.template).toBe("creative");
    expect(loaded?.step).toBe(0);
  });

  it("clearCVDraft removes stored draft", () => {
    saveCVDraft(emptyCVData, 1);
    clearCVDraft();
    expect(loadCVDraft()).toBeNull();
  });
});

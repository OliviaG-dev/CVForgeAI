import { describe, expect, it } from "vitest";
import type { Language } from "../types/cv";
import {
  canShowEnglishContexts,
  isEnglishLanguage,
  toggleEnglishContext,
} from "./language";

describe("isEnglishLanguage", () => {
  it("detects common English language names", () => {
    expect(isEnglishLanguage("Anglais")).toBe(true);
    expect(isEnglishLanguage("english")).toBe(true);
    expect(isEnglishLanguage("EN")).toBe(true);
  });

  it("rejects non-English languages", () => {
    expect(isEnglishLanguage("Français")).toBe(false);
    expect(isEnglishLanguage("Espagnol")).toBe(false);
  });
});

describe("canShowEnglishContexts", () => {
  const base: Language = {
    id: "1",
    language: "Anglais",
    level: "Courant",
  };

  it("allows contexts for eligible levels", () => {
    expect(canShowEnglishContexts(base)).toBe(true);
    expect(canShowEnglishContexts({ ...base, level: "Natif" })).toBe(true);
    expect(canShowEnglishContexts({ ...base, level: "Intermédiaire" })).toBe(
      true,
    );
  });

  it("hides contexts for Débutant or non-English", () => {
    expect(canShowEnglishContexts({ ...base, level: "Débutant" })).toBe(false);
    expect(canShowEnglishContexts({ ...base, language: "Français" })).toBe(
      false,
    );
  });
});

describe("toggleEnglishContext", () => {
  it("adds and removes context ids", () => {
    const added = toggleEnglishContext([], "professional", true);
    expect(added).toEqual(["professional"]);

    const removed = toggleEnglishContext(added, "professional", false);
    expect(removed).toEqual([]);
  });

  it("does not duplicate context ids", () => {
    const once = toggleEnglishContext(["professional"], "professional", true);
    expect(once).toEqual(["professional"]);
  });
});

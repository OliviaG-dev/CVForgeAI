import { describe, expect, it } from "vitest";
import { formatLanguageLevelDetail } from "./formatLanguage.js";

describe("formatLanguageLevelDetail", () => {
  it("returns level only when no English contexts", () => {
    expect(formatLanguageLevelDetail("Courant")).toBe("Courant");
  });

  it("appends English usage labels", () => {
    expect(
      formatLanguageLevelDetail("Courant", [
        "professional",
        "internationalTeam",
      ]),
    ).toBe("Courant — Professionnel, Équipe internationale");
  });

  it("ignores unknown context ids", () => {
    expect(
      formatLanguageLevelDetail("Natif", ["professional", "unknown"]),
    ).toBe("Natif — Professionnel");
  });

  it("includes technical daily label", () => {
    expect(
      formatLanguageLevelDetail("Intermédiaire", ["technicalDaily"]),
    ).toBe("Intermédiaire — Daily & Syncs techniques");
  });
});

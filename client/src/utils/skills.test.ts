import { describe, expect, it } from "vitest";
import { mergeSkillsUnique } from "./skills";

describe("mergeSkillsUnique", () => {
  it("merges lists without duplicates", () => {
    expect(mergeSkillsUnique(["React"], ["Vue.js", "Angular"])).toEqual([
      "React",
      "Vue.js",
      "Angular",
    ]);
  });

  it("treats normalized variants as duplicates", () => {
    expect(
      mergeSkillsUnique(["React", "react"], ["REACT", "Node.js", "nodejs"]),
    ).toEqual(["React", "Node.js"]);
  });

  it("preserves first encountered casing", () => {
    expect(mergeSkillsUnique(["TypeScript"], ["typescript"])).toEqual([
      "TypeScript",
    ]);
  });

  it("returns empty array when all inputs empty", () => {
    expect(mergeSkillsUnique([], [])).toEqual([]);
  });
});

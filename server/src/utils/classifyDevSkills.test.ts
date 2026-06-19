import { describe, expect, it } from "vitest";
import { classifySkillsForClassicDev } from "./classifyDevSkills.js";

function rowLabels(rows: ReturnType<typeof classifySkillsForClassicDev>): string[] {
  return rows.map((r) => r.label);
}

function itemsIn(rows: ReturnType<typeof classifySkillsForClassicDev>, label: string): string[] {
  return rows.find((r) => r.label === label)?.items ?? [];
}

describe("classifySkillsForClassicDev", () => {
  it("groups skills into dev categories in display order", () => {
    const rows = classifySkillsForClassicDev(
      ["JavaScript", "TypeScript", "React", "React Native", "Expo"],
      ["Node.js", "Jest", "Docker"],
      ["SCRUM", "Mentorat"],
    );

    expect(rowLabels(rows)).toEqual([
      "Front-end",
      "Mobile",
      "Back-end & API",
      "Tests & Qualité",
      "Cloud, DevOps & Infrastructure",
      "Méthodologies & Leadership",
    ]);
    expect(itemsIn(rows, "Front-end")).toEqual(
      expect.arrayContaining(["JavaScript", "TypeScript", "React"]),
    );
    expect(itemsIn(rows, "Mobile")).toEqual(
      expect.arrayContaining(["React Native", "Expo"]),
    );
    expect(itemsIn(rows, "Tests & Qualité")).toContain("Jest");
    expect(itemsIn(rows, "Méthodologies & Leadership")).toEqual(
      expect.arrayContaining(["SCRUM", "Mentorat"]),
    );
  });

  it("classifies IA skills separately from frontend", () => {
    const rows = classifySkillsForClassicDev(
      ["Prompt Engineering", "LangChain"],
      ["Cursor"],
      [],
    );

    const ia = itemsIn(rows, "IA & Automatisation");
    expect(ia).toEqual(
      expect.arrayContaining(["Prompt Engineering", "LangChain", "Cursor"]),
    );
    expect(itemsIn(rows, "Front-end")).not.toContain("LangChain");
  });

  it("deduplicates equivalent skills", () => {
    const rows = classifySkillsForClassicDev(
      ["React", "react", "REACT"],
      [],
      [],
    );

    expect(itemsIn(rows, "Front-end")).toHaveLength(1);
    expect(itemsIn(rows, "Front-end")[0]).toBe("React");
  });

  it("returns empty array when no skills provided", () => {
    expect(classifySkillsForClassicDev([], [], [])).toEqual([]);
  });

  it("classifies ESLint, GitHub, PHP, Render and Zustand into dev categories", () => {
    const rows = classifySkillsForClassicDev(
      ["ESLint", "Github", "PHP", "Render", "Zustand"],
      [],
      [],
    );

    expect(itemsIn(rows, "Front-end")).toContain("Zustand");
    expect(itemsIn(rows, "Back-end & API")).toContain("PHP");
    expect(itemsIn(rows, "Tests & Qualité")).toContain("ESLint");
    expect(itemsIn(rows, "Cloud, DevOps & Infrastructure")).toEqual(
      expect.arrayContaining(["Github", "Render"]),
    );
    expect(rowLabels(rows)).not.toContain("Autres");
  });
});

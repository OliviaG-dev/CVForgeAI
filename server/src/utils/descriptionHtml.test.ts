import { describe, expect, it } from "vitest";
import { descriptionToHtml, parseDescriptionItems } from "./descriptionHtml.js";

describe("parseDescriptionItems", () => {
  it("splits inline bullet characters", () => {
    const input =
      "● Ownership (Advisum) : Conception produit. ● Mentorat : Accompagnement juniors.";
    expect(parseDescriptionItems(input)).toEqual([
      "Ownership (Advisum) : Conception produit.",
      "Mentorat : Accompagnement juniors.",
    ]);
  });

  it("splits line-based bullets", () => {
    const input = "- Mission A\n- Mission B";
    expect(parseDescriptionItems(input)).toEqual(["Mission A", "Mission B"]);
  });
});

describe("descriptionToHtml", () => {
  it("renders plain list without bold titles when not structured", () => {
    const html = descriptionToHtml("Mission A\nMission B", false);
    expect(html).toContain('class="desc-list"');
    expect(html).not.toContain("desc-list--structured");
    expect(html).not.toContain("<strong>");
  });

  it("renders structured list with bold before colon", () => {
    const html = descriptionToHtml(
      "● Ownership Produit : Conception de A à Z.",
      true,
    );
    expect(html).toContain("desc-list--structured");
    expect(html).toContain("<strong>Ownership Produit</strong> :");
    expect(html).toContain("Conception de A à Z.");
  });

  it("escapes HTML in description text", () => {
    const html = descriptionToHtml("● Titre <script> : alerte", true);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("returns empty string for empty description", () => {
    expect(descriptionToHtml("   ", true)).toBe("");
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateCVHTMLForTemplate } from "./cv.js";
import {
  minimalClassicCv,
  minimalClassicDevCv,
} from "../test/fixtures/cvData.js";

describe("generateCVHTMLForTemplate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it("renders classic_dev with key skills and experiences page break", () => {
    const html = generateCVHTMLForTemplate(minimalClassicDevCv);

    expect(html).toContain("COMPÉTENCES CLÉS");
    expect(html).toContain("Front-end");
    expect(html).toContain("has-dev-skills");
    expect(html).toContain("section--experiences");
    expect(html).toMatch(/page-break-before:\s*always/);
    expect(html).toContain("Expériences");
  });

  it("renders structured senior bullets in experience description", () => {
    const html = generateCVHTMLForTemplate(minimalClassicDevCv);

    expect(html).toContain("desc-list--structured");
    expect(html).toContain("<strong>Ownership</strong>");
  });

  it("renders English usage contexts in languages section", () => {
    const html = generateCVHTMLForTemplate(minimalClassicDevCv);

    expect(html).toContain("Anglais");
    expect(html).toContain("Courant — Professionnel");
  });

  it("escapes HTML in personal summary", () => {
    const html = generateCVHTMLForTemplate({
      ...minimalClassicDevCv,
      personalInfo: {
        ...minimalClassicDevCv.personalInfo,
        summary: "<script>alert(1)</script>",
      },
    });

    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>alert");
  });

  it("includes hidden ATS keywords without visible styling leak", () => {
    const html = generateCVHTMLForTemplate(minimalClassicDevCv);

    expect(html).toContain("kubernetes hidden");
    expect(html).toContain("ats-hidden");
  });

  it("renders classic template without dev skills block", () => {
    const html = generateCVHTMLForTemplate(minimalClassicCv);

    expect(html).not.toContain("COMPÉTENCES CLÉS");
    expect(html).toContain("Compétences");
  });

  it("renders creative template layout", () => {
    const html = generateCVHTMLForTemplate({
      ...minimalClassicDevCv,
      template: "creative",
    });

    expect(html).toContain("timeline-item");
    expect(html).toContain("left");
    expect(html).toContain("timeline-city");
  });

  it("renders company and city with discrete city styling", () => {
    const html = generateCVHTMLForTemplate(minimalClassicDevCv);

    expect(html).toContain("TechCorp");
    expect(html).toContain('class="entry__city"');
    expect(html).toContain(", Lyon");
  });

  it("appends automatic duration on current experience", () => {
    const html = generateCVHTMLForTemplate(minimalClassicDevCv);

    expect(html).toContain("Aujourd'hui");
    expect(html).toMatch(/\(4 ans et 6 mois\)/);
  });

  it("appends duration on completed education", () => {
    const html = generateCVHTMLForTemplate(minimalClassicDevCv);

    expect(html).toContain("Master Informatique");
    expect(html).toContain("Université Lyon");
    expect(html).toMatch(/\(1 an et 10 mois\)/);
  });

  it("renders projects section with cleaned URL", () => {
    const html = generateCVHTMLForTemplate(minimalClassicDevCv);

    expect(html).toContain("Projets");
    expect(html).toContain("Portfolio CV");
    expect(html).toContain("example.com/portfolio");
  });

  it("applies accent color CSS variable", () => {
    const html = generateCVHTMLForTemplate({
      ...minimalClassicDevCv,
      accentColor: "teal",
    });

    expect(html).toContain("#0d9488");
  });

  it("does not use structured bullets when structuredDescription is false", () => {
    const html = generateCVHTMLForTemplate({
      ...minimalClassicDevCv,
      experiences: [
        {
          ...minimalClassicDevCv.experiences[0],
          structuredDescription: false,
          description: "● Titre : Ne doit pas être structuré",
        },
      ],
    });

    expect(html).toMatch(
      /<div class="entry__desc"><ul class="desc-list"><li>Titre : Ne doit pas être structuré<\/li><\/ul><\/div>/,
    );
    expect(html).not.toMatch(
      /<div class="entry__desc"><ul class="desc-list desc-list--structured"/,
    );
  });
});

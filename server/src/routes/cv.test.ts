import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../services/ai.js", () => ({
  generateCV: vi.fn().mockResolvedValue('{"summary":"ok"}'),
  improveDescription: vi.fn().mockResolvedValue("Description améliorée par IA"),
}));

vi.mock("../services/pdf.js", () => ({
  generatePDF: vi.fn().mockResolvedValue(Buffer.from("%PDF-1.4 mock")),
}));

import { generateCV, improveDescription } from "../services/ai.js";
import { generatePDF } from "../services/pdf.js";
import { createApp } from "../app.js";
import { minimalClassicDevCv } from "../test/fixtures/cvData.js";

const app = createApp();

describe("CV API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("POST /api/cv/generate returns AI output", async () => {
    const payload = {
      experience: "5 ans développeur",
      skills: "React, Node.js",
      education: "Master informatique",
      language: "français",
    };
    const res = await request(app).post("/api/cv/generate").send(payload);

    expect(res.status).toBe(200);
    expect(res.body.cv).toBe('{"summary":"ok"}');
    expect(generateCV).toHaveBeenCalledWith(payload);
  });

  it("POST /api/cv/improve returns improved text", async () => {
    const res = await request(app)
      .post("/api/cv/improve")
      .send({ description: "Mission initiale", senior: true });

    expect(res.status).toBe(200);
    expect(res.body.improved).toBe("Description améliorée par IA");
    expect(improveDescription).toHaveBeenCalledWith("Mission initiale", {
      senior: true,
    });
  });

  it("POST /api/cv/improve defaults senior to false", async () => {
    await request(app)
      .post("/api/cv/improve")
      .send({ description: "Texte brut" });

    expect(improveDescription).toHaveBeenCalledWith("Texte brut", {
      senior: false,
    });
  });

  it("POST /api/cv/improve returns 500 when AI fails", async () => {
    vi.mocked(improveDescription).mockRejectedValueOnce(new Error("API down"));

    const res = await request(app)
      .post("/api/cv/improve")
      .send({ description: "fail" });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/amélioration/i);
  });

  it("POST /api/cv/generate returns 500 when AI fails", async () => {
    vi.mocked(generateCV).mockRejectedValueOnce(new Error("API down"));

    const res = await request(app).post("/api/cv/generate").send({
      experience: "x",
      skills: "y",
      education: "z",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/génération/i);
  });

  it("POST /api/cv/pdf returns application/pdf", async () => {
    const res = await request(app)
      .post("/api/cv/pdf")
      .send(minimalClassicDevCv);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/application\/pdf/);
    expect(res.headers["content-disposition"]).toMatch(/CV-Jean-Dupont\.pdf/);
  });

  it("POST /api/cv/pdf uses default filename without personal info", async () => {
    const res = await request(app).post("/api/cv/pdf").send({
      ...minimalClassicDevCv,
      personalInfo: {
        ...minimalClassicDevCv.personalInfo,
        firstName: "",
        lastName: "",
      },
    });

    expect(res.headers["content-disposition"]).toMatch(/cv\.pdf/);
  });

  it("POST /api/cv/pdf passes noMargins for creative template", async () => {
    await request(app)
      .post("/api/cv/pdf")
      .send({ ...minimalClassicDevCv, template: "creative" });

    expect(generatePDF).toHaveBeenCalledWith(
      expect.stringContaining("timeline-item"),
      { noMargins: true },
    );
  });

  it("POST /api/cv/pdf returns 500 when PDF generation fails", async () => {
    vi.mocked(generatePDF).mockRejectedValueOnce(
      new Error("Chrome indisponible"),
    );

    const res = await request(app)
      .post("/api/cv/pdf")
      .send(minimalClassicDevCv);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Chrome indisponible");
  });
});

process.env.NODE_ENV = "test";

const { extractMusicXml, normalizeGroqError } = require("../../src/services/groqService");

describe("extractMusicXml", () => {
  it("extracts MusicXML with declaration", () => {
    const xml = "<?xml version=\"1.0\"?><score-partwise><part></part></score-partwise>";
    const result = extractMusicXml(`Here is your score:\n${xml}`);

    expect(result).toBe(xml);
  });

  it("extracts MusicXML without declaration", () => {
    const xml = "<score-partwise><part></part></score-partwise>";
    const result = extractMusicXml(`Intro text\n${xml}\nThanks`);

    expect(result).toBe(xml);
  });

  it("ignores xml tags before MusicXML code", () => {
    const xml = "<score-partwise><part></part></score-partwise>";
    const result = extractMusicXml(`Intro <think/> text\n${xml}\nThanks`);

    expect(result).toBe(xml);
  });

  it("ignores code fences", () => {
    const xml = "<score-partwise><part></part></score-partwise>";
    const result = extractMusicXml(`\
\`\`\`xml\n${xml}\n\`\`\`\n`);

    expect(result).toBe(xml);
  });

  it("returns null when no MusicXML exists", () => {
    expect(extractMusicXml("No xml here")).toBeNull();
  });
});

describe("normalizeGroqError", () => {
  it("preserves status from error.status", () => {
    const error = new Error("Rate limited");
    error.status = 429;
    const result = normalizeGroqError(error);
    expect(result.status).toBe(429);
    expect(result.message).toBe("Rate limited");
  });

  it("extracts status from response.status", () => {
    const error = new Error("Server error");
    error.response = { status: 500 };
    const result = normalizeGroqError(error);
    expect(result.status).toBe(500);
  });

  it("handles error without status", () => {
    const error = new Error("Network failure");
    const result = normalizeGroqError(error);
    expect(result.status).toBeUndefined();
    expect(result.cause).toBe(error);
  });
});

process.env.NODE_ENV = "test";

const { extractMusicXml } = require("../../src/services/groqService");

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

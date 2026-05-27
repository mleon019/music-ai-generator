const validateScoreConfig = require("../../src/middleware/validateScoreConfig");

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe("validateScoreConfig", () => {
  it("accepts a valid config", () => {
    const req = {
      body: {
        config: {
          timeSignature: "4/4",
          tempo: 120,
          instrument: "Piano",
          measures: 4
        }
      }
    };
    const res = createRes();
    const next = jest.fn();

    validateScoreConfig(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.validatedConfig).toEqual({
      timeSignature: "4/4",
      tempo: 120,
      instrument: "Piano",
      measures: 4
    });
  });

  it("trims string inputs", () => {
    const req = {
      body: {
        config: {
          timeSignature: " 3/4 ",
          tempo: 90,
          instrument: " Violin ",
          measures: 2
        }
      }
    };
    const res = createRes();
    const next = jest.fn();

    validateScoreConfig(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.validatedConfig).toEqual({
      timeSignature: "3/4",
      tempo: 90,
      instrument: "Violin",
      measures: 2
    });
  });

  it("rejects missing config", () => {
    const req = { body: {} };
    const res = createRes();
    const next = jest.fn();

    validateScoreConfig(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "config must be an object" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects invalid fields", () => {
    const req = {
      body: {
        config: {
          timeSignature: "7/8",
          tempo: 10,
          instrument: "Saxophone",
          measures: 20
        }
      }
    };
    const res = createRes();
    const next = jest.fn();

    validateScoreConfig(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    const errorMessage = res.json.mock.calls[0][0].error;
    expect(errorMessage).toContain("timeSignature must be one of");
    expect(errorMessage).toContain("tempo must be a number");
    expect(errorMessage).toContain("instrument must be one of");
    expect(errorMessage).toContain("measures must be a number");
    expect(next).not.toHaveBeenCalled();
  });
});

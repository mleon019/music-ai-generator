class BaseExportStrategy {
  async execute(_options = {}) {
    throw new Error("execute() must be implemented by subclass");
  }

  getFileExtension() {
    throw new Error("getFileExtension() must be implemented by subclass");
  }

  getMimeType() {
    throw new Error("getMimeType() must be implemented by subclass");
  }

  buildFilename() {
    const timestamp = Date.now();
    return `score-${timestamp}.${this.getFileExtension()}`;
  }
}

module.exports = BaseExportStrategy;

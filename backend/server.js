const app = require("./app");
const config = require("./src/config");

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});

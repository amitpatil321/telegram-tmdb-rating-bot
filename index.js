const express = require("express");
const app = express();
const port = 3000;

const { handler } = require("./controller");

app.use(express.json());

app.post("*", async (req, res) => {
  res.send(await handler(req));
});

app.get("*", async (req, res) => {
  res.send(await handler(req));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

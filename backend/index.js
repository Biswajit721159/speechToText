const express = require('express');
let app = express()
const PORT = 2000;
app.get("/", async (req, res) => {
  res.send("server is running ...")
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
let app = express()
const PORT = 2000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

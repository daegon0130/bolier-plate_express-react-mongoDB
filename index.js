const express = require("express");
const app = express(); //express 앱 만들기
const port = 3000;

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://daegon0130:css26534698@boilerplate.by75w.mongodb.net/<dbname>?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! 안녕");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

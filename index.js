const express = require("express");
const app = express(); //express 앱 만들기
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");

const config = require("./config/key");

const { User } = require("./models/User");

app.use(cors()); // cors 허용

// application/x-www-form-urlencoded -> 이렇게 된 데이터를 분석해서 가져올 수 있게 해줌.
app.use(bodyParser.urlencoded({ extended: true }));
// application/json -> josn 타입으로 된 것을 가져올 수 있게 해줌.
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! 안녕 새해복!");
});

app.post("/register", (req, res) => {
  // 회원 가입할 떄 필요한 정보들을 client에서 가져오면
  // 그것들을 database에 넣어준다.

  const user = new User(req.body); // 인스턴스화

  user.save((err, userInfo) => {
    if (err) return res.json({ sucess: false, err }); // 에러 메세지와 함께 return
    return res.status(200).json({
      success: true,
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

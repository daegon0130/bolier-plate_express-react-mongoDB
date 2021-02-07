const express = require("express");
const app = express(); //express 앱 만들기
const port = 3000;
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const { auth } = require('./middleware/auth');
const { User } = require("./models/User"); // User db 모델 가져오기

app.use(cors()); // cors 허용

// application/x-www-form-urlencoded -> 이렇게 된 데이터를 분석해서 가져올 수 있게 해줌.
app.use(bodyParser.urlencoded({ extended: true }));
// application/json -> josn 타입으로 된 것을 가져올 수 있게 해줌.
app.use(bodyParser.json());
// cookie
app.use(cookieParser());

const mongoose = require("mongoose");
const { Router } = require("express");
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

// 회원가입 라우터
app.post("/api/users/register", (req, res) => {
  // 회원 가입할 떄 필요한 정보들을 client에서 가져오면
  // 그것들을 database에 넣어준다.

  const user = new User(req.body); // 인스턴스화

  // user 모델에 저장
  user.save((err, userInfo) => {
    if (err) return res.json({ sucess: false, err }); // 에러 메세지와 함께 return
    return res.status(200).json({
      success: true,
    });
  });
});

// 로그인 라우터
app.post("/api/users/login", (req, res) => {
  // 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      // db에 해당 이메일이 없음
      return res.json({
        loginSucess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    // 요청한 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSucess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      // 비밀번호까지 같다면 토큰을 생성하기. jsonwebtoken 다운
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 토큰을 저장한다. 어디에? 쿠키, 로컬 스토리지
        res
          .cookie("x_auth", user.token) // 브라우저에서 쿠키 확인해보면 x_auth라는 이름으로 토큰이 저장됨을 볼 수 있다.
          .status(200)
          .json({ loginSucess: true, userId: user._id });
      });
    });
  });
});


// role 1 어드민    role 2 특정 부서 어드민
// role 0 -> 일반 유저    role 0 이 아니면 관리자
app.get('/api/users/auth', auth, (req, res)=>{
  // 여기까지 미들웨어를 통과해 있다는 얘기는 Authentication이 True라는 말.
  res.status(200).json({
    _id : req.user._id,
    isAdmin: req.user.role === 0 ? false: true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  })
})

app.get('/api/users/logout', auth, (req,res)=>{
  User.findOneAndUpdate( { _id: req.user._id},
    {token: ""}, (err, user)=>{
      if(err) return res.json({sucess: false, err});
      return res.status(200).send({
        success: true
      })
    })
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

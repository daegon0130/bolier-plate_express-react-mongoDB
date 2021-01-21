const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10; // saltRounds salt가 몇 글자인지 나타냄.
const jwt = require("jsonwebtoken");

const userSchma = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

// index.js 의 user.save() 하기 전에 아래 코드를 수행하고 index.js에 저장
userSchma.pre("save", function(next) {
  let user = this; // userSchema를 가리킴
  // 비밀번호를 암호화 시킨다.
  // 비밀번호를 바꿀때만 비밀번호 해싱
  if (user.isModified("password")) {
    // salt를 먼저 생성 -> salt를 이용해서 비밀번호를 암호화함
    bcrypt.genSalt(saltRounds, function(err, salt) {
      if (err) return next(err); // next하면 바로 index.js의 user.save()로 이동
      bcrypt.hash(user.password, salt, function(err, hash) {
        // Store hash in your password DB.
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next(); // 비밀번호 바꾸는 게 아니면 그냥 넘어감. next()를 안하면 index.js 의 user.save()로 넘어가지 않음.
  }
});

userSchma.methods.comparePassword = function(plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch); //match됨. isMatch 가 true
  });
};

userSchma.methods.generateToken = function(cb) {
  var user = this;
  // jsonwebtoken을 이용해서 token을 생성하기
  var token = jwt.sign(user._id.toHexString(), "secretToken");
  // user._id + 'secretToken'  = token
  // 나중에 'secretToken' 가지고 user._id를 알아냄

  user.token = token;
  user.save(function(err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchma.statics.findByToken = function ( token, cb ){
  var user = this;

  //user._id + ' ' = token
  // 토큰을 decode한다.
  jwt.verify(token, "secretToken", function(err, decoded) {
    //유저 아이디를 이용해서 유저를 찾은 다음에
    // 클라이언트에서 가져온 token과 db에 보관된 토큰이 일치하는지 확인

    user.findOne({"_id": decoded, "token": token }, function(err, user){
      if(err) return cb(err);
      cb(null, user)
    })
  })
}

const User = mongoose.model("User", userSchma);

module.exports = { User };

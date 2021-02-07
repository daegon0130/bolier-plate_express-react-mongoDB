// auth 기능: 
// 1. 페이지 이동 때마다 로그인되있는지 안되어있는지, 관리자 유저인지 등을 체크
// 2. 글을 쓸 때나 지울 때 같이 권한이 있는지 같은 것도 체크
// 이를 클라이언트가 서버에 쿠키에 담겨진 토큰을 전달
// 인코드 된 토큰을 jwt를 이용해 디코드해서 db의 user._id와 같은지 확인

const { User } = require("../models/User");

let auth = (req, res, next) =>{
    // 인증 처리를 하는 곳.

    // 클라이언트 쿠키에서 토큰을 가져옴.
    let token = req.cookies.x_auth;

    // 토큰을 복호화한 후 유저를 찾는다.
    User.findByToken(token, (err, user)=>{
        if(err) throw err;
        if(!user) return res.json({ isAuth: false, error: true})
        
        req.token = token;
        req.user = user
        next();
    })

    // 유저가 있으면 인증 Okay

    // 유저가 있으면 인증 No !
}

module.exports = { auth };
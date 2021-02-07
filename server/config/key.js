// 만약 local 개발환경이면 prod, 배포할 땐 dev 에서 가져옴

if (process.env.NODE_ENV === "production") {
  module.exports = require("./prod");
} else {
  module.exports = require("./dev");
}

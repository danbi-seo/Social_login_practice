const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const qs = require("querystring");
// require("dotenv").config();

const kakaoClientId = process.env.KAKAO_CLIENT_ID;
const redirectURI = process.env.REDIRECT_URI;

const naverClientId = process.env.NAVER_CLIENT_ID;
const naverClientSecret = process.env.NAVER_CLIENT_SECRET;
const naverSecret = process.env.NAVER_SECRET;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["OPTIONS", "GET", "POST", "DELETE"],
  })
);

app.use(express.json());

/* 카카오 */

app.get("/env/kakao-client-id", (req, res) => {
  res.json(kakaoClientId);
});

//받은 인가코드를 확인하고 access Token 달라고 요청
app.post("/kakao/login", (req, res) => {
  const authorizationCode = req.body;
  // axios
  //   .post(
  //     "https://kauth.kakao.com/oauth/token",
  //     {
  //       grant_type: "authorization_code",
  //       client_id: kakaoClientId,
  //       redirect_uri: redirectURI,
  //       code: authorizationCode,
  //     },
  //     {
  //       headers: {
  //         "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
  //       },
  //     }
  //   )
  //   .then((response) => res.send(response.data.access_token));
  console.log(req.body);
});

app.post("/kakao/userinfo", (req, res) => {
  const { kakaoAccessToken } = req.body;
  axios
    .get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    })
    .then((response) => res.json(response.data.properties));
});

app.delete("/kakao/logout", (req, res) => {
  const { kakaoAccessToken } = req.body;
  axios
    .post(
      "https://kapi.kakao.com/v1/user/logout",
      {},
      {
        headers: { Authorization: `Bearer ${kakaoAccessToken}` },
      }
    )
    .then((response) => res.send("로그아웃 성공"));
});

/* 네이버 */

app.post("/naver/login", (req, res) => {
  const authorizationCode = req.body.authorizationCode;
  axios
    .post(
      `https://nid.naver.com/oauth2.0/token?client_id=${naverClientId}&client_secret=${naverClientSecret}&grant_type=authorization_code&state=${naverSecret}&code=${authorizationCode}
  `
    )
    .then((response) => res.send(response.data.access_token));
});

app.post("/naver/userinfo", (req, res) => {
  const { naverAccessToken } = req.body;
  axios
    .get("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: `Bearer ${naverAccessToken}`,
      },
    })
    .then((response) => res.json(response.data.response));
});

app.delete("/naver/logout", (req, res) => {
  const { naverAccessToken } = req.body;
  axios
    .post(
      `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${naverClientId}&client_secret=${naverClientSecret}&access_token=${naverAccessToken}&service_provider=NAVER`
    )
    .then((response) => res.send("로그아웃 성공"));
});

/* 구글 */

app.get("/google/login-url", (req, res) => {
  const base = "https://accounts.google.com/o/oauth2/v2/auth";
  const query = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email profile",
    access_type: "offline",
    prompt: "consent",
  });

  res.send({ url: `${base}?${query}` });
});

app.listen(3000, () => console.log("서버가 열렸어요!"));

// server.js에서
// app.get("/env/kakao-client-id", (req, res) => {
//   res.json({ clientId: process.env.KAKAO_CLIENT_ID });
// });

// login.js에서
// fetch("http://localhost:포트번호에맞게/env/kakao-client-id")
//   .then((res) => res.json())
//   .then((data) => {
//     const clientId = data.clientId;
// }

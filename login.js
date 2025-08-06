const kakaoLoginButton = document.querySelector("#kakao");
const naverLoginButton = document.querySelector("#naver");
const userImage = document.querySelector("img");
const userName = document.querySelector("#user_name");
const logoutButton = document.querySelector("#logout_button");

let kakaoClientId = "";
const redirectURI = "http://127.0.0.1:5500/OAuth/";
let kakaoAccessToken = "";

axios.defaults.headers.common["Content-Type"] = "text/plain";

// const naverClientId = process.env.NAVER_CLIENT_ID;
// const naverClientSecret = process.env.NAVER_CLIENT_SECRET;
// const naverSecret = process.env.NAVER_SECRET;
// let naverAccessToken = "";

// const googleClientId = process.env.GOOGLE_CLIENT_ID;
// const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

function renderUserInfo(imgURL, name) {
  userImage.src = imgURL;
  userName.textContent = name;
}

/* 카카오 */

const updateKakaoEnv = async () => {
  const response = await axios.get("http://localhost:3000/env/kakao-client-id");
  kakaoClientId = response.data;
  console.log("id", kakaoClientId);
};

kakaoLoginButton.onclick = async () => {
  await updateKakaoEnv();
  location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoClientId}&redirect_uri=${redirectURI}`;
  // const kakaoAuth = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${redirectURL}&response_type=code`;
  // window.location.href = kakaoAuth;
  console.log("id", kakaoClientId);
  // const res = await axios.get("http://localhost:3000/google/login-url");
};

/* 네이버 */

naverLoginButton.onclick = async () => {
  const res = await axios.get("http://localhost:3000/google/login-url");
  location.href = res.data.url;
};

// googleLoginButton.onclick = async () => {
//   const res = await axios.get("http://localhost:3000/google/login-url");
//   location.href = res.data.url;
// };

window.onload = async () => {
  const url = new URL(location.href);
  const urlParams = url.searchParams;
  const authorizationCode = urlParams.get("code");
  // const naverState = urlParams.get("state");
  const naverState = null;
  console.log(authorizationCode);
  if (authorizationCode) {
    //여기에 인가코드가 담김
    if (naverState) {
      axios
        .post("http://localhost:3000/naver/login", { authorizationCode })
        .then((res) => {
          naverAccessToken = res.data;
          return axios.post("http://localhost:3000/naver/userinfo", {
            naverAccessToken,
          });
        })
        .then((res) => {
          renderUserInfo(res.data.profile_image, res.data.name);
          currentOAuthService = "naver";
        });
    } else {
      const accessTokenResponse = await axios.post(
        "/kakao/login",
        authorizationCode
      );
      kakaoAccessToken = accessTokenResponse.data;
      await axios
        .post("http://localhost:3000/kakao/login", { authorizationCode })
        .then((res) => {
          kakaoAccessToken = res.data;
          return axios.post("http://localhost:3000/kakao/userinfo", {
            kakaoAccessToken,
          });
        })
        .then((res) => {
          renderUserInfo(res.data.profile_image, res.data.nickname);
          currentOAuthService = "kakao";
        });
    }
  }
};

logoutButton.onclick = () => {
  if (currentOAuthService === "kakao") {
    axios
      .delete("http://localhost:3000/kakao/logout", {
        data: { kakaoAccessToken },
      })
      .then((res) => {
        {
          console.log(res.data);
          renderUserInfo("", "");
        }
      });
  } else if (currentOAuthService === "naver") {
    axios
      .delete("http://localhost:3000/naver/logout", {
        data: { naverAccessToken },
      })
      .then((res) => {
        {
          console.log("구글 로그아웃", res.data);
          renderUserInfo("", "");
        }
      });
  }
};

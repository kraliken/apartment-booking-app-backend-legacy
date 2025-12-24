const fetch = require("node-fetch")

const CLIENT_ID = process.env.LOGIN_CLIENT_ID
const CLIENT_SECRET = process.env.LOGIN_CLIENT_SECRET

const makeQuerystring = params =>
  Object.keys(params)
    .map(key => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    })
    .join("&")

const getAccesToken = async (refreshToken) => {
  try {

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "post",
      body: makeQuerystring({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })

    const token = await response.json()

    if (!response.ok) {
      return null;
    }

    return token.access_token;

  } catch (error) {
    console.log("access token request error: " + error);
  }


}



module.exports = {
  getAccesToken
}

import cookie from "react-cookies";
const baseURI = `${process.env.REACT_APP_HOST_URI}/api/${process.env.REACT_APP_BACKEND_RELEASE_VERSION}`;
if(process.env.REACT_APP_STAGE_DEVELOPMENT) {
    let expires = new Date();
    expires.setDate(
      expires.getDate() + 7
    );
    cookie.save('jwt', "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxNTpkdW1teUByZXN0LmNvbTpkdW1teSIsImlzcyI6ImRlbW8uaW8ifQ.L9X4iZ4W1ahJHsUq5LOImukqwh96IGyshoR8O89q9dMd1FVroCB2uxTvVVW0HQXhruo-5U3cOoqd-fLWKlesv67owRWBGRSNMIgKEgCTRO-wA0lJ5hUOCoG8giAoqx1H4KRKy4sl5mnqgo7Kzyk8IRaqOEnjX6x0DYmvA1Rt2jg", { path: '/', expires: expires })
    cookie.save('current_user', {
      "id": 15,
      "name": "Dummy",
      "email": "dummy@rest.com",
      "profileName": "dummy"
  }, { path: '/', expires: expires })
}
export default baseURI;
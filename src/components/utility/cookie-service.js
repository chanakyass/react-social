import cookie from 'react-cookies'

const updateCookie = ({jwt, currentUser}) => {

    let expires = new Date();
    expires.setDate(expires.getDate() + 7);

    if(jwt)
        cookie.save("jwt", jwt, { path: "/", expires: expires });
    if (currentUser)
        cookie.save("current_user", currentUser, { path: "/", expires: expires });
}
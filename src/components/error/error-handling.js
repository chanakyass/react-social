import history from '../../app-history'
import cookie from 'react-cookies';

export const handleError = ({ error }) => {
    console.log(error);
    if (error.statusCode === 401 || error.statusCode === 403) {
    cookie.remove("jwt", { path: "/" });
    cookie.remove("current_user", { path: "/" });
    history.push('/auth_error', error);
    }
    else {
        history.push("/error", error);
    }
}
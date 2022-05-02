import history from '../../app-history'
import cookie from 'react-cookies';
import moment from 'moment';


export const handleError = ({ error }) => {    
    if (!error.statusCode && error.toString().match(/TypeError: Failed to fetch/gi)) {
      history.push("/conn_error", {
        statusCode: 522,
        message: "Could not reach the server",
        timestamp: moment().format("dddd, MMM Do YYYY"),
      });
    }
    else if (error.statusCode === 401 || error.statusCode === 403) {
    cookie.remove("jwt", { path: "/" });
    cookie.remove("current_user", { path: "/" });
    history.push('/auth_error', error);
    }
    else if (error.statusCode === 500 || error.exceptionType === "API_SPECIFIC_EXCEPTION") {

    } else {
      history.push("/error", error);
    }
}
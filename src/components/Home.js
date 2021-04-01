import { NavBar } from './navigation/NavBar'
import { UserFeed } from './userfeed/UserFeed'
import cookie from "react-cookies";
import history from "../app-history";

const Home = () => {

    const loggedInUser = cookie.load("current_user");

    return <>
        <UserFeed />
    </>
    
}

export default Home
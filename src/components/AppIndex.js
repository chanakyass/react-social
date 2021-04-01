
import User from "./user/User";
import ErrorPage from "./error/ErrorPage";
import UserFeed from "./userfeed/UserFeed";
import NavBar from './navigation/NavBar'
import history from '../app-history'

import { Router, Route, Switch } from "react-router";


const AppIndex = () => {
console.log('AppIndex')
  return (
    <>
      <Router history={history}>
        <NavBar />
        <Switch>
        {/* <div className='row'> */}
          {/* <div className="col-md-8 my-3 mx-auto"> */}
            <Route exact path="/profile/:id" component={User} />
          {/* </div> */}

          <Route exact path="/error" component={ErrorPage} />

            {/* <div className="col-md-8 mx-auto"> */}
                <Route exact path="/" component={UserFeed} />
            {/* </div> */}
        {/* </div> */}
        </Switch>
      </Router>
    </>
  );
};

export default AppIndex;


import User from "./user/User";
import ErrorPage from "./error/ErrorPage";
import UserFeed from "./userfeed/UserFeed";
import NavBar from './navigation/NavBar'
import history from '../app-history'
import { useState } from 'react';

import { Router, Route, Switch } from "react-router";


const AppIndex = () => {

  const [addPostButtonClicked, setAddPostButtonClicked] = useState(false);
  return (
    <>
      <Router history={history}>
        <NavBar setAddPostButtonClicked={ setAddPostButtonClicked } />
        <Switch>
          <Route exact path="/profile/:id" component={User} />
          <Route exact path="/error" component={ErrorPage} />
          <Route exact path="/" render={() => <UserFeed setAddPostButtonClicked={ setAddPostButtonClicked } addPostButtonClicked={addPostButtonClicked} />}/>
        </Switch>
      </Router>
    </>
  );
};

export default AppIndex;

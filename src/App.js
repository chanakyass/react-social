import './App.css';
import  UserRegister  from './components/user/UserRegister'
import Login from './components/login/Login'
import history from './app-history'
import 'react-app-polyfill/stable';

import {
  Router,
  Route,
  Switch
} from "react-router";
import { Redirect } from 'react-router'
import Cookies from "universal-cookie";
import AppIndex from './components/AppIndex';
import React, { useState } from 'react';
import ErrorPage from './components/error/ErrorPage';

function userExists() {
    const cookies = new Cookies();
    if (cookies.get('current_user'))
        return true
    return false
}

export const CurrentUserContext = React.createContext();


function App() {


  const [isCurrentUserUpdated, setIsCurrentUserUpdated] = useState(false);
  const value = { isCurrentUserUpdated, setIsCurrentUserUpdated };


  

  return (
    <div>
    <Router history={history}>
      <Switch>
        <Route exact path="/login"  render={() => userExists()? <Redirect to={{pathname: '/', state: {showAlert: true, alertMessage: 'You are logged in'}}} />: <Login/>} />
          <Route exact path="/register" render={() => userExists() ? <Redirect to={{ pathname: '/', state: { showAlert: true, alertMessage: 'You are logged in' } }} /> : <UserRegister />} />
          <Route exact path="/auth_error" component={ ErrorPage }/>
        <Route exact path='*' render={() => !userExists() ? <Redirect to={{ pathname: '/login' }} /> : <CurrentUserContext.Provider value={ value }><AppIndex/></CurrentUserContext.Provider>}/>
    
      </Switch>
      </Router>
      </div>
  );
}

export default App;


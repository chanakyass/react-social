import './App.css';
import  UserRegister  from './components/user/UserRegister'
import Login from './components/login/Login'
import history from './app-history'

import {
  Router,
  Route,
  Switch
} from "react-router";
import { Redirect } from 'react-router'
import Cookies from "universal-cookie";
import AppIndex from './components/AppIndex';
import { ErrorAlert } from './components/ErrorAlert';

function userExists() {
    const cookies = new Cookies();
    if (cookies.get('current_user'))
        return true
    return false
}

function App() {
  console.log('App')
  return (
    <div className='social-container social-special-gray'>
    <Router history={history}>
      <Switch>
        <Route exact path="/login"  render={() => userExists()? <Redirect to={{pathname: '/', state: {showAlert: true, alertMessage: 'You are logged in'}}} />: <Login/>} />
        <Route exact path="/register" render={() => userExists()? <Redirect to={{pathname: '/', state: {showAlert: true, alertMessage: 'You are logged in'}}} />: <UserRegister/>}  />
        {/* <Route
          exact
          path="/profile/:id"
          render={() =>
            userExists() ? <User /> : <Redirect to={{ pathname: "/login" }} />
          }
        />
        <Route exact path="/error" component={ErrorPage} />
        <Route
          exact
          path="/"
          render={() =>
            userExists() ? <UserFeed /> : <Redirect to={{ pathname: "/login" }} />
          }
        /> */}
        <Route exact path='*' render={ ()=> !userExists()?<Redirect to={{pathname: '/login'}} /> : <AppIndex/>}/>
    
      </Switch>
      </Router>
      </div>
  );
}

export default App;


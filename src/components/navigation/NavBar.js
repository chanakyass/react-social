import { Navbar, Nav, Form, FormControl, Button, NavDropdown , DropdownButton, Dropdown} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
 faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import cookie from "react-cookies";
import history from '../../app-history'
import React, { useState, useEffect, useContext } from 'react'
import { CurrentUserContext } from '../../App'


const NavBar = React.memo(({ setAddPostButtonClicked }) => {


  const { isCurrentUserUpdated, setIsCurrentUserUpdated } = useContext(
    CurrentUserContext
  );

  const loggedInUser = cookie.load('current_user');

  const logout = (e) => {

    cookie.remove('jwt', { path: '/' })
    cookie.remove('current_user', { path: '/' })
    setTimeout(() => history.push("/login"), 800);
    
    
  }


  return (
    <>
      {
        <Navbar style={{ position: "sticky" }} bg="light" fixed='top' expand="lg">
          <Navbar.Brand href="/">Citizen Sane</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              {/* <Nav.Link href="/">Home</Nav.Link> */}
              <Form className="my-auto" inline>
                <FormControl
                  type="text"
                  placeholder="Search"
                  className="mr-sm-2"
                />
                <Button variant='light' >Search</Button>
              </Form>
              <div >
                <Button variant="light" onClick={(e) => { setAddPostButtonClicked(true) }}>
                  Add a post
                  </Button>
              </div>


           

              <DropdownButton
                variant="light"
                className="my-auto mr-4"
                menuAlign="right"
                title={loggedInUser.profileName}
              >
                <Dropdown.Item href={`/profile/${loggedInUser.id}`}>
                  <div>{loggedInUser.name}</div>
                  <div>
                    <small>View your profile information</small>
                  </div>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="#" >
                  Give feedback
                  </Dropdown.Item>
                <Dropdown.Item href="#" onClick={(e) => logout(e)}>
                  Logout
                  </Dropdown.Item>
              </DropdownButton>


            </Nav>

          </Navbar.Collapse>
        </Navbar>
      }
    </>
  );
    
});

export default NavBar
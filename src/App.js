import React, { useState } from 'react'
import Routes from './Routes'
import { Link, withRouter } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import { Nav, Navbar, NavItem } from 'react-bootstrap'
import './App.css'

import SdkService from './utils/sdkService'

function App(props) {
  window.sdk = new SdkService()
  const [isAuthenticated, userHasAuthenticated] = useState(false)

  async function handleLogout(event) {
    event.preventDefault()

    userHasAuthenticated(false)

    try {
      await window.sdk.signOut()
      props.history.push('/login')
    } catch (error) {
      console.log('error on logout', error)
    }
  }

  return (
    <div className='App container'>
      <Navbar fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to='/'>Home</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            { isAuthenticated
              ? <>
                  <LinkContainer to='/change-username'>
                     <NavItem>Change Attribute</NavItem>
                   </LinkContainer>

                  <LinkContainer to='/change-password'>
                     <NavItem>Change Password</NavItem>
                   </LinkContainer>

                  <NavItem onClick={handleLogout}>Logout</NavItem>
                </>
              : <>
                  <LinkContainer to='/signup-with-did'>
                    <NavItem>Sign Up with DID</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/signup'>
                    <NavItem>Sign Up</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/login'>
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                  <LinkContainer to='/passwordless-login'>
                    <NavItem>Passwordless Login</NavItem>
                  </LinkContainer>
                </>
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Routes appProps={{ isAuthenticated, userHasAuthenticated }} />
    </div>
  )
}

export default withRouter(App)

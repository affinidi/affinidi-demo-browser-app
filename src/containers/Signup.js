import React, {useEffect, useState} from 'react'
import {Link} from "react-router-dom";
import { Checkbox, Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

import './Signup.css'

export default function Signup(props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isUserNameFieldVisible, setIsUserNameFieldVisible] = useState(false)
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email')
    emailParam ? setUsername(emailParam) : setIsUserNameFieldVisible(true)
  }, [])

  function validateForm() {
    return username.length > 0 && password.length > 0 && confirmPassword.length > 0 && isCheckboxChecked
  }

  function toggleCheckbox() {
    isCheckboxChecked ? setIsCheckboxChecked(false) : setIsCheckboxChecked(true)
  }

  async function handleSignup(event) {
    event.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords don\'t match!')
      return
    }

    try {
      const token = await window.sdk.signUp(username, password)

      const isUsername = !username.startsWith('+') && username.indexOf('@') === -1

      if (isUsername) {
        props.userHasAuthenticated(true)

        props.history.push('/', { username })
      } else {
        props.history.push('/confirm-signup', { username, token })
      }

    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='Signup'>
      <form className='Form' onSubmit={handleSignup}>
        <h1 className='Title'>Create account</h1>
        <p className='Info'>
          Welcome to your personal wallet. Here you will be able to store, view and manage your digital identity.
          <br/><br/>
          In order to access your wallet you will need to set up a password first
        </p>
        { isUserNameFieldVisible &&
          <FormGroup controlId='username' bsSize='large'>
            <ControlLabel className='Label'>Username</ControlLabel>
            <FormControl
              autoFocus
              className='Input'
              type='username'
              value={username}
              onChange={ event => setUsername(event.target.value) }
            />
          </FormGroup>
        }
        <FormGroup controlId='password' bsSize='large'>
          <ControlLabel className='Label'>Password</ControlLabel>
          <FormControl
            className='Input'
            value={password}
            onChange={ event => setPassword(event.target.value) }
            type='password'
          />
        </FormGroup>
        <FormGroup controlId='confirmPassword' bsSize='large'>
          <ControlLabel className='Label'>Confirm Password</ControlLabel>
          <FormControl
            className='Input'
            value={confirmPassword}
            onChange={ event => setConfirmPassword(event.target.value) }
            type='password'
          />
        </FormGroup>
        <FormGroup controlId='checkbox' bsSize='large'>
          <Checkbox
            className='Signup-Checkbox'
            checked={isCheckboxChecked}
            onChange={() => toggleCheckbox()}
          >
            I accept the terms and conditions
          </Checkbox>
        </FormGroup>
        <Button className='Button' block bsSize='large' disabled={!validateForm()} type='submit'>
          Sign Up
        </Button>
        <p className='Link-Label'>
          Already have an account?
          <Link to='/login' className='Link'>Login</Link>
        </p>
      </form>
    </div>
  )
}

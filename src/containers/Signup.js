import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

import ExpandArea from "../components/ExpandArea";
import './Signup.css'

export default function Signup(props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlMessage, setHtmlMessage] = useState('')

  function validateForm() {
    return username.length > 0 && password.length > 0
  }

  async function handleSignup(event) {
    event.preventDefault()

    const messageParameters = { message, subject, htmlMessage }

    try {
      const token = await window.sdk.signUp(username, password, messageParameters)

      const isUsername = !username.startsWith('+') && username.indexOf('@') === -1

      if (isUsername) {
        props.userHasAuthenticated(true)

        props.history.push('/', { username })
      } else {
        props.history.push('/confirm-signup', { token })
      }

    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='Signup'>
      <form onSubmit={handleSignup}>
        <FormGroup controlId='username' bsSize='large'>
          <ControlLabel>Username</ControlLabel>
          <FormControl
            autoFocus
            type='username'
            value={username}
            onChange={ event => setUsername(event.target.value) }
          />
        </FormGroup>
        <FormGroup controlId='password' bsSize='large'>
          <ControlLabel>Password</ControlLabel>
          <FormControl
            value={password}
            onChange={ event => setPassword(event.target.value) }
            type='password'
          />
        </FormGroup>
        <ExpandArea
          message={message}
          subject={subject}
          htmlMessage={htmlMessage}
          setMessage={setMessage}
          setSubject={setSubject}
          setHtmlMessage={setHtmlMessage}
        />
        <Button block bsSize='large' disabled={!validateForm()} type='submit'>
          Sign Up
        </Button>
      </form>
    </div>
  )
}

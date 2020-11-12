import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

import ExpandArea from "../components/ExpandArea";
import './PasswordlessLogin.css'

export default function PasswordlessLogin(props) {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlMessage, setHtmlMessage] = useState('')

  function validateForm() {
    return username.length > 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const messageParameters = { message, subject, htmlMessage }

    try {
      const token = await window.sdk.passwordlessLogin(username, messageParameters)
      props.history.push('/complete-login', { token, username })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='PasswordlessLogin'>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId='username' bsSize='large'>
          <ControlLabel>Username</ControlLabel>
          <FormControl
            autoFocus
            type='text'
            value={username}
            onChange={ event => setUsername(event.target.value) }
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
          Login
        </Button>
      </form>
    </div>
  )
}

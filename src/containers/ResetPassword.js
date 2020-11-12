import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

import ExpandArea from "../components/ExpandArea";
import './ResetPassword.css'

export default function ResetPassword(props) {
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
      await window.sdk.forgotPassword(username, messageParameters)
      props.history.push('/confirm-reset-password', { username })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='ResetPassword'>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId='username' bsSize='large'>
          <ControlLabel>Email</ControlLabel>
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
          Reset
        </Button>
      </form>
    </div>
  )
}

import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

import './ChangeUsername.css'

export default function ChangeUsername(props) {
  const [username, setUsername] = useState('')
  const [confirmUsername, setConfirmUsername] = useState('')

  function validateForm() {
    return username.length > 0 && confirmUsername.length > 0 && username === confirmUsername
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      await window.sdk.changeUsername(username)
      props.history.push('/confirm-change-username', { username })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='ChangeUsername'>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId='username' bsSize='large'>
          <ControlLabel>New Attribute</ControlLabel>
          <FormControl
            autoFocus
            type='text'
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </FormGroup>
        <FormGroup controlId='confirmUsername' bsSize='large'>
          <ControlLabel>Confirm New Attribute</ControlLabel>
          <FormControl
            value={confirmUsername}
            onChange={ event => setConfirmUsername(event.target.value) }
            type='text'
          />
        </FormGroup>
        <Button block bsSize='large' disabled={!validateForm()} type='submit'>
          Update
        </Button>
      </form>
    </div>
  )
}

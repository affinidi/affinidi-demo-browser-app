import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import './CompleteLoginChallenge.css'

export default function CompleteLoginChallenge(props) {
  const [confirmationCode, setConfirmationCode] = useState('')

  function validateForm() {
    return confirmationCode.length > 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const { token } = props.location.state

      await window.sdk.completeLoginChallenge(token, confirmationCode)

      props.userHasAuthenticated(true)

      const { username } = props.location.state

      props.history.push('/', { username })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='CompleteLoginChallenge'>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId='username' bsSize='large'>
          <ControlLabel>Username</ControlLabel>
          <FormControl
            readOnly
            type='text'
            value={props.location.state.username}
          />
        </FormGroup>
        <FormGroup controlId='confirmationCode' bsSize='large'>
          <ControlLabel>Confirmation Code</ControlLabel>
          <FormControl
            autoFocus
            value={confirmationCode}
            onChange={ event => setConfirmationCode(event.target.value) }
            type='text'
          />
        </FormGroup>
        <Button block bsSize='large' disabled={!validateForm()} type='submit'>
          Login
        </Button>
      </form>
    </div>
  )
}

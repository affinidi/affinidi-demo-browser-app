import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import './ConfirmChangeUsername.css'

export default function ConfirmChangeUsername(props) {
  const [confirmationCode, setConfirmationCode] = useState('')

  function validateForm() {
    return confirmationCode.length > 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const { username } = props.location.state
      await window.sdk.confirmChangeUsername(username, confirmationCode)
      props.history.push('/login')
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='ConfirmChangeUsername'>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId='username' bsSize='large'>
          <ControlLabel>Email</ControlLabel>
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
          Reset
        </Button>
      </form>
    </div>
  )
}

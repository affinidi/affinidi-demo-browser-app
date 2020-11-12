import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import './ConfirmResetPassword.css'

export default function ConfirmResetPassword(props) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')

  function validateForm() {
    return password.length > 0 && confirmationCode.length > 0 &&
      confirmPassword.length > 0 && password === confirmPassword
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const { username } = props.location.state

      await window.sdk.forgotPasswordSubmit(username, confirmationCode, password)

      props.history.push('/login')
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='ConfirmResetPassword'>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId='username' bsSize='large'>
          <ControlLabel>Email</ControlLabel>
          <FormControl
            readOnly
            type='text'
            value={props.location.state.username}
          />
        </FormGroup>
        <FormGroup controlId='password' bsSize='large'>
          <ControlLabel>New Password</ControlLabel>
          <FormControl
            autoFocus
            value={password}
            onChange={ event => setPassword(event.target.value) }
            type='password'
          />
        </FormGroup>
        <FormGroup controlId='password' bsSize='large'>
          <ControlLabel>Confirm New Password</ControlLabel>
          <FormControl
            value={confirmPassword}
            onChange={ event => setConfirmPassword(event.target.value) }
            type='password'
          />
        </FormGroup>
        <FormGroup controlId='confirmationCode' bsSize='large'>
          <ControlLabel>Confirmation Code</ControlLabel>
          <FormControl
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

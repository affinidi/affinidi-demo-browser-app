import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

import './ChangePassword.css'

export default function ChangePassword(props) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  function validateForm() {
    return oldPassword.length > 0 && newPassword.length > 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      await window.sdk.changePassword(oldPassword, newPassword)
      props.history.push('/', {})
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='ChangePassword'>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId='oldPassword' bsSize='large'>
          <ControlLabel>Current Password</ControlLabel>
          <FormControl
            type='password'
            value={oldPassword}
            onChange={ event => setOldPassword(event.target.value) }
          />
        </FormGroup>
        <FormGroup controlId='newPassword' bsSize='large'>
          <ControlLabel>New Password</ControlLabel>
          <FormControl
            type='password'
            value={newPassword}
            onChange={ event => setNewPassword(event.target.value) }
          />
        </FormGroup>
        <Button block bsSize='large' disabled={!validateForm()} type='submit'>
          Update
        </Button>
      </form>
    </div>
  )
}

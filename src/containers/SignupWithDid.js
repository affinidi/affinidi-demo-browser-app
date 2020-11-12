import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'

import './SignupWithDid.css'

export default function SignupWithDid(props) {
  const [password, setPassword] = useState('')

  function validateForm() {
    return password.length > 0
  }

  async function handleSignupWithDid(event) {
    event.preventDefault()

    try {
      const { did, encryptedSeed } = await window.sdk.register(password)

      const keyParams = { encryptedSeed, password }
      const username  = did

      await window.sdk.signUpWithExistsEntity(keyParams, username, password)

      props.userHasAuthenticated(true)

      props.history.push('/', { username })
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='SignupWithDid'>
      <form onSubmit={handleSignupWithDid}>
        <FormGroup controlId='password' bsSize='large'>
          <ControlLabel>Password (6 digits PIN)</ControlLabel>
          <FormControl
            value={password}
            onChange={ event => setPassword(event.target.value) }
            type='password'
          />
        </FormGroup>
        <Button block bsSize='large' disabled={!validateForm()} type='submit'>
          Sign Up
        </Button>
      </form>
    </div>
  )
}

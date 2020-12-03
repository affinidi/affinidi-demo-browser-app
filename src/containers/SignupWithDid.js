import React, { useState } from 'react'
import {Link} from "react-router-dom";
import {Button, FormGroup, FormControl, ControlLabel, Checkbox} from 'react-bootstrap'

import './SignupWithDid.css'

export default function SignupWithDid(props) {
  const [password, setPassword] = useState('')
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false)

  function validateForm() {
    return password.length > 0
  }

  function toggleCheckbox() {
    isCheckboxChecked ? setIsCheckboxChecked(false) : setIsCheckboxChecked(true)
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
      <form className='Form' onSubmit={handleSignupWithDid}>
        <h1 className='Title'>Create account</h1>
        <p className='Info'>
          Welcome to your personal wallet. Here you will be able to store, view and manage your digital identity.
          <br/><br/>
          You received a new credential, in order to view this credential please fill in the password that was send along with the invite.
        </p>
        <FormGroup controlId='password' bsSize='large'>
          <ControlLabel className='Label'>Password (6 digits PIN)</ControlLabel>
          <FormControl
            className='Input'
            value={password}
            onChange={ event => setPassword(event.target.value) }
            type='password'
          />
        </FormGroup>
        <FormGroup controlId='checkbox' bsSize='large'>
          <Checkbox
            className='SignupWithDid-Checkbox'
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

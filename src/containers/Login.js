import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import './Login.css'

export default function Login(props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function validateForm() {
    return username.length > 0 && password.length > 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    let networkMember
    try {
      networkMember = await window.sdk.fromLoginAndPassword(username, password)
      props.userHasAuthenticated(true)
      props.history.push('/', { username })
    } catch (error) {
      alert(error)
    }

    try {
      const did = networkMember.did
      console.log({ did })

      const objToCrypt = { name: 'Hola, amigos' }
      console.log('before encrypt')

      const encryptedMessage = await networkMember.createEncryptedMessage(did, objToCrypt)
      console.log({ encryptedMessage })

      const decryptedMessage = await networkMember.readEncryptedMessage(encryptedMessage)
      console.log({ decryptedMessage })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className='Login'>
      <form onSubmit={handleSubmit}>
        <FormGroup controlId='username' bsSize='large'>
          <ControlLabel>Username</ControlLabel>
          <FormControl
            autoFocus
            type='text'
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </FormGroup>
        <FormGroup controlId='password' bsSize='large'>
          <ControlLabel>Password</ControlLabel>
          <FormControl
            type='password'
            value={password}
            onChange={ event => setPassword(event.target.value) }
          />
        </FormGroup>
        <Button block bsSize='large' disabled={!validateForm()} type='submit'>
          Login
        </Button>
        <Link to='/reset-password'>Reset Password</Link>
      </form>
    </div>
  )
}

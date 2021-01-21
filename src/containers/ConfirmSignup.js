import React, { useState } from 'react'
import { Button, FormGroup, FormControl, ControlLabel } from 'react-bootstrap'
import Loader from 'react-loader-spinner'

import ExpandArea from "../components/ExpandArea";
import './ConfirmSignup.css'

export default function ConfirmSignup(props) {
  const { token, username } = props.location.state
  const [confirmationCode, setConfirmationCode] = useState('')
  const [didMethod, setDidMethod]               = useState('elem')
  
  const [progress, setProgress] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlMessage, setHtmlMessage] = useState('')

  function validateForm() {
    return confirmationCode.length > 0
  }

  async function handleConfirmSignup(event) {
    event.preventDefault()
    setProgress(true)
    setDisabled(true)

    try {
      await window.sdk.confirmSignUp(token, confirmationCode, { didMethod })
      props.userHasAuthenticated(true)
      props.history.push('/', { username })
    } catch (error) {
      setProgress(false)
      setDisabled(false)

      alert(error.message)
    }
  }

  async function handleResetConfirmationCode(event) {
    event.preventDefault()

    const messageParameters = { message, subject, htmlMessage };

    try {
      await window.sdk.resendSignUpConfirmationCode(username, messageParameters)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className='ConfirmSignup'>
      <form onSubmit={ handleConfirmSignup }>
        <FormGroup controlId='username' bsSize='large'>
          <ControlLabel>Username</ControlLabel>
          <FormControl
            readOnly
            type='text'
            value={username}
          />
        </FormGroup>
        <FormGroup controlId='confirmationCode' bsSize='large'>
          <ControlLabel>Confirmation Code</ControlLabel>
          <FormControl
            autoFocus
            disabled={ disabled }
            value={ confirmationCode }
            onChange={ event => setConfirmationCode(event.target.value) }
            type='text'
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

        <FormGroup controlId='didMethod'  bsSize='large'>
          <ControlLabel>DID method</ControlLabel>
          <FormControl
            componentClass='select'
            placeholder='select'
            disabled={ disabled }
            onChange={ event => setDidMethod(event.target.value) }
          >            
            <option value='elem'>elem</option>
            <option value='jolo'>jolo</option>
          </FormControl>
        </FormGroup>

        { !progress &&
          <div>
            <Button block bsSize='large' disabled={!validateForm()} type='submit'>
              Sign Up
            </Button>

            <Button block bsSize='large' onClick={ event => handleResetConfirmationCode(event) }>
              Reset Confirmation Code
            </Button>
          </div>
        }

        { progress &&
          <div className='LoaderContainer'>
            <Loader type='ThreeDots' color='#2BAD60' height={100} width={100} />
          </div>
        }
      </form>
    </div>
  )
}

import React, {useEffect, useState} from "react";
import {Alert, Button, ControlLabel, FormControl, FormGroup, Modal} from "react-bootstrap";
import {useTokenModal} from "./TokenModal";

import './CredentialShareModal.css'

function parseInfoFromToken(token) {
    try {
        const { payload } = window.sdk.parseToken(token)

        return (payload.interactionToken || {}).callbackURL || undefined
    } catch(err) {
        return undefined
    }
}

async function sendVPToCallback(callbackURL, vp) {
    const response = await fetch(callbackURL, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vp })
    })

    if (response.status < 200 || response.status > 299) {
        throw new Error(`${callbackURL} responded with ${response.statusText}`)
    }

    if (response.status === 204) {
        return undefined
    }

    return await response.json()
}

export const CredentialShareModal = ({ credentials, credentialShareRequestToken, onClose }) => {
    const [requesterDid, setRequesterDid] = useState('')
    const [isInputVisible, setIsInputVisible] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [alert, setAlert] = useState(null)
    const [requestToken, setRequestToken] = useState('')

    const { open: openTokenModal } = useTokenModal()

    useEffect(() => {
        if (credentialShareRequestToken) {
            setRequestToken(credentialShareRequestToken)
            setIsInputVisible(false)
        }

    }, [credentialShareRequestToken])

    async function share() {
        if (isLoading) return

        await setIsLoading(true)

        if (!requestToken) {
            if (!requesterDid) {
                setAlert({ message: 'Please enter requester did', bsStyle: 'danger' })
                setIsLoading(false)

                return
            }

            const credentialRequirements = credentials.map(cred => {
                return { type: cred.type }
            })

            try {
                const requestToken = await window.sdk.createCredentialShareRequestTokenFromRequesterDid(credentialRequirements, requesterDid)
                setRequestToken(requestToken)
            } catch (error) {
                setAlert({ message: `There was an error while creating share request token. Error: ${error.message}`, bsStyle: 'danger' })
                setIsLoading(false)

                return
            }
        }

        let credentialShareResponseToken
        try {
            setAlert({ message: 'Creating VP.', bsStyle: 'warning' })

            credentialShareResponseToken = await window.sdk.createCredentialShareResponseToken(credentials, requestToken)
        } catch (error) {
            setAlert({ message: `Could not create VP. Error: ${error.message}`, bsStyle: 'danger' })
            await setIsLoading(false)

            return
        }

        const callbackURL = parseInfoFromToken(requestToken)
        if (!callbackURL) {
            setAlert({ message: 'There was an error while parsing info from token.', bsStyle: 'danger' })
            await setIsLoading(false)

            return
        }

        let callbackResponse
        try {
            setAlert({ message: 'Sending VP to callbackURL.', bsStyle: 'warning' })

            callbackResponse = await sendVPToCallback(callbackURL, credentialShareResponseToken)

            setAlert({ message: 'Sent VP to callbackURL successfully.', bsStyle: 'success' })
        } catch (error) {
            setAlert({ message: `There was an error sending VP to callbackURL. Error: ${error.message}`, bsStyle: 'danger' })
            await setIsLoading(false)

            return
        }

        if (callbackResponse && callbackResponse.requestToken) {
            const { requestToken } = callbackResponse

            if (openTokenModal(requestToken)) {
                await setIsLoading(false)

                onClose()
            }
        }

        await setIsLoading(false)
    }

    return (
        <Modal
          className='ShareModal'
            show={credentials.length > 0}
            onHide={onClose}
        >
            <Modal.Body className='Body'>
                <h1 className='Title'>Share credential</h1>
                <p className='Info'>You can easily share this credential with anyone you like.</p>
                { isInputVisible &&
                    <FormGroup controlId='requesterDid' bsSize='large'>
                        <ControlLabel className='SubTitle'>Requester Did</ControlLabel>
                        <FormControl
                          autoFocus
                          className='Input'
                          readOnly={isLoading}
                          type='text'
                          value={requesterDid}
                          onChange={event => setRequesterDid(event.target.value)}
                        />
                    </FormGroup>
                }
                <p className='SubTitle'>Sharing options</p>
                <div className='Radios'>
                    <label className='RadioLabel'>
                        <input className='Radio' type="radio" id="email" name="share" disabled/>
                        Share via email
                    </label>
                    <label className='RadioLabel'>
                        <input className='Radio' type="radio" id="whatsApp" name="share" disabled/>
                        Share via WhatsApp
                    </label>
                    <label className='RadioLabel'>
                        <input className='Radio' type="radio" id="link" name="share" disabled/>
                        Share by link
                    </label>
                </div>
                <FormGroup>
                    <Button className='Button' disabled={isLoading} onClick={() => share()}>
                        Share credential
                    </Button>
                </FormGroup>
                { alert &&
                    <FormGroup>
                        <Alert className='Alert' bsStyle={alert.bsStyle} children={alert.message} />
                    </FormGroup>
                }
            </Modal.Body>
        </Modal>
    )
}

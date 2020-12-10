import React, {useEffect, useState} from "react";
import {Alert, Table, Button, ControlLabel, FormControl, Checkbox, FormGroup, Modal} from "react-bootstrap";
import {useAsync, useAsyncFn} from "react-use";
import {useTokenModal} from "./TokenModal";

function parseInfoFromToken(token) {
    try {
        const { payload } = window.sdk.parseToken(token)
        const callbackURL = (payload.interactionToken || {}).callbackURL || undefined
        const requesterDid = payload.iss

        return { requesterDid, callbackURL }
    } catch(err) {
        return {}
    }
}

async function getCredentials(credentialShareRequestToken) {
    const credentials = await window.sdk.getCredentials(credentialShareRequestToken)

    if (!Array.isArray(credentials) || credentials.length < 1) {
        throw new Error('No credential found for this request!')
    }

    return credentials
}

async function createCredentialShareResponseToken(credentialShareRequestToken, credentials, requesterDid, shouldSendMessage) {
    const credentialShareResponseToken = await window.sdk.createCredentialShareResponseToken(credentialShareRequestToken, credentials)
    const verifiablePresentation = await window.sdk.createPresentationFromChallenge(credentialShareRequestToken, credentials, 'domain')

    if (shouldSendMessage && requesterDid) {
        await window.messageService.send(requesterDid, { token: credentialShareResponseToken })
    }

    return { credentialShareResponseToken, verifiablePresentation }
}

async function sendVPToCallback(callbackURL, { verifiablePresentation }) {
    const response = await fetch(callbackURL, {
        method: 'POST',
        // mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vp: verifiablePresentation })
    })

    if (response.status < 200 || response.status > 299) {
        throw new Error(`${callbackURL} responded with ${response.statusText}`)
    }

    if (response.status === 204) {
        return undefined
    }

    return response.json()
}

export const CredentialShareModal = ({ credentialShareRequestToken, onClose }) => {
    const { open: openTokenModal } = useTokenModal()
    const { requesterDid, callbackURL } = parseInfoFromToken(credentialShareRequestToken)

    const [shouldSendMessage, setShouldSendMessage] = useState(true);

    const { loading: credentialsLoading, value: credentials, error: credentialsError } = useAsync(
        () => getCredentials(credentialShareRequestToken),
        [credentialShareRequestToken]
    )
    const [
        { loading: createVPLoading, value: presentation, error: createVPError },
        onCreateVP
    ] = useAsyncFn(
        () => createCredentialShareResponseToken(credentialShareRequestToken, credentials, requesterDid, shouldSendMessage),
        [credentialShareRequestToken, credentials, requesterDid, shouldSendMessage]
    );

    const [{ loading: callbackLoading, value: callbackResponse, error: callbackError }, sendVP] = useAsyncFn(
        () => sendVPToCallback(callbackURL, presentation),
        [callbackURL, presentation]
    )

    useEffect(() => {
        if (callbackURL && presentation) {
            sendVP()
        }
    }, [callbackURL, presentation, sendVP])

    const shareButtonDisabled = credentialsLoading || !!credentialsError || credentials.length < 1 || createVPLoading || callbackLoading || !!presentation
    const alert = getAlert(callbackURL, callbackLoading, callbackResponse, callbackError, credentialsError, createVPError)

    useEffect(() => {
        if (callbackResponse && callbackResponse.requestToken) {
            const { requestToken } = callbackResponse

            openTokenModal(requestToken)
        }
    }, [callbackResponse, openTokenModal, onClose])

    return (
        <Modal
            show={credentialShareRequestToken !== undefined}
            onHide={onClose}
        >
            <Modal.Header closeButton>
                <Modal.Title>Share Credentials</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormGroup controlId='credentialShareRequestToken' bsSize='large'>
                    <ControlLabel>Credential Share Request Token</ControlLabel>
                    <FormControl
                        readOnly
                        type='text'
                        value={credentialShareRequestToken}
                    />
                </FormGroup>
                <FormGroup controlId='requesterDid' bsSize='large'>
                    <ControlLabel>Requester Did</ControlLabel>
                    <FormControl
                        readOnly
                        type='text'
                        value={requesterDid || '-'}
                    />
                </FormGroup>
                <FormGroup controlId='credentials' bsSize='large'>
                    <ControlLabel>Credentials</ControlLabel>
                    <Table striped bordered hover size='sm'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>id</th>
                                <th>type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(credentials || []).map((credential, idx) => (
                              <tr key={credential.id}>
                                  <td>{idx + 1}</td>
                                  <td>{credential.id}</td>
                                  <td>{JSON.stringify(credential.type)}</td>
                              </tr>
                            ))}
                        </tbody>
                    </Table>
                </FormGroup>
                <FormGroup>
                    <Button bsSize='large' disabled={shareButtonDisabled} onClick={onCreateVP}>
                        Accept
                    </Button>
                    <Checkbox
                        inline
                        disabled={shareButtonDisabled}
                        checked={shouldSendMessage}
                        onClick={() => setShouldSendMessage(!shouldSendMessage)}
                        style={{ marginLeft: 10 }}
                    >Send token to verifier</Checkbox>
                </FormGroup>
                <FormGroup controlId='presentation' bsSize='large'>
                    <ControlLabel>Credential Share Response Token</ControlLabel>
                    <FormControl
                        readOnly
                        type='text'
                        value={createVPLoading ? '-' : presentation && presentation.credentialShareResponseToken || ''}
                    />
                </FormGroup>
                {alert &&
                    <FormGroup>
                        <Alert bsStyle={alert.bsStyle} children={alert.message} />
                    </FormGroup>
                }
            </Modal.Body>
        </Modal>
    )
}

function getAlert(callbackURL, callbackLoading, callbackResponse, callbackError, credentialsError, createVPError) {
    if (callbackURL && (callbackLoading || callbackResponse || callbackError)) {
        if (callbackLoading) {
            return { message: 'Sending VP to callbackURL.', bsStyle: 'warning' }
        }

        if (callbackResponse) {
            return { message: 'Sent VP to callbackURL successfully.', bsStyle: 'success' }
        }

        if (callbackError) {
            return { message: `There was an error sending VP to callbackURL. Error: ${callbackError.message}`, bsStyle: 'danger' }
        }
    }

    if (credentialsError) {
        return { message: `Could not list credentials. Error: ${credentialsError.message}`, bsStyle: 'danger' }
    }

    if (createVPError) {
        return { message: `Could not create VP. Error: ${createVPError.message}`, bsStyle: 'danger' }
    }

    return undefined
}

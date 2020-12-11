import React, {useEffect} from "react";
import { Alert, Button, ControlLabel, FormControl, FormGroup, Modal, Table } from "react-bootstrap";
import { useAsyncFn } from "react-use";

function parseInfoFromToken(token) {
    try {
        const { payload } = window.sdk.parseToken(token)
        const callbackURL = (payload.interactionToken || {}).callbackURL || undefined
        const offeredCredentials = (payload.interactionToken || {}).offeredCredentials || undefined
        const issuerDid = payload.iss
        const typ = payload.typ

        return { issuerDid, offeredCredentials, callbackURL, typ }
    } catch(err) {
        return {}
    }
}

async function acceptOfferRequest(callbackURL, offerRequestToken) {
    const credentialOfferResponseToken = await window.sdk.createCredentialOfferResponseToken(offerRequestToken);
    const { credentials } = await sendResponseTokenToCallback(callbackURL, credentialOfferResponseToken)

    await window.sdk.saveCredentials(credentials)
    window.setTimeout(() => window.location.reload(), 3000)
    return credentials
}

async function sendResponseTokenToCallback(callbackURL, responseToken) {
    const response = await fetch(callbackURL, {
        method: 'POST',
        // mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ responseToken })
    })

    if (response.status < 200 || response.status > 299) {
        throw new Error(`${callbackURL} responded with ${response.statusText}`)
    }

    return response.json()
}

export const CreateOfferRequestModal = ({ offerRequestToken, onClose }) => {
    const { issuerDid, offeredCredentials, callbackURL, typ } = parseInfoFromToken(offerRequestToken)

    useEffect(() => {
        if (typ !== 'credentialOfferRequest' || !callbackURL) {
            onClose()
        }
    }, [typ, callbackURL, onClose])

    const [{ loading: acceptLoading, value: acceptResponse, error: acceptError }, onAccept] = useAsyncFn(
        async () => acceptOfferRequest(callbackURL, offerRequestToken),
        [callbackURL, offerRequestToken]
    );

    const acceptButtonDisabled = acceptLoading || !!acceptResponse
    const alert = getAlert(callbackURL, acceptLoading, acceptResponse, acceptError)

    return (
        <Modal
            show={offerRequestToken !== undefined}
            onHide={onClose}
        >
            <Modal.Header closeButton>
                <Modal.Title>Credential Offer Request</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormGroup controlId='offerRequestToken' bsSize='large'>
                    <ControlLabel>Offer Request Token</ControlLabel>
                    <FormControl
                        type='text'
                        readOnly
                        value={offerRequestToken}
                    />
                </FormGroup>
                <FormGroup controlId='issuerDid' bsSize='large'>
                    <ControlLabel>Issuer Did</ControlLabel>
                    <FormControl
                        type='text'
                        readOnly
                        value={issuerDid || '-'}
                    />
                </FormGroup>
                <FormGroup controlId='offeredCredentials' bsSize='large'>
                    <ControlLabel>Offered Credentials</ControlLabel>
                    <Table striped bordered hover size='sm'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>type</th>
                        </tr>
                        </thead>
                        <tbody>
                        {(offeredCredentials || []).map((credential, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{JSON.stringify(credential.type)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </FormGroup>
                <FormGroup>
                    <Button bsSize='large' disabled={acceptButtonDisabled} onClick={onAccept}>
                        Accept
                    </Button>
                </FormGroup>
                { alert &&
                    <FormGroup>
                        <Alert bsStyle={alert.bsStyle} children={alert.message} />
                    </FormGroup>
                }
            </Modal.Body>
        </Modal>
    )
}

function getAlert(callbackURL, acceptLoading, acceptResponse, acceptError) {
    if (callbackURL && (acceptLoading || acceptResponse || acceptError)) {
        if (acceptLoading) {
            return { message: 'Accepting credentials.', bsStyle: 'warning' }
        }

        if (acceptResponse) {
            return { message: 'Accepted credentials.', bsStyle: 'success' }
        }

        if (acceptError) {
            return { message: `There was an error accepting credentials. Error: ${acceptError.message}`, bsStyle: 'danger' }
        }
    }

    return undefined
}

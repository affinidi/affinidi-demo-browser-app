import React, {useEffect, useState} from "react";
import {Button, ControlLabel, FormControl, FormGroup, Modal} from "react-bootstrap";
import {useAsyncFn} from "react-use";

async function createCredentialShareResponseToken(credential, requesterDid) {
    const credentialRequirements = [{ type: credential.type }]
    const credentialShareRequestToken = await window.sdk.createCredentialShareRequestTokenFromRequesterDid(credentialRequirements, requesterDid)

    return window.sdk.createCredentialShareResponseToken(credentialShareRequestToken, [credential]);
}

export const CreateVerifiablePresentationModal = ({ credential, onClose }) => {
    const [requesterDid, setRequesterDid] = useState('')

    const [{ loading, value: credentialShareResponseToken, error }, onCreateVP] = useAsyncFn(
        async () => createCredentialShareResponseToken(credential, requesterDid),
        [credential, requesterDid]
    );

    useEffect(() => {
        if (!loading && error !== undefined) {
            alert(error.message)
        }
    }, [loading, error])

    return (
        <Modal
            show={credential !== undefined}
            onHide={onClose}
        >
            <Modal.Header closeButton>
                <Modal.Title>Create Verifiable Presentation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormGroup controlId='requesterDid' bsSize='large'>
                    <ControlLabel>Requester Did</ControlLabel>
                    <FormControl
                        autoFocus
                        type='text'
                        value={requesterDid}
                        onChange={ event => setRequesterDid(event.target.value) }
                    />
                </FormGroup>
                <FormGroup>
                    <Button bsSize='large' onClick={onCreateVP} disabled={loading}>
                        Create
                    </Button>
                </FormGroup>
                <FormGroup controlId='shareResponseToken' bsSize='large'>
                    <ControlLabel>Share Response Token</ControlLabel>
                    <FormControl
                        readOnly
                        type='text'
                        value={loading ? '-' : credentialShareResponseToken || ''}
                    />
                </FormGroup>
            </Modal.Body>
        </Modal>
    )
}

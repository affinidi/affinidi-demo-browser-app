import React, {useEffect, useState} from "react";
import {Button, ControlLabel, FormControl, FormGroup, Modal} from "react-bootstrap";
import {useAsyncFn} from "react-use";

import './CreateVerifiablePresentationModal.css'

async function createCredentialShareResponseToken(credential, requesterDid) {
    const credentialRequirements = [{ type: credential.type }]
    const credentialShareRequestToken = await window.sdk.createCredentialShareRequestTokenFromRequesterDid(credentialRequirements, requesterDid)

    return window.sdk.createCredentialShareResponseToken(credentialShareRequestToken, [credential]);
}

export const CreateVerifiablePresentationModal = ({ credential, onClose }) => {
    const [requesterDid, setRequesterDid] = useState('')
    const [sharableLink, setSharableLink] = useState('')
    const [selectedOption, setOption] = useState('');
    const [isLinkLoading,setLinkLoading]=useState(false)



    const [{ loading, value: credentialShareResponseToken, error }, onCreateVP] = useAsyncFn(
        async () => createCredentialShareResponseToken(credential, requesterDid),
        [credential, requesterDid]
    );
    

    useEffect(() => {
        if (!loading && error !== undefined) {
            alert(error.message)
        }
    }, [loading, error])

    const ShareCredentialByLink = async () => {
        setLinkLoading(true);
        const link = await window.sdk.getSharableCredentialLink(credential.id)
        setSharableLink(link)
        setLinkLoading(false);

    }
    const handleClickOnShareCredential = (event) => {
        event.preventDefault();
        if (selectedOption === 'link') {
            ShareCredentialByLink();
        }
        if (requesterDid !== '')
            onCreateVP()
   }
    const handleOptionChange = (event) => {
        setOption(event.target.value);
    }

    return (
        <Modal
            className='ShareModal'
            show={credential !== undefined}
            onHide={onClose}
        >
            <Modal.Body className='Body'>
                <h1 className='Title'>Share credential</h1>
                <p className='Info'>You can easily share this credential with anyone you like.</p>
                <FormGroup controlId='requesterDid' bsSize='large'>
                    <ControlLabel className='SubTitle'>Requester Did</ControlLabel>
                    <FormControl
                        autoFocus
                        className='Input'
                        type='text'
                        value={requesterDid}
                        onChange={ event => setRequesterDid(event.target.value) }
                    />
                </FormGroup>
                <p className='SubTitle'>Sharing options</p>
                <div className='Radios' onChange={handleOptionChange}>
                    <label className='RadioLabel'>
                        <input className='Radio' type="radio" id="email" name="share" disabled/>
                        Share via email
                    </label>
                    <label className='RadioLabel'>
                        <input className='Radio' type="radio" id="whatsApp" name="share" disabled/>
                        Share via WhatsApp
                    </label>
                    <label className='RadioLabel'>
                        <input className='Radio' type="radio" id="link" name="share" value="link" />
                        Share by link
                    </label>
                </div>
                <FormGroup>
                    <Button className='Button' bsSize='large' onClick={handleClickOnShareCredential} disabled={loading || isLinkLoading}>
                        Share credential
                    </Button>
                </FormGroup>
                {sharableLink === '' ? null : <a  style={{marginTop:"10px", color:'blue',overflowWrap:"break-word"}} href={sharableLink} target='_blank'>{sharableLink}</a>}
                <FormGroup className='Response' controlId='shareResponseToken' bsSize='large'>
                    <ControlLabel className='SubTitle'>Share Response Token</ControlLabel>
                    <FormControl
                        readOnly
                        className='Input'
                        type='text'
                        value={loading ? '-' : credentialShareResponseToken || ''}
                    />
                </FormGroup>
            </Modal.Body>
        </Modal>
    )
}

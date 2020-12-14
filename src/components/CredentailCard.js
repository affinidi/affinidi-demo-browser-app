import React from "react";

import './CredentialCard.css'

export default function CredentialCard(props) {
    const credential = props.credential
    const credentialType = credential.type.join(', ')
    const issuanceDate = new Date(credential.issuanceDate).toLocaleString('en-GB', { timeZone: 'UTC' })

    let expirationDate
    if (credential.expirationDate) expirationDate = new Date(credential.expirationDate).toLocaleString('en-GB', { timeZone: 'UTC' })

    function backgroundColor() {
        switch (true) {
            case credentialType.includes('Health'):
                return 'Green'
            case credentialType.includes('Name'):
                return 'Blue'
            case credentialType.includes('Email'):
                return 'Pink'
            case credentialType.includes('Phone'):
                return 'Yellow'
            default:
                return 'Default'
        }
    }

    return (
        <div
            className={`
                Card
                ${backgroundColor()}
            `}
        >
            <div className='Header'>
                <p className='Type'>{ credentialType }</p>
                <p className='ID'>{ credential.id }</p>
            </div>
            <div className='Values'>
                {
                    Object.entries(credential.credentialSubject.data).map(([key, value]) => {
                        if (Array.isArray(value) && key === '@type') {
                            return <p className='Value' key={key}>{key}: {value.join(', ')}</p>
                        }

                        if (typeof value === 'object') {
                            return <textarea className={`${backgroundColor()}`} key={key} readOnly name='credentials' rows='8' value={JSON.stringify(value, undefined, '\t')}/>
                        }

                        return <p className='Value' key={key}>{key}: {value}</p>
                    })
                }
            </div>
            <div className='Footer'>
                <p className='IssuanceDate'>Created: { issuanceDate }</p>
                { expirationDate &&
                    <p className='ExpirationDate'>Expire: { expirationDate }</p>
                }
                <div className='Issuer-Holder'>
                    <div className='Issuer-Container'>
                        <p className='Issuer'>Issuer:</p>
                        <p className='Issuer'>{ credential.issuer }</p>
                    </div>
                    <div className='Holder-Container'>
                        <p className='Holder'>Holder:</p>
                        <p className='Holder'>{ credential.holder.id }</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

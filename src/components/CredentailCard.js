import React from "react";

import './CredentialCard.css'

export default function CredentialCard(props) {
    const credential = props.credential

    return (
        <div className='Card'>
            <div className='Header'>
                <p className='Type'>{ credential.type.join(', ') }</p>
                <p className='ID'>{ credential.id }</p>
            </div>
            <div className='Values'>
                {
                    Object.entries(credential.credentialSubject.data).map(([key, value]) => {
                        if (Array.isArray(value) && key === '@type') {
                            return <p className='Value' key={key}>{key}: {value.join(', ')}</p>
                        }

                        if (typeof value === 'object') {
                            return <textarea key={key} readOnly name='credentials' rows='8' value={JSON.stringify(value, undefined, '\t')}/>
                        }

                        return <p className='Value' key={key}>{key}: {value}</p>
                    })
                }
            </div>
            <div className='Footer'>
                <p className='IssuanceDate'>Created: { credential.issuanceDate }</p>
                { credential.expirationDate &&
                    <p className='ExpirationDate'>Expire: { credential.expirationDate }</p>
                }
                <div className='Issuer-Holder'>
                    <p className='Issuer'>Issuer: { credential.issuer }</p>
                    <p className='Holder'>Holder: { credential.holder.id }</p>
                </div>
            </div>
        </div>
    )
}

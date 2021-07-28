import React, {useEffect, useState} from "react";

import './CredentialCard.css'

export default function CredentialCard(props) {
    const [backgroundColor, setBackgroundColor] = useState('')

    const credential = props.credential
    const credentialType = credential.type.join(', ')
    const issuanceDate = new Date(credential.issuanceDate).toLocaleString('en-GB', { timeZone: 'UTC' })

    let expirationDate
    if (credential.expirationDate) expirationDate = new Date(credential.expirationDate).toLocaleString('en-GB', { timeZone: 'UTC' })

    useEffect(() => {
        const script = document.createElement('script');

        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/seedrandom/2.3.10/seedrandom.min.js';

        document.body.appendChild(script);

        setTimeout(() => {
            setBackgroundColor(color())
        }, 200)

        return () => {
            document.body.removeChild(script);
        }
    }, [])

    function color() {
        Math.seedrandom(credentialType)
        const rand = (Math.random() * 10).toFixed(0)

        switch (rand) {
            case '1':
                return 'Green'
            case '2':
                return 'Blue'
            case '3':
                return 'Mint'
            case '4':
                return 'Orange'
            case '5':
                return 'Burgundy'
            case '6':
                return 'Brown'
            case '7':
                return 'Gray'
            case '8':
                return 'Gold'
            case '9':
                return 'Gray'
            default:
                return 'Default'
        }
    }

    return (
        <div
            className={`
                Card
                ${backgroundColor}
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
                            return (
                                <div className='TextareaContainer' key={key}>
                                    <p className='Value'>{key}</p>
                                    <textarea className={`Textarea ${backgroundColor}`} key={key} readOnly name='credentials' rows='8' value={JSON.stringify(value, undefined, '\t')}/>
                                </div>
                            )
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

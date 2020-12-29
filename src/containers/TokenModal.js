import React, { useContext, useEffect, useState} from "react";
import {CreateOfferRequestModal} from "./CredentialOfferRequestModal";
import {CredentialShareModal} from "./CredentialShareModal";

function parseTokenTyp(token) {
    try {
        const { payload } = window.sdk.parseToken(token)

        return payload.typ
    } catch(err) {
        return undefined
    }
}

const TokenModalContext = React.createContext({ tokenAndTyp: undefined, setTokenAndTyp(){ } })

export const useTokenModal = () => {
    const { setTokenAndTyp } = useContext(TokenModalContext)

    function open(token) {
        const typ = parseTokenTyp(token)

        if (['credentialOfferRequest', 'credentialRequest'].includes(typ)) {
            setTokenAndTyp([token, typ])

            return true
        }

        console.error('unknown token of type:', typ, 'token:', token)
        return false
    }

    function close() {
        setTokenAndTyp(undefined)
    }

    return { open, close }
}

function getModal(token, typ, close) {
    switch (typ) {
        case 'credentialOfferRequest':
            return <CreateOfferRequestModal offerRequestToken={token} onClose={close} />
        case 'credentialRequest':
            return <CredentialShareModal credentialShareRequestToken={token} onClose={close} />
        default:
    }
}

export const TokenModalProvider = ({ children }) => {
    const [tokenAndTyp, setTokenAndTyp] = useState()

    // TODO: when closing we need to check if the closing modal is still shown
    // e.g. share modal is open, state changes to offer modal, share modal closes. this should not call below function.
    function close() {
        setTokenAndTyp(undefined)
    }

    return (
        <TokenModalContext.Provider value={{ tokenAndTyp, setTokenAndTyp}}>
            { children }
            { tokenAndTyp && getModal(...tokenAndTyp, close)}
        </TokenModalContext.Provider>
    )
}

export const ModalOpener = ({ token }) => {
    const { open } = useTokenModal()
    const [openError, setOpenError] = useState(false)

    useEffect(() => {
        if (token) {
            const couldOpen = open(token)
            setOpenError(!couldOpen)
        }
    }, [token, open])

    useEffect(() => {
        if (openError) {
            alert('could not open modal for token: ' + token)
            setOpenError(false)
        }
    }, [token, openError])

    return null
}

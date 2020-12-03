import React, {useContext, useState} from "react";
import {CreateOfferRequestModal} from "./CredentialOfferRequestModal";

function parseTokenTyp(token) {
    const { payload } = window.sdk.parseToken(token)

    return payload.typ
}

const TokenModalContext = React.createContext({ tokenAndTyp: undefined, setTokenAndTyp(){ } })

export const useTokenModal = () => {
    const { setTokenAndTyp } = useContext(TokenModalContext)

    function open(token) {
        const typ = parseTokenTyp(token)

        if (typ === 'credentialOfferRequest') {
            setTokenAndTyp([token, 'credentialOfferRequest'])

            return true
        }

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
        default:
    }
}

export const TokenModalProvider = ({ children }) => {
    const [tokenAndTyp, setTokenAndTyp] = useState()

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

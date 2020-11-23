import {useCreateOfferRequestModal} from "../containers/CredentialOfferRequestModal";

function parseTokenTyp(token) {
    const { payload } = window.sdk.parseToken(token)

    return payload.typ
}

export const useTokenModal = () => {
    const { open: openCreateOfferRequestModal } = useCreateOfferRequestModal()

    function open(token) {
        const typ = parseTokenTyp(token)

        if (typ === 'credentialOfferRequest') {
            openCreateOfferRequestModal(token)

            return true
        }

        return false
    }

    return { open }
}

import React, {useEffect} from "react";
import {useTokenModal} from "./TokenModal";

const INTERVAL_MS = 5 * 1000;

const handleError = (func) => async () => {
    try {
        await func()
    } catch(err) {
        console.error(err)
    }
}

const getLatestMessage = (messages) => {
    return messages.sort(({ createdAt: a }, { createdAt: b }) => new Date(b).getTime() - new Date(a).getTime())[0]
}

const MessageListener = () => {
    const { open } = useTokenModal()

    useEffect(() => {
        const handle = window.setInterval(handleError(async () => {
            const messageService = window.messageService
            if (!messageService) { return }

            const messages = await messageService.getAll()
            if (messages.length <= 0) { return }
            const { id, message } = getLatestMessage(messages)

            if(open(message.token)) {
                await messageService.delete(id)
            }
        }), INTERVAL_MS)

        return () => {
            window.clearInterval(handle)
        }
    }, [open])

    return null
}

export default MessageListener;

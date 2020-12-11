import JwtService from "@affinidi/common/dist/services/JwtService";
import React, { useEffect, useState } from "react";
import { format } from "timeago.js";
import { Alert } from "react-bootstrap";
import {useTokenModal} from "./TokenModal";

const KNOWN_TOKEN_TYPS = ["credentialOfferRequest", "credentialRequest"];
const INTERVAL_MS = 10 * 1000;

const handleError = (func) => async () => {
    try {
        await func();
    } catch (err) {
        console.error(err);
    }
};

function parseTokenTyp(token) {
    try {
        const { payload } = JwtService.fromJWT(token);

        return payload.typ;
    } catch (err) {
        return undefined;
    }
}

const MessageList = ({ messageList, onClick, onClose }) => {
    return (
        <div
            style={{
                position: "absolute",
                top: 100,
                right: 200,
                zIndex: 999,
            }}
        >
            {messageList.map((msg) => (
                <Alert key={msg.id} onDismiss={() => onClose(msg)}>
                    <h4>Message ({format(msg.createdAt, "en_US")})</h4>
                    <a
                        href="javascript:void(0);"
                        onClick={() => onClick(msg)}
                        style={{ textDecoration: "inherit", color: "inherit" }}
                    >
                        <p>
                            You have a message of type <b>{msg.typ}</b>. Click to process.
                        </p>
                    </a>
                </Alert>
            ))}
        </div>
    );
};

const MessageListener = () => {
    const { open } = useTokenModal()

    const [messageList, setMessageList] = useState([]);
    const [removedMessages, setRemovedMessages] = useState([]);

    useEffect(() => {
        const handle = window.setInterval(
            handleError(async () => {
                const messageService = window.messageService
                if (!messageService) { return }

                const messages = await messageService.getAll();
                if (!Array.isArray(messages) || messages.length <= 0) {
                    setMessageList([]);
                    return;
                }

                setMessageList(
                    messages
                        .map((msg) => ({
                            ...msg,
                            createdAt: new Date(msg.createdAt),
                            typ: parseTokenTyp(msg.message.token),
                        }))
                        .filter(({ typ }) => KNOWN_TOKEN_TYPS.includes(typ))
                        .sort(({ createdAt: a }, { createdAt: b }) => b - a)
                );
            }),
            INTERVAL_MS
        );

        return () => {
            window.clearInterval(handle);
        };
    }, []);

    return (
        <MessageList
            messageList={messageList.filter(
                ({ id }) => !removedMessages.includes(id)
            )}
            onClick={async (msg) => {
                setRemovedMessages([
                    ...removedMessages.filter((id) => msg.id !== id),
                    msg.id,
                ]);

                open(msg.message.token)

                window.messageService.delete(msg.id).catch(console.error);
            }}
            onClose={async (msg) => {
                setRemovedMessages([
                    ...removedMessages.filter((id) => msg.id !== id),
                    msg.id,
                ]);

                window.messageService.delete(msg.id).catch(console.error);
            }}
        />
    );
};

export default MessageListener;


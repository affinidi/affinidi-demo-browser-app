import AffinidiDidAuthService from "@affinidi/affinidi-did-auth-lib/dist/DidAuthService/DidAuthService";
import config from "../config";

const MESSAGE_SERVICE_BASE_URL = "http://localhost:3000/api/v1";
const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "Api-Key": config.apiKeyHash,
};

export class MessageService {
    constructor(networkMember) {
        this._networkMember = networkMember;
        this._affinidiDidAuthService = new AffinidiDidAuthService({
            encryptedSeed: this._networkMember.encryptedSeed,
            encryptionKey: this._networkMember.password,
        });
        this._token = null;
    }

    async send(did, message) {
        const encryptedMessage = await this._networkMember.createEncryptedMessage(did, message);
        const token = await this.getToken();

        return MessageService.execute("/messages", "POST", token, {
            toDid: did,
            message: encryptedMessage,
        });
    }

    async getAll() {
        const token = await this.getToken();
        const { messages } = await MessageService.execute(
            "/messages",
            "GET",
            token
        );

        return Promise.all(
            messages.map(async ({ id, fromDid, createdAt, message }) => {
                const decrypted = await this._networkMember.readEncryptedMessage(message);

                return { id, fromDid, createdAt, message: decrypted };
            })
        );
    }

    async delete(id) {
        const token = await this.getToken();
        return MessageService.execute("/message/" + id, "DELETE", token);
    }

    async getToken() {
        // TODO: check if token is expired?
        // if (this._token !== null) {
        // return this._token;
        // }

        const audienceDid = this._networkMember.did;

        const requestToken = await MessageService.execute(
            "/did-auth/create-did-auth-request",
            "POST",
            undefined,
            { audienceDid }
        );

        const token = await this._affinidiDidAuthService.createDidAuthResponseToken(
            requestToken
        );

        return (this._token = token);
    }

    static async execute(
        path,
        method,
        token,
        data
    ) {
        const url = MessageService.buildUrl(path);
        const response = await fetch(url, {
            method: method,
            mode: "cors",
            cache: "no-cache",
            credentials: "omit",
            headers: {
                ...DEFAULT_HEADERS,
                ...(token ? { Authorization: "Bearer " + token } : {}),
            },
            body: JSON.stringify(data),
        });

        if (response.status < 200 || response.status > 299) {
            throw new Error(`${url} responded with ${response.statusText}`);
        }

        if (response.status === 204) {
            return undefined;
        }

        return response.json();
    }

    static buildUrl(path) {
        return MESSAGE_SERVICE_BASE_URL + path;
    }
}

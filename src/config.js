import { KeysService } from "@affinidi/common";
import decodeEnv from "./utils/decodeEnv";

const apiKey = process.env.REACT_APP_API_KEY

export default {
    env: decodeEnv(process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV),
    apiKeyHash: KeysService.sha256(Buffer.from(apiKey)).toString("hex"),
    apiKey,
};

import decodeEnv from "./utils/decodeEnv";
import { config } from 'dotenv'

config()

const envConfig = {
    env: decodeEnv(process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV),
    apiKey: process.env.REACT_APP_API_KEY,
    accessApiKey: process.env.REACT_APP_ACCESS_API_KEY,
    messagesBaseUrl: process.env.REACT_APP_MESSAGES_BASE_URL || 'https://affinidi-messages.dev.affinity-project.org',
};

export default envConfig

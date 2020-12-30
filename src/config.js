import decodeEnv from "./utils/decodeEnv";
import { config } from 'dotenv'

config()

console.log('REACT_APP_ENVIRONMENT: ', process.env.REACT_APP_ENVIRONMENT)
console.log('NODE_ENV: ', process.env.NODE_ENV)
console.log('REACT_APP_API_KEY: ', process.env.REACT_APP_API_KEY)

// console.log('REACT_APP_SDK_API_KEY: ', process.env.REACT_APP_SDK_API_KEY)
// console.log('REACT_APP_CW_API_KEY: ', process.env.REACT_APP_CW_API_KEY)

const envConfig = {
    env: decodeEnv(process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV),
    apiKey: process.env.REACT_APP_API_KEY,
    accessApiKey: process.env.REACT_APP_ACCESS_API_KEY,
    messagesBaseUrl: process.env.REACT_APP_MESSAGES_BASE_URL || 'https://affinidi-messages.dev.affinity-project.org',
};

export default envConfig
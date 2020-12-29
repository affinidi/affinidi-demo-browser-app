import axios from 'axios';
import config from "../config";

const { apiKey, env } = config

let baseURL = `https://cloud-wallet-api.${env}.affinity-project.org/api/v1`

// TODO: remove the IF
if (process.env.NODE_ENV === 'development') baseURL = 'http://localhost:3000/api/v1'
console.log('env: ', env)
console.log('baseUrl: ', baseURL)
console.log('apiKey: ', apiKey)

const cloudWalletApi = axios.create({
	baseURL,
	headers: {
		'Api-Key': apiKey,
		'Content-Type': 'application/json',
	},
});

// Set the AUTH token for subsequent requests
cloudWalletApi.interceptors.request.use(req => {
	const token = localStorage.getItem('affinidi:accessToken');
	console.log('accessToken: ', token)
	req.headers.Authorization =  token ? `Bearer ${token}` : '';
	return req;
});
	
export default cloudWalletApi
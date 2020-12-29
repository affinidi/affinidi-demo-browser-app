import axios from 'axios';
import config from "../config";

const { cwApiKey, env } = config

let baseURL = `https://cloud-wallet-api.${env}.affinity-project.org/api/v1`

// TODO: remove the IF
if (process.env.NODE_ENV === 'development') baseURL = 'http://localhost:3000/api/v1'
console.log('env: ', env)
console.log('baseUrl: ', baseURL)

const cloudWalletApi = axios.create({
	baseURL,
	headers: {
		'Api-Key': cwApiKey,
		'Content-Type': 'application/json',
	},
});

// Set the AUTH token for subsequent requests
cloudWalletApi.interceptors.request.use(function (config) {
	const token = localStorage.getItem('token');
	config.headers.Authorization =  token ? `Bearer ${token}` : '';
	return config;
});
	
export default cloudWalletApi
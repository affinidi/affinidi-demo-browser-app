import axios from 'axios';
import config from "../config";

const { accessApiKey, env } = config

let baseURL = `https://cloud-wallet-api.${env}.affinity-project.org/api/v1`

// TODO: remove the IF
// if (process.env.NODE_ENV === 'development') baseURL = 'http://localhost:3000/api/v1'

const cloudWalletApi = axios.create({
	baseURL,
	headers: {
		'Api-Key': accessApiKey,
		'Content-Type': 'application/json',
	},
});

// Set the AUTH token for subsequent requests
cloudWalletApi.interceptors.request.use(req => {
	const token = localStorage.getItem('affinidi:accessToken');
	req.headers.Authorization =  token ? `Bearer ${token}` : '';
	return req;
});
	
export default cloudWalletApi
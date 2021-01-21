import axios from 'axios';
import config from "../config";
import LOCAL_STORAGE_KEY from './consts'

const { SDK_ACCESS_TOKEN } = LOCAL_STORAGE_KEY
const { accessApiKey, env } = config
const baseURL = `https://cloud-wallet-api.${env}.affinity-project.org/api/v1`

const cloudWalletApi = axios.create({
	baseURL,
	headers: {
		'Api-Key': accessApiKey,
		'Content-Type': 'application/json',
	},
});

// Set the AUTH token for subsequent requests
cloudWalletApi.interceptors.request.use(req => {
	const token = localStorage.getItem(SDK_ACCESS_TOKEN);
	req.headers.Authorization =  token ? `Bearer ${token}` : '';
	return req;
});
	
export default cloudWalletApi

import axios from 'axios';
import { env } from '../env';
import { setupInterceptors } from './setup-interceptors';

const ip_address = localStorage.getItem('ip_address')
	? localStorage.getItem('ip_address')
	: null;

const requestparam = {
	mode: null,
	user: null,
	ip: ip_address,
	lang: null,
	branch_id: null,
	barcode: null,
};

const apiInstance = axios.create({
	baseURL: env.REACT_APP_PANACEACHS_SERVER,
	timeout: 30000,
});

setupInterceptors(apiInstance);

async function makeApiRequest(config, customHeaders = {}) {
	config.headers = { ...apiInstance.defaults.headers, ...customHeaders };

	config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
	config.headers['X-Forwarded-For'] = localStorage
		.getItem('ip_address')
		?.toString();
	config.headers['Access-Control-Allow-Origin'] = '*';

	try {
		const response = await apiInstance(config);

		if (response.data?.isSuccess === false)
			throw new Error(response.data.errorMessage || 'Request failed');
		return {
			error: null,
			result: response.data.responseData
				? response.data.responseData
				: response.data,
		};
	} catch (error) {
		const errorResponse = error.response ? error.response.data : error.message;
		return { error: errorResponse, result: null };
	}
}

export const withResolve = (baseEndpoint) => {
	const endpoint = (path = '') => `${baseEndpoint}${path}`;

	return {
		fetch: (params = {}) =>
			makeApiRequest({ method: 'get', url: endpoint(), params }),
		insert: (payload, ignoreRequestparam = false) =>
			makeApiRequest({
				method: 'post',
				url: endpoint(),
				data: ignoreRequestparam
					? payload
					: { ...requestparam, requestData: payload },
			}),
		update: (payload, ignoreRequestparam = false) =>
			makeApiRequest({
				method: 'put',
				url: endpoint(),
				data: ignoreRequestparam
					? payload
					: { ...requestparam, requestData: payload },
			}),
		get: (params = {}) =>
			makeApiRequest({ method: 'get', url: endpoint(), params }),
		post: (payload, ignoreRequestparam = false) =>
			makeApiRequest({
				method: 'post',
				url: endpoint(),
				data: ignoreRequestparam
					? payload
					: { ...requestparam, requestData: payload },
			}),
		put: (payload, ignoreRequestparam = false) =>
			makeApiRequest({
				method: 'put',
				url: endpoint(),
				data: ignoreRequestparam
					? payload
					: { ...requestparam, requestData: payload },
			}),
		delete: (payload, ignoreRequestparam = false) =>
			makeApiRequest({
				method: 'delete',
				url: endpoint(),
				data: ignoreRequestparam
					? payload
					: { ...requestparam, requestData: payload },
			}),
		patch: (payload, ignoreRequestparam = false) =>
			makeApiRequest({
				method: 'patch',
				url: endpoint(),
				data: ignoreRequestparam
					? payload
					: { ...requestparam, requestData: payload },
			}),
	};
};

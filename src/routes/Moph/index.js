import axios from 'axios';
import { useEffect } from 'react';
import { env } from '../../env';

export const Moph = () => {
	const searchParams = new URLSearchParams(location.search);
	const queryCode = searchParams.get('code');
	const queryState = searchParams.get('state');

	const callbackMoph = async (code, state) => {
		await axios.get(
			`${env.REACT_APP_PANACEACHS_SERVER}/api/Mophrefer/mophrefercallback?code=${code}&state=${state}`
		);
	};

	useEffect(() => {
		if (queryCode && queryState) {
			callbackMoph(queryCode, queryState);
		} else {
			window.location.replace('/');
		}
	}, [queryCode, queryState]);

	return <></>;
};

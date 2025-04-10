import React, { useEffect, useMemo, useState } from 'react';
import { Select } from 'antd';
import { callApis } from 'components/helper/function/CallApi';
import _debounce from 'lodash/debounce';
import { notiWarning } from 'components/Notification/notificationX';
import { withResolve } from 'api/create-api';

export default function SelectUserMas({
	showSearch = true,
	allowClear = true,
	size = '',
	style = { width: '100%' },
	onChange = () => { },
	value = null,
	debounceTime = 400,
	defaultOptions = [],
	...props
}) {
	const [loading, setLoading] = useState(false);
	const [options, setOptions] = useState([]);
	const debounceSearch = useMemo(() => {
		const getOptions = async (keywords) => {
			if (!keywords) return;
			if (keywords.length < 3)
				return notiWarning({ message: 'ระบุคำค้นหา 3 ตัวอักษรขึ้นไป !' });
			setLoading((p) => !p);
			let res = await withResolve(
				`/api/Masters/UserBySearch/${keywords}`
			).fetch();
			setLoading((p) => !p);
			res = res.result.items?.map((o) => {
				return {
					value: o?.datavalue,
					label: o?.datadisplay,
					classNames: 'data-value',
				};
			});
			setOptions(res);
		};
		return _debounce(getOptions, debounceTime);
	}, []);
	const getByCode = async (code) => {
		if (!code) return;
		if (defaultOptions.length) return setOptions(defaultOptions);
		if (options.length) return;
		setLoading((p) => !p);
		let res = await withResolve(`/api/Masters/UserBySearch/${code}`).fetch();
		setLoading((p) => !p);
		res = res.result.items?.map((o) => {
			return {
				value: o?.datavalue,
				label: o?.datadisplay,
				classNames: 'data-value',
			};
		});
		setOptions(res);
	};
	useEffect(() => {
		getByCode(value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);
	return (
		<Select
			placeholder="ระบุคำค้นหา"
			showSearch={showSearch}
			allowClear={allowClear}
			className="data-value"
			size={size}
			style={style}
			onKeyUp={(e) => debounceSearch(e.target.value)}
			onChange={(value, option) => onChange(value, option)}
			loading={loading}
			dropdownRender={(menu) => (loading ? 'กำลังค้นหา...' : menu)}
			dropdownMatchSelectWidth={400}
			optionFilterProp="label"
			options={options}
			value={value}
			{...props}
		/>
	);
}

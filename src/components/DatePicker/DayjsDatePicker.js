import generatePicker from 'antd/es/date-picker/generatePicker';
import dayjs from 'dayjs';
import th from 'dayjs/locale/th';
import buddistEra from 'dayjs/plugin/buddhistEra';
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';

import localeTH from 'antd/es/date-picker/locale/th_TH';

dayjs.locale(
	{
		...th,
		formats: {
			LT: 'H:mm',
			LTS: 'H:mm:ss',
			L: 'DD/MM/BBBB',
			LL: 'D MMMM BBBB',
			LLL: 'D MMMM BBBB เวลา H:mm',
			LLLL: 'วันddddที่ D MMMM BBBB เวลา H:mm',
		},
	},
	null,
	true
);

dayjs.extend(buddistEra);

const parseLocale = () => {
	return 'th';
};

const config = {
	...dayjsGenerateConfig,
	getFixedDate: (string) => dayjs(string, ['BBBB-M-DD', 'BBBB-MM-DD']),
	setYear: (date, year) => {
		return date.year(year - 543);
	},
	getYear: (date) => Number(date.format('BBBB')),
	locale: {
		getWeekFirstDay: (locale) =>
			dayjs().locale(parseLocale(locale)).localeData().firstDayOfWeek(),
		getWeekFirstDate: (locale, date) =>
			date.locale(parseLocale(locale)).weekday(0),
		getWeek: (locale, date) => date.locale(parseLocale(locale)).week(),
		getShortWeekDays: (locale) =>
			dayjs().locale(parseLocale(locale)).localeData().weekdaysMin(),
		getShortMonths: (locale) =>
			dayjs().locale(parseLocale(locale)).localeData().monthsShort(),
		format: (locale, date, format) => {
			const convertFormat = format.replace('YYYY', 'BBBB');
			// console.log('date', date)
			return date.locale(parseLocale(locale)).format(convertFormat);
		},
		parse: (locale, text, formats) => {
			const localeStr = parseLocale(locale);
			for (let i = 0; i < formats.length; i += 1) {
				const format = formats[i];
				const formatText = text;
				if (format.includes('wo') || format.includes('Wo')) {
					// parse Wo
					const year = formatText.split('-')[0];
					const weekStr = formatText.split('-')[1];
					const firstWeek = dayjs(year, 'BBBB')
						.startOf('year')
						.locale(localeStr);
					for (let j = 0; j <= 52; j += 1) {
						const nextWeek = firstWeek.add(j, 'week');
						if (nextWeek.format('Wo') === weekStr) {
							return nextWeek;
						}
					}
					return null;
				}
				const date = dayjs(formatText, format, true).locale(localeStr);
				if (date.isValid()) {
					return date.add(-543, 'year');
				}
			}

			return null;
		},
	},
};

const DatePicker = generatePicker(config);

const DatePickerEn = generatePicker(dayjsGenerateConfig);

const datePickerTh = {
	...localeTH,
	lang: {
		...localeTH.lang,
		yearFormat: 'BBBB',
		dateFormat: 'M/D/BBBB',
		dateTimeFormat: 'M/D/BBBB HH:mm:ss',
	},
	dateFormat: 'BBBB-MM-DD',
	dateTimeFormat: 'BBBB-MM-DD HH:mm:ss',
	weekFormat: 'BBBB-wo',
	monthFormat: 'BBBB-MM',
};

const DayjsDatePicker = ({
	dateRef,
	format = 'DD/MM/YYYY',
	initialValue = false,
	form = null,
	name,
	isFormList = false,
	listName = '',
	listIndex = 0,
	locale = 'th',
	...props
}) => {
	let formValue = null;

	const handleFormList = () => {
		let formList = form.getFieldValue(listName);
		if (formList?.length > 0) {
			let crrIndexValue = formList[listIndex];
			if (crrIndexValue) {
				return crrIndexValue[name];
			}
		}
		return null;
	};

	const setInitialValue = () => {
		if (isFormList) {
			form.setFields([
				{
					name: [listName, listIndex, name],
					value: initialValue,
				},
			]);
		} else {
			form.setFieldsValue({ [name]: initialValue });
		}
		return initialValue;
	};

	if (form) {
		formValue = isFormList ? handleFormList() : form.getFieldValue(name);

		if (!formValue && initialValue) {
			formValue = setInitialValue();
		}
	}

	return (
		<>
			{locale === 'th' ? (
				<DatePicker
					ref={dateRef}
					locale={datePickerTh}
					format={format}
					onKeyDown={(e) => {
						e.stopPropagation();
						setTimeout(() => {
							let date = e.target.value;
							if (
								dayjs(date, format, true).isValid() &&
								(/[\d.]/.test(e.key) || e.key === 'Backspace')
							) {
								date = dayjs(date, format).add(-543, 'year');
								if (isFormList) {
									let formList = form.getFieldValue(listName);
									if (formList?.length > 0) {
										form.setFields([
											{
												name: [listName, listIndex, name],
												value: date,
											},
										]);
									}
								} else {
									form?.setFieldsValue({ [name]: date });
								}
							}
						}, 1);
					}}
					value={dayjs(formValue)}
					style={{ width: '100%' }}
					{...props}
				/>
			) : (
				<DatePickerEn
					ref={dateRef}
					format={format}
					onKeyDown={(e) => {
						e.stopPropagation();
						setTimeout(() => {
							let date = e.target.value;
							if (
								dayjs(date, format, true).isValid() &&
								(/[\d.]/.test(e.key) || e.key === 'Backspace')
							) {
								date = dayjs(date, format);
								if (isFormList) {
									let formList = form.getFieldValue(listName);
									if (formList?.length > 0) {
										form.setFields([
											{
												name: [listName, listIndex, name],
												value: date,
											},
										]);
									}
								} else {
									form?.setFieldsValue({ [name]: date });
								}
							}
						}, 1);
					}}
					value={dayjs(formValue)}
					style={{ width: '100%' }}
					{...props}
				/>
			)}
		</>
	);
};

export default DayjsDatePicker;

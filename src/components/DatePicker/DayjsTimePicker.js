import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs';
import generatePicker from 'antd/es/date-picker/generatePicker';

const DatePicker = generatePicker(dayjsGenerateConfig);

export default function DayjsTimePicker (props) {
    return(
        <DatePicker {...props} picker="time" mode={undefined} />
    )
}

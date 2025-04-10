import dayjsGenerateConfig from "rc-picker/lib/generate/dayjs";
import generateCalendar from "antd/es/calendar/generateCalendar";

const Calendar = generateCalendar(dayjsGenerateConfig);

export default function DayjsCalendar(props) {
    return <Calendar {...props} />;
}
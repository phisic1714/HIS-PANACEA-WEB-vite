// Moment RangPicker
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekday from "dayjs/plugin/weekday";
import "dayjs/locale/th";
import { DatePicker } from "antd";

dayjs.extend(buddhistEra);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.extend(weekday);
dayjs.locale("th");

export default function DatejsRangPicker({ dates, setDates }) {
    const { RangePicker } = DatePicker

    const handleChangeRangPicker = (dates) => {
        if (dates) {
            setDates(dates.map((date) => dayjs(date)));
        } else {
            setDates(null);
        }
    };
    return (
        <RangePicker
            allowClear={false}
            value={dates}
            onChange={handleChangeRangPicker}
            format={(value) =>
                value ? dayjs(value).add(543, "year").format("DD-MM-YYYY") : ""
            }
            placeholder={["เริ่มต้น", "สิ้นสุด"]}
            disabledDate={(date) => date && date.isAfter(dayjs(), "day")}
        />
    )
}

import dayjs from 'dayjs';
export default function CountDaysOfWeek(start, end) {
    if (!start || !end) return
    const countDaysOfWeek = (startDate, endDate) => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        if (!start.isValid() || !end.isValid()) {
            throw new Error("Invalid date format");
        }
        if (start.isAfter(end)) {
            throw new Error("Start date must be before or equal to end date");
        }
        const daysCount = {
            Sunday: 0,
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
        };

        let currentDate = start;
        while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
            const dayName = currentDate.locale('en').format('dddd'); // Get the day of the week (e.g., "Sunday")
            daysCount[dayName]++;
            currentDate = currentDate.add(1, 'day');
        }
        return daysCount;
    }
    const result = countDaysOfWeek(start, end);
    return result
}

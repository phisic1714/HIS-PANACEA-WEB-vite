import dayjs from 'dayjs'
export default function dateForDisplay({
    date = null,
    oldFormat = "MM/DD/YYYY HH:mm:ss",
    displayFormat = "DD/MM/BBBB HH:mm",
}) {
    if (!date) return null
    return dayjs(date, oldFormat).format(displayFormat)
}

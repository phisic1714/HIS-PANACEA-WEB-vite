import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'

import generatePicker from 'antd/es/date-picker/generatePicker'
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs'

dayjs.extend(buddhistEra)

dayjs.extend((o, c) => {
  // locale needed later
  const proto = c.prototype

  proto.year = function (input) {
    const yearBias = dayjs.locale() === 'th' ? 543 : 0
    const year = this.$y + yearBias

    if (!input) return year

    const diff = -(year - input)

    return this.add(diff, 'year')
  }
})

export const DatePickerDayJS = generatePicker(dayjsGenerateConfig)

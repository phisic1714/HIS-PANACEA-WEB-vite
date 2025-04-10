// eslint-disable-next-line no-unused-vars
import moment from "moment";
import DateUtils from "@date-io/moment"; 
import "moment/locale/th";///ปฎิทิน ภาษาไทย

export default class OverwriteMomentBE extends DateUtils {

  toBuddhistYear(moment, format) {
    var christianYear = moment.format("YYYY");
    var buddhishYear = (parseInt(christianYear) + 543).toString();
    return moment
      .format(
        format
          .replace("YYYY", buddhishYear)
          .replace("YY", buddhishYear.substring(2, 4))
      )
      .replace(christianYear, buddhishYear);
  }

  format = (date, formatKey) => {
    return this.toBuddhistYear(date, formatKey);
  };
}

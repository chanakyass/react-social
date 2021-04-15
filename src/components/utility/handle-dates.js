import moment from 'moment';

export const convertDateToReadableFormat = (itemUTCString) => {
  if (itemUTCString) {
    if (!itemUTCString.match(/Z$/gi)) {
      itemUTCString += 'Z';
    }
    var itemUTC = moment.utc(itemUTCString);

    var currentUTC = moment.utc();

    let days = Math.abs(itemUTC.diff(currentUTC, "days"));
    let months = Math.abs(itemUTC.diff(currentUTC, "months"));

    if (days < 1) {
      return itemUTC.from(currentUTC);
    } else if (days >= 1 && days < 7) {
      return moment(itemUTCString).local().format("dddd HH:mm A");
    } else if (months < 12) {
      return moment(itemUTCString).local().format("dddd, MMM Do");
    }

    return moment(itemUTCString).local().format("dddd, MMM Do YYYY");
  }
  return "Not provided";
};
function getDate(date, fullDay) {
    let currentDate = (!fullDay) ? new Date() : new Date(fullDay);
    currentDate.setDate(currentDate.getDate() + date);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${ year }-${ month }-${ day }`;
  }

module.exports = getDate
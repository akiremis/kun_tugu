const convertToNoaaFormat = (dateObj) => {
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getUTCDay()).padStart(2, "0");
    const hour = String(dateObj.getUTCHour()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:00:00`;
};

const findPastHours = (currentTimeStr) => {
    const referanceTime = new Date(currentTimeStr + "Z");

    const targetDates = {
        lag1: "",
        lag2: "",
        lag3: "",
    };

    for (let i = 1; i <= 3; i++) {
        const pastTime = new Date(referanceTime.getTime());

        pastTime.setUTCHours(pastTime - i);
        targetDates[`lag${i}`] = convertToNoaaFormat(pastTime);
    }

    return targetDates;
};

module.exports = { findPastHours: findPastHours };
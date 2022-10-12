const geolib = require('geolib');

const calculatePrice = (lat1, lon1, lat2, lon2) => {
    let distance = geolib.getDistance(
        { latitude: lat1, longitude: lon1 },
        { latitude: lat2, longitude: lon2 }
    );

    distance = distance/1000;

    return parseFloat(process.env.STARTING_PRICE) + parseFloat(process.env.PRICE_PER_KM)*distance;
}

const calculatePriceFromDistance = (distance) => {

    distance = distance/1000;

    return parseFloat(process.env.STARTING_PRICE) + Math.ceil(parseFloat(process.env.PRICE_PER_KM)*distance);
}

module.exports = {
    calculatePrice,
    calculatePriceFromDistance
}
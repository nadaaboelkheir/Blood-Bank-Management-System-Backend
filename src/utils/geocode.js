const axios = require("axios");
const { GEOAPIFY_API_KEY } = require("../config/env");
const { AppError } = require("../utils/AppError");

const geocodeCity = async (cityName) => {
  try {
    const response = await axios.get(
      `https://api.geoapify.com/v1/geocode/search`,
      {
        params: {
          text: cityName,
          apiKey: GEOAPIFY_API_KEY,
        },
      }
    );

    if (!response.data?.features?.length) {
      throw new AppError("City not found", 404);
    }

    const [lng, lat] = response.data.features[0].geometry.coordinates;
    return { lat, lng };
  } catch (error) {
    console.error(`Geocoding error for ${cityName}:`, error.message);
    throw error;
  }
};

module.exports = geocodeCity;

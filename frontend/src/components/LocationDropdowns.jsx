import { useMemo, useState } from "react";
import { LOCATION_DATA } from "../data/locations";

export default function LocationDropdowns({
  value,
  onChange,
  error,
  required = false,
}) {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const countryData = useMemo(() => {
    return LOCATION_DATA.find((item) => item.country === selectedCountry);
  }, [selectedCountry]);

  const stateData = useMemo(() => {
    return countryData?.states.find((item) => item.name === selectedState);
  }, [countryData, selectedState]);

  function handleCountryChange(e) {
    const country = e.target.value;

    setSelectedCountry(country);
    setSelectedState("");
    setSelectedCity("");

    onChange("");
  }

  function handleStateChange(e) {
    const state = e.target.value;

    setSelectedState(state);
    setSelectedCity("");

    onChange("");
  }

  function handleCityChange(e) {
    const city = e.target.value;

    setSelectedCity(city);

    if (!city || !selectedState || !selectedCountry) {
      onChange("");
      return;
    }

    onChange(`${city}, ${selectedState}, ${selectedCountry}`);
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Location {required && <span className="text-red-500">*</span>}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
          className={`w-full p-3 border rounded-xl bg-white ${
            error ? "border-red-500" : ""
          }`}
        >
          <option value="">Select country</option>
          {LOCATION_DATA.map((item) => (
            <option key={item.country} value={item.country}>
              {item.country}
            </option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={handleStateChange}
          disabled={!selectedCountry}
          className={`w-full p-3 border rounded-xl bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? "border-red-500" : ""
          }`}
        >
          <option value="">Select state/region</option>
          {countryData?.states.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={selectedCity}
          onChange={handleCityChange}
          disabled={!selectedState}
          className={`w-full p-3 border rounded-xl bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? "border-red-500" : ""
          }`}
        >
          <option value="">Select city</option>
          {stateData?.cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {value && (
        <p className="mt-2 text-sm text-gray-500">
          Selected: {value}
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
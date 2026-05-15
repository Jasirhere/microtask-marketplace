import { useEffect, useMemo, useState } from "react";
import { LOCATION_DATA } from "../data/locations";

function buildLocation(country, state, city) {
  return [city, state, country].filter(Boolean).join(", ");
}

function parseLocation(value) {
  if (!value) {
    return {
      country: "",
      state: "",
      city: "",
    };
  }

  const parts = String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return {
      city: parts[0] || "",
      state: parts[1] || "",
      country: parts[2] || "",
    };
  }

  if (parts.length === 2) {
    return {
      city: "",
      state: parts[0] || "",
      country: parts[1] || "",
    };
  }

  return {
    country: parts[0] || "",
    state: "",
    city: "",
  };
}

export default function LocationDropdowns({
  value = "",
  onChange,
  error,
  required = false,
}) {
  const initialLocation = parseLocation(value);

  const [country, setCountry] = useState(initialLocation.country);
  const [state, setState] = useState(initialLocation.state);
  const [city, setCity] = useState(initialLocation.city);

  useEffect(() => {
    const parsed = parseLocation(value);

    setCountry(parsed.country);
    setState(parsed.state);
    setCity(parsed.city);
  }, [value]);

  const selectedCountry = useMemo(() => {
    return LOCATION_DATA.find((item) => item.country === country);
  }, [country]);

  const selectedState = useMemo(() => {
    return selectedCountry?.states?.find((item) => item.name === state);
  }, [selectedCountry, state]);

  const stateOptions = selectedCountry?.states || [];
  const cityOptions = selectedState?.cities || [];

  function emitChange(nextCountry, nextState, nextCity) {
    const location = buildLocation(nextCountry, nextState, nextCity);
    onChange(location);
  }

  function handleCountryChange(e) {
    const nextCountry = e.target.value;

    setCountry(nextCountry);
    setState("");
    setCity("");

    emitChange(nextCountry, "", "");
  }

  function handleStateChange(e) {
    const nextState = e.target.value;

    setState(nextState);
    setCity("");

    emitChange(country, nextState, "");
  }

  function handleCityChange(e) {
    const nextCity = e.target.value;

    setCity(nextCity);
    emitChange(country, state, nextCity);
  }

  const selectClass = `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
    error ? "border-red-500 bg-red-50" : "border-slate-300"
  }`;

  return (
    <div className="min-w-0">
      <label className="mb-1 block text-sm font-semibold text-slate-700">
        Location {required ? "*" : ""}
      </label>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="min-w-0">
          <select
            value={country}
            onChange={handleCountryChange}
            className={selectClass}
          >
            <option value="">Select country</option>

            {LOCATION_DATA.map((item) => (
              <option key={item.country} value={item.country}>
                {item.country}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <select
            value={state}
            onChange={handleStateChange}
            disabled={!country}
            className={`${selectClass} disabled:bg-slate-100 disabled:text-slate-400`}
          >
            <option value="">
              {country ? "Select state / province" : "Select country first"}
            </option>

            {stateOptions.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <select
            value={city}
            onChange={handleCityChange}
            disabled={!state}
            className={`${selectClass} disabled:bg-slate-100 disabled:text-slate-400`}
          >
            <option value="">
              {state ? "Select city" : "Select state first"}
            </option>

            {cityOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {!error && (
        <p className="mt-1 text-xs text-slate-500">
          Select country, state / province, and city.
        </p>
      )}
    </div>
  );
}
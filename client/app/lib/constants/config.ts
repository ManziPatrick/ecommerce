const DEV_API_HOST = "http://localhost:5000";
const PROD_API_HOST = "https://macyemacyeapi.andasy.dev";

const BASE_HOST =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL_PROD || PROD_API_HOST
    : process.env.NEXT_PUBLIC_API_URL_DEV || DEV_API_HOST;

export const API_BASE_URL = `${BASE_HOST}/api/v1`;
export const AUTH_API_BASE_URL = `${BASE_HOST}/api/v1`;

export const GRAPHQL_URL = `${API_BASE_URL}/graphql`;

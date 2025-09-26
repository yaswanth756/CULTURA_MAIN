export const buildApiUrl = (endpoint) => {
    return `${import.meta.env.VITE_API_BASE_URL}/${endpoint}`;
  };
  
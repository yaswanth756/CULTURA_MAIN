// Helper function to update search params without losing existing ones

export const updateSearchParams = (params, newFilters) => {
    const newParams = new URLSearchParams(params);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    return newParams;
  };
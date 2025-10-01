// Feature flags for toggling features on/off
export const featureFlags = {
  // Set to false to hide authors entity due to API bug
  showAuthors: false,
  // Set to false to hide continents entity
  showContinents: false,
};

// Helper to check if an entity should be shown
export function isEntityEnabled(entityId) {
  if (entityId === 'authors') {
    return featureFlags.showAuthors;
  }
  if (entityId === 'continents') {
    return featureFlags.showContinents;
  }
  return true;
}

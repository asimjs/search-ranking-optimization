export const processLocationData = (locations = [], keyword) => {
  // If no locations or only one location, return as is
  if (locations.length <= 1) {
    return locations;
  }

  // Keep the first result at the top
  const firstLocation = locations[0];
  const remainingLocations = locations.slice(1);

  // Function to calculate priority score for a location
  function calculatePriority(location, firstLocationCode) {
    let score = 0;
    const name = location.name.toLowerCase();

    // Higher priority for more specific/complete names
    const nameParts = location.name.split(",").map((part) => part.trim());

    // Penalize empty or incomplete parts
    const emptyParts = nameParts.filter((part) => part === "" || part === " ").length;
    score -= emptyParts * 10;

    // Reward more descriptive names
    score += nameParts.length * 2;

    // Reward specific location types
    // If search keyword is a country and matches with a result that is ranked higher
    if (name.endsWith(keyword)) score += 20;

    if (name.includes("island")) score += 10;
    if (name.includes("international")) score += 12;
    if (name.includes("airport")) score += 5;

    // Penalize very generic names (lowercase letters/whitespace ending with a comma)
    if (name.match(/^[a-z\s]+,\s*$/)) score -= 20;

    // Boost priority for locations with the same code as the first location
    if (location.code && location.code === firstLocationCode) {
      score += 2; // High priority boost for matching codes
    }

    return score;
  }

  // Function to check if two locations are duplicates
  function areLocationsDuplicate(loc1, loc2) {
    // Check if names are similar (after cleaning)
    const cleanName1 = loc1.name.toLowerCase().replace(/,\s*$/, "").trim();
    const cleanName2 = loc2.name.toLowerCase().replace(/,\s*$/, "").trim();

    // Extract main location name (first part before comma)
    const mainName1 = cleanName1.split(",")[0].trim();
    const mainName2 = cleanName2.split(",")[0].trim();

    return mainName1 === mainName2;
  }

  // Process only the remaining locations (excluding the first one)
  const processedRemainingLocations = remainingLocations
    .map((location) => ({
      ...location,
      priority: calculatePriority(location, firstLocation.code),
    }))
    .sort((a, b) => b.priority - a.priority);

  // Remove duplicates from remaining locations, keeping the highest priority version
  const uniqueRemainingLocations = [];

  for (const location of processedRemainingLocations) {
    const isDuplicate = uniqueRemainingLocations.some((existing) => areLocationsDuplicate(location, existing));

    if (!isDuplicate) {
      uniqueRemainingLocations.push(location);
    }
  }

  // Remove the priority field from processed results
  const cleanedRemainingLocations = uniqueRemainingLocations.map(({ priority, ...location }) => location);

  // Return first location followed by processed remaining locations
  return [firstLocation, ...cleanedRemainingLocations];
};

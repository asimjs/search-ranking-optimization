# From Raw API Responses to Smart Search Results: Transforming a Basic Location API

You're building a hotel booking platform, and you need to help users find locations. You integrate with a third-party API that returns location data, but the results are not properly ranked or formatted

The API was returning:

- Duplicate locations with slight variations
- Incomplete location names with trailing commas
- Generic results that didn't match user intent
- Poor prioritization of relevant results

Sound familiar? This is exactly the challenge I faced when working on our hotel booking backend system.

## The Raw API Response

Here's what we were getting from the external location service:

```javascript
// Raw API response
const locations = [
  { id: "599181", name: "Hong Kong, People's Republic of China", code: "CN", lat: 22.233358, lng: 114.122479 },
  { id: "674307", name: "Hong Kong, ", code: "HK", lat: 22.28333, lng: 114.15875 },
  { id: "638571", name: "Hong Kong, Hong Kong", code: "HK", lat: 22.28333, lng: 114.15875 },
  { id: "667696", name: "Hong Kong, ", code: "HK", lat: 22.28333, lng: 114.15875 },
  { id: "674318", name: "Hong Kong, ", code: "HK", lat: 22.28333, lng: 114.15875 },
  { id: "600656", name: "Hong Kong International Airport, People's Republic of China", code: "CN", lat: 22.245097, lng: 114.118412 },
  { id: "638579", name: "Hong Kong Island, Hong Kong, Hong Kong", code: "HK", lat: 22.24798, lng: 114.186745 },
  { id: "638590", name: "Hong Kong East, Hong Kong, Hong Kong", code: "HK", lat: 22.269901, lng: 114.224871 },
  { id: "638529", name: "Hong Kong, Hong Kong", code: "HK", lat: 22.28333, lng: 114.15875 },
  { id: "638586", name: "Lantau Island, Hong Kong, Hong Kong", code: "HK", lat: 22.318955, lng: 114.03946 },
  { id: "638530", name: "Kowloon, Hong Kong, Hong Kong", code: "HK", lat: 22.325375, lng: 114.198885 },
  { id: "667510", name: "New Territories, Hong Kong, ", code: "HK", lat: 22.396845, lng: 114.148319 },
  { id: "667513", name: "Sha Tin, Hong Kong, ", code: "HK", lat: 22.379604, lng: 114.187775 },
  { id: "667517", name: "Tsuen Wan, Hong Kong, ", code: "HK", lat: 22.374465, lng: 114.110401 },
  { id: "638583", name: "Tin Shui Wai, Hong Kong, Hong Kong", code: "HK", lat: 22.459955, lng: 114.003495 },
  { id: "667535", name: "Tuen Mun, Hong Kong, ", code: "HK", lat: 22.39107, lng: 113.97633 },
  { id: "638534", name: "Aberdeen, Hong Kong, Hong Kong", code: "HK", lat: 22.24781, lng: 114.160715 },
  { id: "638563", name: "Tsing Yi, Hong Kong, Hong Kong", code: "HK", lat: 22.34146, lng: 114.09705 },
  { id: "638531", name: "Cheung Chau, Hong Kong, Hong Kong", code: "HK", lat: 22.214255, lng: 114.02919 },
  { id: "638532", name: "Sha Tin, Hong Kong, Hong Kong", code: "HK", lat: 22.379604, lng: 114.187775 },
];
```

Notice the issues? Trailing commas, duplicates, and inconsistent formatting. Not exactly user-friendly.

## Solution:

I implemented data processing function that transforms these raw responses into clean, prioritized, and user-friendly results. Here's how:

In all the search responses from api first would always be accurate and formatted so we will process rest of the responses and keep the 1st at top.

### 1. Duplicate Detection

First, I created a function to identify and remove duplicates based on semantic similarity rather than exact matches:

```javascript
function areLocationsDuplicate(loc1, loc2) {
  // Clean and normalize names
  const cleanName1 = loc1.name.toLowerCase().replace(/,\s*$/, "").trim();
  const cleanName2 = loc2.name.toLowerCase().replace(/,\s*$/, "").trim();

  // Extract main location name (first part before comma)
  const mainName1 = cleanName1.split(",")[0].trim();
  const mainName2 = cleanName2.split(",")[0].trim();

  return mainName1 === mainName2;
}
```

### 2. Prioritization System

I developed a scoring algorithm that evaluates each location based on multiple criteria:

```javascript
function calculatePriority(location, firstLocationCode, keyword) {
  let score = 0;
  const name = location.name.toLowerCase();

  // Reward more descriptive names
  const nameParts = location.name.split(",").map((part) => part.trim());
  score += nameParts.length * 2;

  // Penalize empty or incomplete parts
  const emptyParts = nameParts.filter((part) => part === "" || part === " ").length;
  score -= emptyParts * 10;

  // Reward specific location types
  // If search keyword is a country and matches with a result that is ranked higher
  if (name.endsWith(keyword)) score += 20;

  if (name.includes("international")) score += 12;
  if (name.includes("airport")) score += 5;
  if (name.includes("island")) score += 10;

  // Penalize very generic names (lowercase letters/whitespace ending with a comma)
  if (name.match(/^[a-z\s]+,\s*$/)) score -= 20;

  // Boost priority for locations with matching codes
  if (location.code && location.code === firstLocationCode) {
    score += 2;
  }

  return score;
}
```

### 3. The Complete Processing Pipeline

Here's the main processing function that ties everything together:

```javascript
function processLocationData(data, keyword) {
  const locations = data || [];

  if (locations.length <= 1) {
    return locations;
  }

  // Keep the first result at the top
  const firstLocation = locations[0];
  const remainingLocations = locations.slice(1);

  // Calculate priority scores and sort
  const processedRemainingLocations = remainingLocations
    .map((location) => ({
      ...location,
      priority: calculatePriority(location, firstLocation.code, keyword),
    }))
    .sort((a, b) => b.priority - a.priority);

  // Remove duplicates, keeping highest priority versions
  const uniqueRemainingLocations = [];

  for (const location of processedRemainingLocations) {
    const isDuplicate = uniqueRemainingLocations.some((existing) => areLocationsDuplicate(location, existing));

    if (!isDuplicate) {
      uniqueRemainingLocations.push(location);
    }
  }

  // Clean up and return results
  const cleanedRemainingLocations = uniqueRemainingLocations.map(({ priority, ...location }) => location);

  return [firstLocation, ...cleanedRemainingLocations];
}
```

## The Results: From Chaos to Clarity

After implementing this processing pipeline, our location search results transformed from:

**Before:**

```
1. Hong Kong, People's Republic of China
2. Hong Kong,
3. Hong Kong, Hong Kong
4. Hong Kong,
5. Hong Kong,
6. Hong Kong International Airport, People's Republic of China
7. Hong Kong Island, Hong Kong, Hong Kong
8. Hong Kong East, Hong Kong, Hong Kong
9. Hong Kong, Hong Kong
10. Lantau Island, Hong Kong, Hong Kong
11. Kowloon, Hong Kong, Hong Kong
12. New Territories, Hong Kong,
13. Sha Tin, Hong Kong,
14. Tsuen Wan, Hong Kong,
15. Tin Shui Wai, Hong Kong, Hong Kong
16. Tuen Mun, Hong Kong,
17. Aberdeen, Hong Kong, Hong Kong
18. Tsing Yi, Hong Kong, Hong Kong
19. Cheung Chau, Hong Kong, Hong Kong
20. Sha Tin, Hong Kong, Hong Kong
```

**After:**

```
1. Hong Kong, People's Republic of China
2. Hong Kong International Airport, People's Republic of China
3. Hong Kong Island, Hong Kong, Hong Kong
4. Lantau Island, Hong Kong, Hong Kong
5. Hong Kong East, Hong Kong, Hong Kong
6. Kowloon, Hong Kong, Hong Kong
7. Tin Shui Wai, Hong Kong, Hong Kong
8. Aberdeen, Hong Kong, Hong Kong
9. Tsing Yi, Hong Kong, Hong Kong
10. Cheung Chau, Hong Kong, Hong Kong
11. Sha Tin, Hong Kong, Hong Kong
12. Hong Kong, Hong Kong
13. New Territories, Hong Kong,
14. Tsuen Wan, Hong Kong,
15. Tuen Mun, Hong Kong,
```

## Key Benefits of This Approach

1. **User Experience**: Clean, readable location names without formatting issues
2. **Relevance**: More specific and useful locations appear first
3. **Deduplication**: No more confusing duplicate entries
4. **Intelligence**: The system understands context and prioritizes accordingly
5. **Scalability**: The algorithm works with any location data structure

## The Takeaway

This experience taught me that sometimes the most impactful improvements come not from building complex new features, but from small things that improves user experience. By applying smart algorithms to clean, deduplicate, and prioritize API responses, we transformed a basic location search into an smart, user-friendly experience.

The key is to think like your users: What would they actually want to see? How can you make their lives easier? Sometimes the best code is the code that makes the complex look simple.

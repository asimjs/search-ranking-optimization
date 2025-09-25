import { processLocationData } from "./process.js";

export const locations = [
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

const processedLocations = processLocationData(locations, "Hong Kong");

for (let i = 0; i < processedLocations.length; i++) {
  const location = processedLocations[i];
  console.log(i + 1 + ".", location.name);
}

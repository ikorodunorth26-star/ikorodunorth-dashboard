export type PublicNewsStory = {
  title: string
  category: string
  group: "community" | "council" | "projects"
  date: string
  slug: string
}

export type PublicProject = {
  title: string
  category: string
  location: string
  date: string
  slug: string
}

export type PublicWard = {
  name: string
  slug: string
  projects: number
  facilities: number
}

/** Published records from the public Ikorodu North LCDA website. */
export const publicNews: PublicNewsStory[] = [
  { title: "Triplets welcomed at Agbede Health Centre", category: "Health", group: "community", date: "24 October 2026", slug: "agbede-triplets" },
  { title: "Chairman holds community engagement meetings at Agbede and Odogunyan", category: "Community", group: "community", date: "24 October 2026", slug: "agbede-odogunyan-meetings" },
  { title: "Chairman receives Lagos East APC women leaders", category: "Council news", group: "council", date: "23 October 2026", slug: "lagos-east-apc-women-leaders" },
  { title: "Chairman hosts the second Spelling Bee", category: "Education", group: "community", date: "15 October 2026", slug: "spelling-bee-2026" },
  { title: "Chairman meets Ward E4, Olorunda, and assures residents of more development", category: "Community", group: "community", date: "11 October 2026", slug: "olorunda-ward-e4-engagement" },
  { title: "Chairman receives the Apanisile Progressive Movement", category: "Council news", group: "council", date: "8 October 2026", slug: "apanisile-progressive-movement" },
  { title: "Chairman hosts Rescue Home and its U.S. partners", category: "Community", group: "community", date: "6 October 2026", slug: "rescue-home-visit" },
  { title: "Leadership team trains on serving within the mandate", category: "Council news", group: "council", date: "19 September 2026", slug: "serving-within-the-mandate" },
  { title: "Chairman unveils a plan for a mini bus stop at Adamo", category: "Council news", group: "council", date: "17 September 2026", slug: "adamo-mini-bus-stop" },
  { title: "High School Road, Apeka, and Army Children School flagged off", category: "Infrastructure", group: "projects", date: "26 July 2026", slug: "apeka-road-army-school-flagoff" },
  { title: "Chairman rewards the Apanisile Champions Cup winners", category: "Youth and sports", group: "community", date: "5 July 2026", slug: "apanisile-champions-cup" },
  { title: "Six classroom blocks commissioned at Igbaga", category: "Education", group: "projects", date: "8 April 2026", slug: "igbaga-classroom-blocks" },
  { title: "Four solar water facilities handed over", category: "Water and sanitation", group: "projects", date: "26 March 2026", slug: "four-solar-water-facilities" },
  { title: "First 100 days: the New Deal record at Isiu", category: "First 100 days", group: "council", date: "18 November 2025", slug: "first-100-days" },
  { title: "Odo-Nla health centre reopened for longer care", category: "Health", group: "projects", date: "18 November 2025", slug: "odonla-health-centre" },
  { title: "Iranlowo Owo Apa: ₦100,000 for traders and households", category: "Community", group: "community", date: "18 November 2025", slug: "iranlowo-owo-apa" },
  { title: "Chairman’s October inspection of roads, water and the registry", category: "Projects", group: "projects", date: "28 October 2025", slug: "october-project-inspection" },
  { title: "WaterAid hands over school water and toilets", category: "Water and sanitation", group: "projects", date: "30 September 2025", slug: "wateraid-school-handover" },
  { title: "Chairman inspects Adamo–Araro Road", category: "Roads", group: "projects", date: "1 August 2025", slug: "adamo-araro-road-inspection" },
  { title: "Mayor Apanisile assumes office with the 6th Legislative Council", category: "Council news", group: "council", date: "28 July 2025", slug: "chairman-assumes-office" },
]

export const publicProjects: PublicProject[] = [
  { title: "Odo-Nla health centre, area office and ambulance", category: "Health", location: "Odo-Nla", date: "18 November 2025", slug: "odonla-primary-health-centre" },
  { title: "Solar water in Irepodun, Arobiona and Agbede", category: "Water and sanitation", location: "Irepodun, Arobiona and Agbede", date: "26 March 2026", slug: "solar-water-irepodun-arobiona-agbede" },
  { title: "School water and toilets with WaterAid", category: "Water and sanitation", location: "Odogunyan and Erikorodo", date: "30 September 2025", slug: "school-water-sanitation-2025" },
  { title: "Adamo–Araro Road", category: "Roads", location: "Olorunda", date: "1 August 2025", slug: "adamo-araro-road" },
  { title: "High School Road, Apeka, and Army Children School", category: "Roads", location: "Apeka and Losi-Onikoko", date: "26 July 2026", slug: "apeka-road-and-army-school" },
  { title: "Apeka–Agbala link and culverts", category: "Roads", location: "Apeka and Agbala", date: "28 October 2025", slug: "apeka-agbala-culverts" },
  { title: "Six classroom blocks at Igbaga", category: "Education", location: "Igbaga", date: "8 April 2026", slug: "igbaga-classroom-blocks" },
  { title: "Omigo solar-powered water facility", category: "Water", location: "Omigo", date: "July 2026", slug: "omigo-solar-water-facility" },
  { title: "Solar water and sanitation at Maya Grammar School", category: "Education", location: "Maya", date: "23 September 2026", slug: "maya-schools-wash-facilities" },
]

export const publicWards: PublicWard[] = [
  { name: "Isiu", slug: "isiu", projects: 1, facilities: 3 },
  { name: "Odogunyan", slug: "odogunyan", projects: 4, facilities: 6 },
  { name: "Olorunda", slug: "olorunda", projects: 1, facilities: 3 },
  { name: "Erikorodo", slug: "erikorodo", projects: 1, facilities: 2 },
  { name: "Agbala", slug: "agbala", projects: 2, facilities: 2 },
]

export const publicOffices = {
  departments: 9,
  units: 6,
  landmarks: 8,
  executive: 21,
  legislative: 5,
  management: 13,
}

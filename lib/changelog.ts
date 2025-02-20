export interface ChangelogEntry {
  version: string;
  date: string;
  content: string;
}
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;
export const changelog: ChangelogEntry[] = [
  {
    version: `${appVersion}`,
    date: "2025-02-19",
    content: `

  #### New Features
  - Added a capability to load any dataset on Google Earth Engine (GEE).
  - Add new database query function to find GEE datasets based on user's search query (given by the LLM).
  - Added a web scraper function to retrieve information on the dataset selected for the user.
  
  #### Improvements
  - Updated the Vercel AI SDK to have better streaming experience.
  - Cleaned up the codebase to improve clarity.
  
  #### Bug Fixes
   - Fixed some minor bugs.
  
      `.trim(),
  },
];

export interface ChangelogEntry {
  version: string;
  date: string;
  content: string;
}
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;
export const changelog: ChangelogEntry[] = [
  {
    version: `${appVersion}`,
    date: "2025-01-21",
    content: `
  #### Improvements
  - Added better error messages for failed operations.
  
  #### Bug Fixes
  - Fixed some minor UI issues.
      `.trim(),
  },
];

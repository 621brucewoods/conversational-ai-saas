// transformMetadataToCitations.ts

interface RawMatch {
  pageContent: string;
  metadata: {
    loc: {
      pageNumber: number;
      lines: { to: number; from: number };
    };
    pdf: {
      info: {
        Title: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
    fileName: string;
    fileId: number;
    similarity?: number;
  };
}

interface Citation {
  documentName: string;
  pages: { page: number }[];
  similarity?: number;
}

export function transformMetadataToCitations(items: RawMatch[]): Citation[] {
  const citationMap: Record<string, Citation> = {};

  for (const item of items) {
    const docName = item.metadata.fileName;
    const pageNumber = item.metadata.loc.pageNumber;
    const similarity = item.metadata.similarity;

    if (!citationMap[docName]) {
      citationMap[docName] = {
        documentName: docName,
        pages: [{ page: pageNumber }],
        similarity: similarity, // store similarity from the first match
      };
    } else {
      // Add another page for this document
      citationMap[docName].pages.push({ page: pageNumber });

      // If you want to update similarity for multiple matches from same doc,
      // you could do something like:
      // citationMap[docName].similarity = Math.max(
      //   citationMap[docName].similarity ?? 0,
      //   similarity ?? 0
      // );
    }
  }

  return Object.values(citationMap);
}

export const dynamic = "force-dynamic";

import KnowledgeBase from "@/features/knowledge-base/components/knolwedge-base";
import { fetchDocumentFiles } from "@/features/knowledge-base/actions/document-actions";

const KnowledgeBasePage = async () => {
  const documents = await fetchDocumentFiles();

  return <KnowledgeBase initialDocuments={documents} />;
};

export default KnowledgeBasePage;

'use client';

import { useEffect, useState } from 'react';

export function useCategoryDocuments(
  categoryId?: string,
  departmentId?: string
) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (departmentId) params.append('departmentId', departmentId);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch (err) {
      console.error(err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const view = async (documentId: string) => {
    const res = await fetch(`/api/documents/${documentId}/signed-url`);
    const data = await res.json();
    if (data.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const remove = async (documentId: string) => {
    await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
    fetchDocuments();
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, departmentId]);

  return {
  documents,
  loading,
  view,
  remove,
  fetchDocuments,
};
}

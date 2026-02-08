export const documentClient = {
  async getDocuments(params: {
    categoryId?: string;
    departmentId?: string;
  }) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as any
    ).toString();

    const res = await fetch(`/api/documents?${query}`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async getSignedUrl(documentId: string) {
    const res = await fetch(`/api/documents/${documentId}/signed-url`);
    if (!res.ok) throw new Error('Failed to get signed url');
    return res.json();
  },

  async deleteDocument(documentId: string) {
    const res = await fetch(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Delete failed');
  },
};

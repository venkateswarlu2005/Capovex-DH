'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton,
  CircularProgress 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

// 1. Define the interface for the document data
interface DocumentData {
  documentId: string;
  fileName: string;
  fileType: string;
  size: number;
}

export default function ViewUserDocuments() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  
  // 2. Assign the interface to the state
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
const handleView = async (documentId: string) => {
  console.log('CLICKED VIEW:', documentId);

  try {
    const res = await fetch(`/api/documents/${documentId}/signed-url`);
    console.log('RESPONSE STATUS:', res.status);

    const text = await res.text();
    console.log('RAW RESPONSE:', text);

    const data = JSON.parse(text);
    console.log('SIGNED URL:', data.signedUrl);

    window.open(data.signedUrl, '_blank');
  } catch (err) {
    console.error('View failed', err);
  }
};


useEffect(() => {
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const url = categoryId
        ? `/api/documents?categoryId=${categoryId}`
        : `/api/documents?all=true`; 

      const res = await fetch(url);
      const data = await res.json();

      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  fetchDocs();
}, [categoryId]);


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#F36C24' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight={800} mb={4} color="text.primary">
        Documents
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f9f9f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>File Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Size</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <TableRow key={doc.documentId} hover>
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell>
                    {/* Safely handle fileType splits */}
                    {doc.fileType?.includes('/') 
                      ? doc.fileType.split('/')[1].toUpperCase() 
                      : doc.fileType}
                  </TableCell>
                  <TableCell>{(doc.size / 1024).toFixed(2)} KB</TableCell>
                  <TableCell align="right">
                    <IconButton
  size="small"
  onClick={() => handleView(doc.documentId)}
  sx={{ color: '#F36C24' }}
>
  <VisibilityIcon fontSize="small" />
</IconButton>

                    <IconButton size="small">
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                  No documents found in this category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Paper,
  CircularProgress
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';

/* ---------------- TYPES ---------------- */
interface DocumentData {
  documentId: string;
  fileName: string;
  fileType: string;
  size: number;
  updatedAt?: string; 
}

interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  senderName: string;
  text: string;
  timestamp: string;
}

export default function DocumentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  /* ---------------- DYNAMIC HEADING LOGIC ---------------- */
  const categoryId = searchParams.get('categoryId');
  const categoryName = searchParams.get('categoryName');
  
  // Logic: If no categoryId is present OR it's an "all" request, show "ALL DOCUMENTS"
  // Otherwise, show the actual category name passed in the URL
  const displayTitle = (!categoryId || searchParams.get('all') === 'true')
    ? 'ALL DOCUMENTS' 
    : (categoryName || 'DOCUMENTS').toUpperCase();

  /* ---------------- STATE ---------------- */
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);

  /* ---------------- API ACTIONS ---------------- */
  const fetchDocs = async () => {
    setLoading(true);
    try {
      const url = categoryId
        ? `/api/documents?categoryId=${categoryId}`
        : `/api/documents?all=true`;

      const res = await fetch(url);
      const data = await res.json();
      setDocuments(data.documents || []);
      
      setMessages([
        { id: '1', sender: 'other', senderName: 'Support', text: 'How can I help you with these documents?', timestamp: '10:23 AM' }
      ]);
    } catch (err) {
      console.error('Failed to fetch documents', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (documentId: string) => {
    try {
      const res = await fetch(`/api/documents/${documentId}/signed-url`);
      const data = await res.json();
      if (data.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error('View failed', err);
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'me',
      senderName: 'Me',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  useEffect(() => {
    fetchDocs();
  }, [categoryId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#ff7a18' }} />
      </Box>
    );
  }

  return (
    <Box p={4} sx={{ backgroundColor: '#fdfdfd' }}>
      
      {/* ================= HEADER ================= */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
        <Box>
          <Typography variant="h1" fontWeight={700} color="#ff7a18" sx={{ fontSize: '2.2rem', letterSpacing: '-0.5px' }}>  
            {displayTitle}
          </Typography>
          <Box display="flex" alignItems="center" gap={4}>
             <Typography variant='h2' color="text.secondary" sx={{ fontSize: '1rem', fontWeight: 400 }}>
                View all the Files and Folders shared with you
             </Typography>
             <Box 
               sx={{ 
                 bgcolor: 'rgba(255, 122, 24, 0.1)', 
                 color: '#ff7a18', 
                 px: 1, 
                 py: 0.5, 
                 borderRadius: 1, 
                 fontSize: '0.75rem', 
                 fontWeight: 700 
               }}
             >
               READ-ONLY
             </Box>
          </Box>
        </Box>

        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            backgroundColor: '#ff7a18',
            height: 44,
            fontSize: 15,
            px: 2.5,
            '&:hover': { backgroundColor: '#e56a10' }
          }}
        >
          Request Documents
        </Button>
      </Box>

      {/* ================= MAIN CONTENT GRID ================= */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, minHeight: 600, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 4, flex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700}>FILES & FOLDERS</Typography>
                <TextField
                  placeholder="Search"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Dynamic Breadcrumb */}
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FolderIcon sx={{ color: '#ff7a18', mr: 1, fontSize: 20 }} /> 
                / {displayTitle.toLowerCase()}
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem' }}>DOCUMENT</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem' }}>SIZE</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem' }}>TYPE</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem' }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <TableRow key={doc.documentId} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Box sx={{ mr: 2, p: 1, borderRadius: 2, bgcolor: 'rgba(255, 86, 48, 0.1)', color: '#FF5630', display: 'flex' }}>
                                <DescriptionIcon />
                              </Box>
                              <Typography fontWeight={600} fontSize={14}>{doc.fileName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontSize={14} color="text.secondary">
                                {(doc.size / 1024).toFixed(2)} KB
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontSize={14} color="text.secondary">
                                {doc.fileType?.includes('/') ? doc.fileType.split('/')[1].toUpperCase() : doc.fileType}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0} justifyContent="flex-end">
                               <IconButton size="small" onClick={() => handleView(doc.documentId)}>
                                 <VisibilityIcon fontSize="small" sx={{ color: '#ff7a18' }} />
                               </IconButton>
                               <IconButton size="small"><DownloadIcon fontSize="small" /></IconButton>
                               <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                <Typography color="text.secondary">No documents found.</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* CHAT SIDEBAR */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%', maxHeight: 800, display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header and Chat logic remains the same... */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                 <Typography variant="h6" fontWeight={700} fontSize={16}>DROP A MESSAGE</Typography>
                 <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                    <Typography variant="caption" color="text.secondary">Active</Typography>
                 </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pr: 1, minHeight: '300px' }}>
                {messages.map((msg) => (
                  <Box key={msg.id} sx={{ display: 'flex', flexDirection: msg.sender === 'me' ? 'row-reverse' : 'row', mb: 2, gap: 1 }}>
                    {msg.sender === 'other' && <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>AD</Avatar>}
                    <Box sx={{ maxWidth: '80%' }}>
                      <Paper elevation={0} sx={{ p: 1.5, bgcolor: msg.sender === 'me' ? '#f0f0f0' : '#fff', border: '1px solid #eee', borderRadius: 2 }}>
                         <Typography fontSize={14}>{msg.text}</Typography>
                      </Paper>
                      <Typography variant="caption" color="text.secondary" display="block" textAlign={msg.sender === 'me' ? 'right' : 'left'} mt={0.5}>
                        {msg.timestamp}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 'auto' }}>
                 <TextField
                   fullWidth
                   multiline
                   rows={2}
                   placeholder="Type a message..."
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f9f9f9' } }}
                 />
                 <Box display="flex" justifyContent="space-between" mt={1}>
                    <IconButton size="small"><AttachFileIcon /></IconButton>
                    <Button 
                      variant="contained" 
                      size="small" 
                      endIcon={<SendIcon />}
                      onClick={handleSendMessage}
                      sx={{ bgcolor: '#ff7a18', '&:hover': { bgcolor: '#e56a10' }, textTransform: 'none' }}
                    >
                      Send
                    </Button>
                 </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FOOTER remains the same... */}
      <Card sx={{ mt: 4, borderRadius: 2, bgcolor: '#fff', border: '1px solid #eaeaea', boxShadow: 'none' }}>
        <CardContent sx={{ py: 1.5, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Box display="flex" alignItems="center" gap={1}>
              <SecurityIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="caption" color="text.secondary">
                 All data is protected by 256-bit AES encryption. System activity is continuously monitored.
              </Typography>
           </Box>
           <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
             ● ACTIVE PROTECTION
           </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
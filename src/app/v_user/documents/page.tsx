'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react'; 
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

interface ApiMessage {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: {
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    }
}

// FIX 1: Extend the Session User type locally to include departmentId
// This prevents TypeScript errors when accessing session.user.departmentId
type ExtendedUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  departmentId?: string | null; // Added this
  role?: string;
};

export default function DocumentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession(); 
  
  // Cast session user to our extended type
  const user = session?.user as ExtendedUser | undefined;

  /* ---------------- DYNAMIC HEADING LOGIC ---------------- */
  const categoryId = searchParams.get('categoryId');
  const categoryName = searchParams.get('categoryName');
  
  const displayTitle = (!categoryId || searchParams.get('all') === 'true')
    ? 'ALL DOCUMENTS' 
    : (categoryName || 'DOCUMENTS').toUpperCase();

  /* ---------------- STATE ---------------- */
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ---------------- HELPER: GET CORRECT DEPT ID ---------------- */
  // FIX 2: Logic to determine the correct ID to send to the Chat API.
  // We prioritize the User's Department ID from the session to avoid FK errors.
  const getChatTargetId = () => {
    // A. If user is an Employee/Admin, they chat in their own Department.
    if (user?.departmentId) {
        return user.departmentId;
    }
    // B. If user is a Viewer (no deptId), they chat in the context of the Category.
    // Note: If this still fails, the Viewer's account must be linked to a Dept in the backend.
    return categoryId;
  };

  /* ---------------- API ACTIONS: DOCUMENTS ---------------- */
  const fetchDocs = async () => {
    setLoadingDocs(true);
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
      setLoadingDocs(false);
    }
  };

  /* ---------------- API ACTIONS: CHAT ---------------- */
  const fetchMessages = async () => {
    if (!user) return;

    try {
        const params = new URLSearchParams();
        
        // FIX 3: Use the helper to get the correct ID
        const targetId = getChatTargetId();
        
        if (targetId) {
            params.append('departmentId', targetId);
        }

        // Keep viewerUserId logic if it's an Admin view
        const viewerId = searchParams.get('viewerUserId');
        if (viewerId) params.append('viewerUserId', viewerId);

        const res = await fetch(`/api/chat?${params.toString()}`);
        
        if (res.ok) {
            const data: ApiMessage[] = await res.json();
            
            const formattedMessages: ChatMessage[] = data.map((msg) => {
                const isMe = msg.senderId === user.id;
                return {
                    id: msg.id,
                    sender: isMe ? 'me' : 'other',
                    senderName: isMe ? 'Me' : `${msg.sender.firstName} ${msg.sender.lastName}`,
                    text: msg.content,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
            });
            setMessages(formattedMessages);
        }
    } catch (error) {
        console.error("Chat load error", error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user) return;

    const tempContent = chatInput;
    setChatInput(''); 

    // FIX 4: Use the helper to get the correct ID for POST as well
    const targetId = getChatTargetId();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: tempContent,
                departmentId: targetId, // <--- Corrected here
                viewerUserId: searchParams.get('viewerUserId') 
            })
        });

        if (res.ok) {
            fetchMessages(); 
        } else {
            setChatInput(tempContent); 
            console.error("Failed to send");
        }
    } catch (err) {
        console.error("Send error", err);
        setChatInput(tempContent);
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

  /* ---------------- EFFECTS ---------------- */
  
  useEffect(() => {
    fetchDocs();
  }, [categoryId]);

  useEffect(() => {
    if (!user) return;
    
    fetchMessages(); 
    
    const interval = setInterval(fetchMessages, 5000); 
    return () => clearInterval(interval);
  }, [categoryId, session]); // Refetch if session loads or category changes

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  /* ---------------- RENDER ---------------- */

  if (loadingDocs) {
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
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                 <Typography variant="h6" fontWeight={700} fontSize={16}>
                    {user?.departmentId ? "TEAM CHAT" : "SUPPORT CHAT"}
                 </Typography>
                 <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                    <Typography variant="caption" color="text.secondary">Active</Typography>
                 </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, pr: 1, minHeight: '300px' }}>
                {messages.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography variant="body2" color="text.secondary">Start the conversation...</Typography>
                    </Box>
                ) : (
                    messages.map((msg) => (
                        <Box key={msg.id} sx={{ display: 'flex', flexDirection: msg.sender === 'me' ? 'row-reverse' : 'row', mb: 2, gap: 1 }}>
                            {msg.sender === 'other' && (
                                <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: '#ff7a18' }}>
                                    {msg.senderName.charAt(0)}
                                </Avatar>
                            )}
                            <Box sx={{ maxWidth: '80%' }}>
                            <Paper elevation={0} sx={{ p: 1.5, bgcolor: msg.sender === 'me' ? '#f0f0f0' : '#fff', border: '1px solid #eee', borderRadius: 2 }}>
                                <Typography fontSize={14}>{msg.text}</Typography>
                            </Paper>
                            <Typography variant="caption" color="text.secondary" display="block" textAlign={msg.sender === 'me' ? 'right' : 'left'} mt={0.5}>
                                {msg.timestamp}
                            </Typography>
                            </Box>
                        </Box>
                    ))
                )}
                <div ref={chatEndRef} />
              </Box>

              <Box sx={{ mt: 'auto' }}>
                 <TextField
                   fullWidth
                   multiline
                   rows={2}
                   placeholder="Type a message..."
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSendMessage();
                       }
                   }}
                   sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f9f9f9' } }}
                 />
                 <Box display="flex" justifyContent="space-between" mt={1}>
                    <IconButton size="small"><AttachFileIcon /></IconButton>
                    <Button 
                      variant="contained" 
                      size="small" 
                      endIcon={<SendIcon />}
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
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

      {/* FOOTER */}
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
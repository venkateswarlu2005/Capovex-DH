'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Paper
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

/* ================= TYPES ================= */

type Channel = {
  id: string;
  title: string;
  type: 'PRIVATE_SUPPORT' | 'DEPT_ROOM';
  departmentId: string;
  viewerUserId?: string;
  lastMessage: string;
};

type Message = {
  id: string;
  content: string;
  senderId: string; // IMPORTANT
  sender: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  createdAt?: string;
};

/* ================= COMPONENT ================= */

export default function AdminChatPage() {
  const { data: session } = useSession();
  const myUserId = session?.user?.id;

  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ========== LOAD INBOX ========== */
  useEffect(() => {
    fetch('/api/chat/channels')
      .then(res => res.json())
      .then(setChannels);
  }, []);

  /* ========== LOAD MESSAGES ========== */
  useEffect(() => {
    if (!activeChannel) return;

    const params = new URLSearchParams({
      departmentId: activeChannel.departmentId
    });

    if (activeChannel.viewerUserId) {
      params.append('viewerUserId', activeChannel.viewerUserId);
    }

    fetch(`/api/chat?${params}`)
      .then(res => res.json())
      .then(setMessages);
  }, [activeChannel]);

  /* ========== AUTO SCROLL ========== */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ========== SEND MESSAGE ========== */
  const sendMessage = async () => {
    if (!input.trim() || !activeChannel) return;

    const content = input;
    setInput('');

    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        departmentId: activeChannel.departmentId,
        viewerUserId: activeChannel.viewerUserId
      })
    });

    const params = new URLSearchParams({
      departmentId: activeChannel.departmentId
    });
    if (activeChannel.viewerUserId) {
      params.append('viewerUserId', activeChannel.viewerUserId);
    }

    const res = await fetch(`/api/chat?${params}`);
    setMessages(await res.json());
  };

  /* ================= RENDER ================= */

  return (
    <Box display="flex" height="100%" bgcolor="#fafafa">

      {/* ================= INBOX ================= */}
      <Paper sx={{ width: 320, borderRight: '1px solid #ddd' }}>
        <Typography p={2} fontWeight={700}>
          Inbox
        </Typography>
        <Divider />
        <List disablePadding>
          {channels.map(ch => (
            <ListItemButton
              key={ch.id}
              selected={activeChannel?.id === ch.id}
              onClick={() => setActiveChannel(ch)}
            >
              <ListItemText
                primary={ch.title}
                secondary={ch.lastMessage}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      {/* ================= CHAT ================= */}
      <Box flex={1} display="flex" flexDirection="column">

        {!activeChannel ? (
          <Typography m="auto" color="text.secondary">
            Select a conversation
          </Typography>
        ) : (
          <>
            {/* HEADER */}
            <Box p={2} borderBottom="1px solid #ddd" bgcolor="#fff">
              <Typography fontWeight={700}>
                {activeChannel.title}
              </Typography>
            </Box>

            {/* MESSAGES */}
            <Box
              flex={1}
              px={2}
              py={1}
              overflow="auto"
              sx={{ backgroundColor: '#f5f5f5' }}
            >
              {messages.length === 0 ? (
                <Box
                  height="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography color="text.secondary">
                    Start the conversation…
                  </Typography>
                </Box>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === myUserId;

                  return (
                    <Box
                      key={msg.id}
                      display="flex"
                      justifyContent={isMe ? 'flex-end' : 'flex-start'}
                      mb={2}
                      gap={1}
                    >
                      {/* Avatar only for OTHER user */}
                      {!isMe && (
                        <Avatar
                          src={msg.sender.avatarUrl}
                          sx={{ width: 32, height: 32, bgcolor: '#ff7a18' }}
                        >
                          {msg.sender.firstName?.charAt(0)}
                        </Avatar>
                      )}

                      <Box maxWidth="70%">
                        <Paper
                          elevation={0}
                          sx={{
                            px: 2,
                            py: 1.2,
                            borderRadius: 2,
                            bgcolor: isMe ? '#dcf8c6' : '#ffffff',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          {!isMe && (
                            <Typography
                              variant='h2'
                              fontWeight={600}
                              color="text.secondary"
                            >
                              {msg.sender.firstName}
                            </Typography>
                          )}
                          <Typography variant='h2'>
                            {msg.content}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </Box>

            {/* INPUT */}
            <Box p={2} borderTop="1px solid #ddd" bgcolor="#fff">
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Type a message…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#f9f9f9'
                  }
                }}
              />

              <Box display="flex" justifyContent="flex-end" mt={1}>
                <IconButton
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  sx={{
                    bgcolor: '#ff7a18',
                    color: '#fff',
                    '&:hover': { bgcolor: '#e56a10' }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

'use client';

import { Box, Typography, Button, Paper, Container } from '@mui/material';
import ShieldMoonOutlinedIcon from '@mui/icons-material/ShieldMoonOutlined';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

export default function NoAccessPage() {
  const PRIMARY_ORANGE = '#F36C24';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F9F9F9 0%, #F5F1EB 100%)',
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 8 },
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Branding */}
        <Box mb={4} display="flex" justifyContent="center" alignItems="center" gap={1.5}>
          <Image src="/branding/logo.svg" alt="Logo" width={40} height={40} />
          <Typography variant="h5" fontWeight={900} color={PRIMARY_ORANGE}>
            Dataroom
          </Typography>
        </Box>

        {/* Illustration Icon */}
        <Box sx={{ mb: 3 }}>
          <ShieldMoonOutlinedIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
        </Box>

        <Typography variant="h4" fontWeight={800} gutterBottom>
          Access Restricted
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          Your account is currently active, but you haven&apos;t been assigned access to any specific 
          document categories yet. Please contact your <b>Master Admin</b> or 
          Department Manager to request access.
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => window.location.reload()}
            sx={{
              py: 1.5,
              bgcolor: PRIMARY_ORANGE,
              fontWeight: 700,
              '&:hover': { bgcolor: '#D95218' },
            }}
          >
            Refresh Access
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            onClick={() => signOut({ callbackUrl: '/auth/sign-in' })}
            sx={{
              py: 1.5,
              color: 'text.primary',
              borderColor: 'divider',
              fontWeight: 600,
              '&:hover': { borderColor: 'text.primary', bgcolor: 'transparent' },
            }}
          >
            Sign out
          </Button>
        </Box>
      </Paper>

      {/* Footer info */}
      <Typography variant="caption" color="text.disabled" sx={{ mt: 4 }}>
        Secure Enterprise VDR &bull; Capovex Research & Analytics
      </Typography>
    </Box>
  );
}
'use client';

import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { AlertCircleIcon } from '@/icons';

export default function NotFound() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ same guard pattern as Sidebar
  if (status === 'loading') return null;
  if (!session?.user?.role) return null;

  const handleRedirect = () => {
    switch (session.user.role) {
      case 'MASTER_ADMIN':
        router.replace('/m_admin/overview');
        break;

      // future roles can go here
      // case 'DEPT_ADMIN':
      //   router.replace('/d_admin/dashboard');
      //   break;

      default:
        // VIEW / VIEW_ONLY user
        router.replace('/v_user/documents');
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      gap={8}
      zIndex={1500}
      pt={40}
      bgcolor="background.content"
    >
      <Box mb={10}>
        <AlertCircleIcon width="5rem" height="auto" />
      </Box>

      <Typography variant="h2" gutterBottom>
        Oops! Page Not Found
      </Typography>

      <Typography variant="subtitle2" mb={4}>
        The page you’re looking for doesn’t exist. It might have been removed,
        or the URL might be incorrect.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={handleRedirect}
      >
        Take me back
      </Button>
    </Box>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';
import Image from 'next/image';

import {
  Box,
  Typography,
  Paper,
  Checkbox,
  Divider,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import { useSession } from 'next-auth/react';

import { FormInput, LoadingButton, NavLink } from '@/components';
import { useAuthQueryToasts, useSignInMutation } from '@/hooks/data';
import { useFormSubmission, useSignInForm } from '@/hooks/forms';
import { UserRole } from '@/shared/enums';

export default function SignIn() {
  /* ================= HOOKS ================= */
  useAuthQueryToasts();

  const router = useRouter();
  const { data: session, status } = useSession();
  const form = useSignInForm();
  const signInMutation = useSignInMutation();

  const {
    register,
    formState: { errors, isValid },
  } = form;

  /* ================= FORM SUBMISSION ================= */
  const { loading, handleSubmit,error } = useFormSubmission({
    mutation: signInMutation,
    getVariables: () => form.getValues(),
    validate: () => isValid,
    successMessage: 'Successfully signed in!',
    // 🚫 NO REDIRECT LOGIC HERE
    onSuccess: () => {},

  });

  /* ================= REDIRECT AFTER SESSION READY ================= */
  useEffect(() => {
    if (status !== 'authenticated') return;

    const role = session?.user?.role;
    const categoryAccess = (session?.user as any)?.categoryAccess ?? [];

    if (!role) return;

    if (role === UserRole.ViewOnlyUser) {
      if (categoryAccess.length > 0) {
        router.replace(
          `/v_user/documents?categoryId=${categoryAccess[0].category.id}`,
        );
      } else {
        router.replace('/v_user/no-access');
      }
      return;
    }

    if (role === UserRole.MasterAdmin) {
      router.replace('/m_admin/overview');
    } else if (role === UserRole.DeptAdmin) {
      router.replace('/d_admin');
    } else if (role === UserRole.DeptUser) {
      router.replace('/d_user');
    }
  }, [status, session, router]);

  /* ================= CONSTANTS ================= */
  const PRIMARY_ORANGE = '#F36C24';

  /* ================= LOADING STATE ================= */
  if (status === 'loading') {
    return <Box minHeight="100vh" />;
  }
  return (
    <Box
      display="flex"
      minHeight="100vh"
      flexDirection={{ xs: 'column', md: 'row' }}
      sx={{ background: 'linear-gradient(135deg, #f9f9f9 0%, #f1e2ca 100%)' }}
    >
      {/* ================= LEFT PANEL ================= */}
     <Box
        flex={{ md: 2 }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        // Changed from specific 'pl' to general padding for better centering
        sx={{ p: { xs: 6, md: 10, lg: 15 } }}
      >
        <Box maxWidth={750}>
          
          {/* Logo Section - Increased margin bottom */}
          <Box mb={10} display="flex" justifyContent="center" alignItems="center" gap={3}>
            <Image
              src="/branding/logo.svg"
              alt="Logo"
              width={45} // Slightly larger logo
              height={45}
              style={{ objectFit: 'contain' }}
            />
            <Box textAlign="left" pb={1}>
              <Typography variant="h1" fontWeight={900} color={PRIMARY_ORANGE} lineHeight={1}>
                Manthan
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" fontStyle="italic" lineHeight={1} mt={0.5}>
                Secure Enterprise Login
              </Typography>
            </Box>
          </Box>

          {/* Body Text - Increased line height and margin */}
          <Typography 
            paragraph 
            sx={{ fontSize: "1rem !important" }} // Slightly larger font
            color="text.secondary" 
            lineHeight={1.8} // More breathing room between lines
            mb={10} // Increased space before badge
          >
            This is a private, secure virtual data room (VDR) belonging to Capovex Research <br />
            & Analytics Pvt Ltd. Access is restricted to authorized users only. All activities,<br /> 
            file views, and downloads are monitored and logged. Unauthorized access or <br /> 
            misuse of this system is strictly prohibited. By logging in, <br />
            you agree to the confidentiality terms.
          </Typography>

          {/* Encryption Badge - Increased padding and margin */}
          <Box display="flex" justifyContent="center" mb={12}>
            <Box
              display="flex"
              alignItems="center"
              gap={2}
              px={6} // Wider pill
              py={4} // Taller pill
              borderRadius={50}
              border={`1px solid ${PRIMARY_ORANGE}`}
              bgcolor="#FFF5F0"
            >
              <ShieldIcon sx={{ color: PRIMARY_ORANGE, fontSize: 30 }} />
              <Typography fontSize={15} fontWeight={700} color={PRIMARY_ORANGE} letterSpacing="0.05em">
                256-BIT AES ENCRYPTION
              </Typography>
            </Box>
          </Box>

          {/* Footer Section - Added more spacing */}
          <Box display="flex" flexDirection="column" alignItems="center" py={8} >
            <Typography fontSize="1rem" color="text.secondary" mt={8} mb={1}>
              Powered by
            </Typography>
            <Box mt={1}>
              <Image
                src="/branding/Brand.png"
                alt="Capovex"
                width={180}
                height={66}
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Stack direction="row" sx={{ gap: '3rem', mt: '2rem' }}>
              {['Privacy Policy', 'Terms of Service', 'Support'].map((text) => (
                <MuiLink key={text} href="#" underline="hover" color={PRIMARY_ORANGE} fontSize="1rem" fontWeight={500}>
                  {text}
                </MuiLink>
              ))}
            </Stack>
          </Box>
        </Box>
      </Box>
      {/* ================= RIGHT PANEL ================= */}
      <Box flex={{ md: 2 }} display="flex" alignItems="center" justifyContent="center" pr={{ xs: 14, md: 28 }}>
        <Paper
          elevation={18}
          sx={{
            width: '60%',
            maxWidth: 500,
             minHeight: '55vh',
            p: 25,
            borderRadius: 10,
          }}
        > 
<Box mb={20}>
  <Typography 
    py={3} 
    variant="h1" 
    fontWeight={700} 
    sx={{ 
      fontFamily: '"Public Sans", sans-serif',
      // Add responsive font sizes here
      fontSize: { xs: '1rem', md: '1.25rem', lg: '1.65rem' } 
    }} 
  >
    Sign in
  </Typography>

  <Typography 
    py={3} 
    variant="h3"  
    fontWeight={100} 
    color="text.secondary" 
    sx={{ 
      fontFamily: '"Public Sans", sans-serif',
      // Increase subtitle size
      fontSize: { xs: '0.75rem', md: '0.85rem', lg: '.95rem' }
    }}
  >
    Please login to continue to your account.
  </Typography>
</Box>
          <FormProvider {...form}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              display="flex"
              flexDirection="column"
              gap={15}
            >
              {error && (
  <Paper
    sx={{
      bgcolor: '#FFF4F2',
      border: '1px solid #F36C24',
      p: 3,
      borderRadius: 4,
      mb: 6,
    }}
  >
    <Typography color="#D84315" fontWeight={600} fontSize={20}>
      {error}
    </Typography>
  </Paper>
)}

              <FormInput
                label="Email Address"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                {...register('email')}
                sx={{ mt: -15 }}
                errorMessage={errors.email?.message}
              />

              <FormInput
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                sx={{mt:-15}}
                errorMessage={errors.password?.message}
              />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <Checkbox size="large" />
                  <Typography fontSize={26}>Remember this device</Typography>
                </Box>
                <NavLink href="/auth/forgot-password" linkText="Forgot password?" fontSize={22} />
              </Box>

              <LoadingButton
                type="submit"
                loading={loading}
                disabled={!isValid}
                buttonText="Secure Sign In"
                loadingText="Signing in..."
                sx={{
                  py: 4,
                  fontSize: 26,
                  borderRadius: 6,
                  fontWeight: 900,
                  bgcolor: PRIMARY_ORANGE,
                  '&:hover': { bgcolor: '#D95218' },
                }}
              />

              <Divider sx={{ my: 5 }} />

              <Typography textAlign="center" fontSize={26}>
                Need an account?{' '}
                <NavLink href="/auth/sign-up" linkText="Request Access" display="inline-flex" fontWeight={900} fontSize={26} />
              </Typography>
            </Box>
          </FormProvider>
        </Paper>
      </Box>
    </Box>
  );
}
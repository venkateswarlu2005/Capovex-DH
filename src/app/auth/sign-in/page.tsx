'use client';

import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';
import Image from 'next/image';
// At the top of your files
import { Document, CategoryInfo } from '@/shared/enums';
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
  // 1. ALL HOOKS MUST BE AT THE TOP
  useAuthQueryToasts();
  const router = useRouter();
  const { status, update: refreshSession } = useSession();
  const form = useSignInForm();
  const signInMutation = useSignInMutation();

  const {
    register,
    formState: { errors, isValid },
  } = form;

  const { loading, handleSubmit } = useFormSubmission({
    mutation: signInMutation,
    getVariables: () => form.getValues(),
    validate: () => isValid,
    successMessage: 'Successfully signed in! Redirecting…',
   // Inside your SignIn component, update the onSuccess handler:

onSuccess: async () => {
  const updatedSession = await refreshSession();

  const role = updatedSession?.user?.role;

  // 👉 read categoryAccess safely (no typings, no errors)
  const categoryAccess =
    (updatedSession?.user as any)?.categoryAccess ?? [];
   console.log(categoryAccess);
  // 🔹 VIEW ONLY USER → FIRST CATEGORY
  if (role === UserRole.ViewOnlyUser) {
    if (categoryAccess.length > 0) {
      const firstCategoryId = categoryAccess[0].category.id;
      router.replace(`/v_user/documents?categoryId=${firstCategoryId}`);
    } else {
      router.replace('/v_user/no-access');
    }
    return;
  }

  // 🔹 OTHER ROLES
  if (role === UserRole.MasterAdmin) {
    router.replace('/m_admin/overview');
  } else if (role === UserRole.DeptAdmin) {
    router.replace('/d_admin');
  } else if (role === UserRole.DeptUser) {
    router.replace('/d_user');
  }
},

  });

  const PRIMARY_ORANGE = '#F36C24';

  // 2. ONLY RETURN EARLY AFTER ALL HOOKS ARE DEFINED
  if (status === 'loading') {
    return null; // Or a full-page loading spinner
  }
  return (
    <Box
      display="flex"
      minHeight="100vh"
      flexDirection={{ xs: 'column', md: 'row' }}
      sx={{ background: 'linear-gradient(135deg, #F9F9F9 0%, #F5F1EB 100%)' }}
    >
      {/* ================= LEFT PANEL ================= */}
      <Box
        flex={{ md: 4 }}
        pl={{ xs: 10, md: 20, lg: 30 }}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
      >
        <Box maxWidth={900}>
          <Box mb={6} display="flex" justifyContent="center" alignItems="center" gap={2}>
            <Image
              src="/branding/logo.svg"
              alt="Logo"
              width={45}
              height={45}
              style={{ objectFit: 'contain' }}
            />
            <Box textAlign="left">
              <Typography variant="h1" fontWeight={900} color={PRIMARY_ORANGE} lineHeight={1}>
                Dataroom
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" fontStyle="italic" lineHeight={1}>
                Secure Enterprise Login
              </Typography>
            </Box>
          </Box>

          <Typography fontSize="3rem" color="text.secondary" lineHeight={1.7} paragraph mb={6}>
            This is a private, secure virtual data room (VDR) belonging to Capovex Research & Analytics Pvt Ltd. Access is restricted to authorized users only. All activities, file views, and downloads are monitored and logged. Unauthorized access or misuse of this system is strictly prohibited and may result in legal action.
          </Typography>

          <Box display="flex" justifyContent="center" mb={10}>
            <Box
              display="flex"
              alignItems="center"
              gap={1.5}
              px={4}
              py={3}
              borderRadius={50}
              border={`1px solid ${PRIMARY_ORANGE}`}
              bgcolor="#FFF5F0"
            >
              <ShieldIcon sx={{ color: PRIMARY_ORANGE }} />
              <Typography fontSize={14} fontWeight={700} color={PRIMARY_ORANGE} letterSpacing="0.05em">
                256-BIT AES ENCRYPTION
              </Typography>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography fontSize="1rem" color="text.secondary" mb={1}>
              Powered by
            </Typography>
            <Box mb={4}>
              <Image
                src="/branding/capovex-logo.png"
                alt="Capovex"
                width={140}
                height={60}
                style={{ objectFit: 'contain' }}
              />
            </Box>
            <Stack direction="row" sx={{ gap: '5rem', mt: '2rem' }}>
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
      <Box flex={{ md: 6 }} display="flex" alignItems="center" justifyContent="center" pr={{ xs: 14, md: 28 }}>
        <Paper
          elevation={18}
          sx={{
            width: '50%',
            maxWidth: 500,
            p: 14,
            borderRadius: 8,
          }}
        >
          <FormProvider {...form}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              display="flex"
              flexDirection="column"
              gap={10}
            >
              <FormInput
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                {...register('email')}
                errorMessage={errors.email?.message}
              />

              <FormInput
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
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
                Don&apos;t have an account?{' '}
                <NavLink href="/auth/sign-up" linkText="Sign up" display="inline-flex" fontWeight={900} fontSize={26} />
              </Typography>
            </Box>
          </FormProvider>
        </Paper>
      </Box>
    </Box>
  );
}
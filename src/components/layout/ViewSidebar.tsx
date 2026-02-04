'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Stack,
  alpha,
} from '@mui/material';

// Icons
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';

import DropdownMenu from './DropdownMenu';

const BRAND_COLOR = '#FF5630';

export default function ViewSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get('categoryId');

  const { data: session } = useSession();

  // 🔑 Categories come from session (aligned with SignIn)
  const categoryAccess =
    (session?.user as any)?.categoryAccess ?? [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: { sm: '11rem', md: '16rem', lg: '18rem' },
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: { sm: '11rem', md: '16rem', lg: '18rem' },
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* -------------------- LOGO -------------------- */}
      <Box
        sx={{
          px: { sm: 4, md: 6 },
          py: { sm: 6, md: 10 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Image
          src="/branding/logo.svg"
          alt="Logo"
          width={36}
          height={36}
          style={{ objectFit: 'contain' }}
        />

        <Box>
          <Box
            sx={{
              fontSize: '20px',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.8px',
              color: '#ed7d22',
              fontFamily: '"Inter","system-ui",sans-serif',
            }}
          >
            Dataroom
          </Box>

          <Box
            sx={{
              fontSize: '12px',
              color: 'text.secondary',
              fontWeight: 600,
              mt: 0.5,
            }}
          >
            VIEWER ACCESS
          </Box>
        </Box>
      </Box>

      {/* -------------------- MENU -------------------- */}
      <Stack spacing={3} sx={{ px: 2 }}>
        {/* ---------- PERSONAL SPACE ---------- */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              px: 4,
              mb: 1,
              display: 'block',
              fontWeight: 700,
              color: 'text.disabled',
              textTransform: 'uppercase',
            }}
          >
            Personal Space
          </Typography>

          <List disablePadding>
            <ListItem disablePadding sx={{ mb: { sm: 1, md: 2, lg: 4 } }}>
              <Link
                href="/v_user/documents"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                <ListItemButton
                  selected={pathname === '/v_user/documents' && !currentCategoryId}
                  disableRipple
                  sx={{
                    px: 4,
                    py: { sm: 3, md: 4, lg: 6 },
                    borderLeft: 3,
                    borderLeftColor: 'transparent',

                    '&.Mui-selected': {
                      borderLeftColor: BRAND_COLOR,
                      color: BRAND_COLOR,
                      backgroundColor: 'transparent',
                    },

                    '&:hover': {
                      backgroundColor: alpha(BRAND_COLOR, 0.06),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      pr: 2,
                      color:
                        pathname === '/v_user/documents' && !currentCategoryId
                          ? BRAND_COLOR
                          : 'text.secondary',
                      '.MuiSvgIcon-root': { fontSize: '1.3rem' },
                    }}
                  >
                    <DashboardOutlinedIcon />
                  </ListItemIcon>

                  <ListItemText
                    primary="All My Files"
                    slotProps={{
                      primary: { variant: 'h3' },
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          </List>
        </Box>

        {/* ---------- MY REPOSITORIES ---------- */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              px: 4,
              mb: 1,
              display: 'block',
              fontWeight: 700,
              color: 'text.disabled',
              textTransform: 'uppercase',
            }}
          >
            My Categories
          </Typography>

          <List disablePadding>
            {categoryAccess.length > 0 ? (
              categoryAccess.map((access: any) => {
                const category = access.category;
                const isActive = currentCategoryId === category.id;
                const href = `/v_user/documents?categoryId=${category.id}`;

                return (
                  <ListItem
                    key={category.id}
                    disablePadding
                    sx={{ mb: { sm: 1, md: 2, lg: 4 } }}
                  >
                    <Link
                      href={href}
                      style={{ width: '100%', textDecoration: 'none' }}
                    >
                      <ListItemButton
                        selected={isActive}
                        disableRipple
                        sx={{
                          px: 4,
                          py: { sm: 3, md: 4, lg: 6 },
                          borderLeft: 3,
                          borderLeftColor: 'transparent',

                          '&.Mui-selected': {
                            borderLeftColor: BRAND_COLOR,
                            color: BRAND_COLOR,
                            backgroundColor: 'transparent',
                          },

                          '&:hover': {
                            backgroundColor: alpha(BRAND_COLOR, 0.06),
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            pr: 2,
                            color: isActive
                              ? BRAND_COLOR
                              : 'text.secondary',
                            '.MuiSvgIcon-root': {
                              fontSize: '1.3rem',
                            },
                          }}
                        >
                          <FolderOpenOutlinedIcon />
                        </ListItemIcon>

                        <ListItemText
                          primary={category.name}
                          slotProps={{
                            primary: {
                              variant: 'h3',
                              noWrap: true,
                              fontWeight: isActive ? 600 : 400,
                            },
                          }}
                        />
                      </ListItemButton>
                    </Link>
                  </ListItem>
                );
              })
            ) : (
              <Typography
                variant="body2"
                sx={{
                  px: 4,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                }}
              >
                No accessible repositories
              </Typography>
            )}
          </List>
        </Box>
      </Stack>

      {/* -------------------- BOTTOM DROPDOWN -------------------- */}
      <Box sx={{ mt: 'auto', px: 2, pb: 3 }}>
        <DropdownMenu />
      </Box>
    </Drawer>
  );
}

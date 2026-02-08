'use client';

import React, { useState } from 'react';
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
  IconButton,
  alpha,
} from '@mui/material';

// Icons
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import DropdownMenu from './DropdownMenu';

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

const BRAND_COLOR = '#FF5630';

const EXPANDED_WIDTH = { sm: '11rem', md: '16rem', lg: '18rem' };
const COLLAPSED_WIDTH = '4.75rem';

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ViewSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategoryId = searchParams.get('categoryId');

  const { data: session } = useSession();
  const categoryAccess = (session?.user as any)?.categoryAccess ?? [];

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
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

        {!collapsed && (
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
              Manthan
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
        )}

        {/* Toggle (no impact on expanded layout) */}
        <IconButton
          onClick={() => setCollapsed((v) => !v)}
          sx={{ ml: 'auto' }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {/* -------------------- MENU -------------------- */}
      <Stack spacing={3} sx={{ px: 2 }}>
        {/* ---------- PERSONAL SPACE ---------- */}
        <Box>
          {!collapsed && (
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
          )}

          <List disablePadding>
            <ListItem disablePadding sx={{ mb: { sm: 1, md: 2, lg: 4 } }}>
              <Link
                href="/v_user/documents"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                <ListItemButton
                  selected={
                    pathname === '/v_user/documents' && !currentCategoryId
                  }
                  disableRipple
                  sx={{
                    px: collapsed ? 2 : 4,
                    py: { sm: 3, md: 4, lg: 6 },
                    justifyContent: collapsed ? 'center' : 'flex-start',
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
                      pr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                      color:
                        pathname === '/v_user/documents' && !currentCategoryId
                          ? BRAND_COLOR
                          : 'text.secondary',
                      '.MuiSvgIcon-root': { fontSize: '1.3rem' },
                    }}
                  >
                    <DashboardOutlinedIcon />
                  </ListItemIcon>

                  {!collapsed && (
                    <ListItemText
                      primary="All My Files"
                      slotProps={{ primary: { variant: 'h3' } }}
                    />
                  )}
                </ListItemButton>
              </Link>
            </ListItem>
          </List>
        </Box>

        {/* ---------- MY CATEGORIES ---------- */}
        <Box>
          {!collapsed && (
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
          )}

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
                          px: collapsed ? 2 : 4,
                          py: { sm: 3, md: 4, lg: 6 },
                          justifyContent: collapsed ? 'center' : 'flex-start',
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
                            pr: collapsed ? 0 : 2,
                            justifyContent: 'center',
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

                        {!collapsed && (
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
                        )}
                      </ListItemButton>
                    </Link>
                  </ListItem>
                );
              })
            ) : (
              !collapsed && (
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
              )
            )}
          </List>
        </Box>
      </Stack>

      {/* -------------------- BOTTOM DROPDOWN -------------------- */}
      <Box sx={{ mt: 'auto', px: 2, pb: 3 }}>
        <DropdownMenu collapsed={collapsed} />
      </Box>
    </Drawer>
  );
}

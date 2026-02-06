'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Stack,
  alpha,
} from '@mui/material';

import Image from 'next/image';

// Icons
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

import DropdownMenu from './DropdownMenu';

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

const BRAND_COLOR = '#FF5630';

const SECTIONS = [
  {
    title: 'Dashboard',
    items: [
      {
        label: 'Overview',
        href: '/m_admin/overview',
        icon: <DashboardOutlinedIcon />,
      },
      {
        label: 'Inbox',
        href: '/m_admin/inbox',
        icon: <MailOutlineIcon />,
      },
    ],
  },
  {
    title: 'Data Structure',
    items: [
      {
        label: 'Departments',
        href: '/m_admin/departments',
        icon: <ApartmentOutlinedIcon />,
      },
   /*   {
        label: 'Documents',
        href: '/admin/documents',
        icon: <DescriptionOutlinedIcon />,
      },*/
    ],
  },
 /* {
    title: 'Management',
    items: [
      {
        label: 'Users & Permission',
        href: '/m_admin/users',
        icon: <GroupOutlinedIcon />,
      },
      {
        label: 'Audit Logs',
        href: '/m_admin/audit-logs',
        icon: <FactCheckOutlinedIcon />,
      },
    ],
  },*/
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function MasterAdminSidebar() {
  const pathname = usePathname();

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

          /* 🔑 THIS enables bottom placement */
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
            Manthan
          </Box>

          <Box
            sx={{
              fontSize: '14px',
              lineHeight: 1.3,
              color: 'text.secondary',
              mt: 0.5,
            }}
          >
            Secure Enterprise Login
          </Box>
        </Box>
      </Box>

      {/* -------------------- MENU -------------------- */}
      <Stack spacing={3} sx={{ px: 2 }}>
        {SECTIONS.map((section) => (
          <Box key={section.title}>
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
              {section.title}
            </Typography>

            <List disablePadding>
              {section.items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <ListItem
                    key={item.label}
                    disablePadding
                    sx={{ mb: { sm: 1, md: 2, lg: 4 } }}
                  >
                    <Link
                      href={item.href}
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
                          borderRadius: 0,

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
                            color: isActive ? '#ED7D22' : 'text.secondary',

                            '.MuiSvgIcon-root': {
                              fontSize: '1.3rem',
                            },
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>

                        <ListItemText
                          primary={item.label}
                          slotProps={{
                            primary: isActive
                              ? { variant: 'h3', color: 'text.icon' }
                              : {
                                  variant: 'h3',
                                  fontWeight: 400,
                                  color: 'text.primary',
                                },
                          }}
                        />

                       
                        
                      </ListItemButton>
                    </Link>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Stack>

      {/* -------------------- BOTTOM DROPDOWN -------------------- */}
      <Box
        sx={{
          mt: 'auto', // 🔥 pushes to bottom
          px: 2,
          pb: 3,
        }}
      >
        <DropdownMenu />
      </Box>
    </Drawer>
  );
}

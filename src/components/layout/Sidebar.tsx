'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, ComponentType } from 'react';
import { useSession } from 'next-auth/react';

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  useMediaQuery,
  useTheme,
  AppBar,
  IconButton,
} from '@mui/material';

import { FileIcon, MenuIcon, SettingsIcon, UserIcon } from '@/icons';
import { UserRole } from '@/shared/enums';

import BlueWaveLogo from './BlueWaveLogo';
import DropdownMenu from './DropdownMenu';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type SidebarItem = {
  text: string;
  href: string;
  icon?: ComponentType<any>;
};

/* -------------------------------------------------------------------------- */
/*  Sidebar Configs                                                           */
/* -------------------------------------------------------------------------- */

// INVESTOR (Admin)
// Update your INVESTOR_MENU to use query params
const INVESTOR_MENU: SidebarItem[] = [
  { text: 'Executive Overview', href: '/documents?category=EXECUTIVE_OVERVIEW' },
  { text: 'Founders & Management', href: '/documents?category=FOUNDERS_MANAGEMENT' },
  { text: 'Company Incorporation & Legal', href: '/documents?category=LEGAL' },
  { text: 'Cap Table & Shareholding', href: '/documents?category=CAP_TABLE' },
  { text: 'Financials Reporting', href: '/documents?category=FINANCIALS' },
  { text: 'Business & Product', href: '/documents?category=BUSINESS_PRODUCT' },
  { text: 'Revenue, Clients & Contracts', href: '/documents?category=REVENUE_CONTRACTS' },
  { text: 'IP & Technology', href: '/documents?category=IP_TECHNOLOGY' },
  { text: 'Compliance & Regulatory', href: '/documents?category=COMPLIANCE' },
  { text: 'Human Resources', href: '/documents?category=HUMAN_RESOURCES' },
  { text: 'Risks & Litigation', href: '/documents?category=RISKS_LITIGATION' },
];

// MANAGER (User / Member)
const MANAGER_MENU: SidebarItem[] = [
  { text: 'Documents', icon: FileIcon, href: '/documents' },
  { text: 'Contacts', icon: UserIcon, href: '/contacts' },
  { text: 'Settings', icon: SettingsIcon, href: '/settings' },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: session, status } = useSession();
  if (status === 'loading') return null;

  const role = session?.user?.role;

  // Your mapping
  const isInvestor = role === UserRole.Admin;
  const isManager = role === UserRole.User || role === UserRole.Member;

  const menuItems = isInvestor ? INVESTOR_MENU : MANAGER_MENU;

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <Box display="flex">
      {isMobile && (
        <AppBar position="static">
          <Toolbar>
            <IconButton onClick={openSidebar} edge="start">
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isOpen}
        onClose={closeSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: { sm: '11rem', md: '16rem', lg: '18rem' },
          '& .MuiDrawer-paper': {
            width: { sm: '11rem', md: '16rem', lg: '18rem' },
            boxSizing: 'border-box',
          },
        }}
      >
        <Stack
          justifyContent="space-between"
          sx={{
            height: '100vh',
            backgroundColor: 'background.fill',
            pt: { xs: 4, sm: 8, md: 16 },
            pb: { xs: 2, sm: 4, md: 10 },
            px: { xs: 2, sm: 4, md: 10 },
          }}
        >
          {/* -------------------- TOP -------------------- */}
          <Box display="flex" flexDirection="column" gap={4}>
            <Box
              component={BlueWaveLogo}
              mx="auto"
              my={{ xs: 0, sm: 1, md: 8 }}
              width={{ sm: '9rem', md: '11rem', lg: '12rem' }}
              height="auto"
            />

            <List>
              {menuItems.map(({ text, icon, href }) => {
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <ListItem
                    key={text}
                    sx={{ mb: { sm: 1, md: 2, lg: 4 } }}
                    disablePadding
                  >
                    <Link
                      href={href}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        width: '100%',
                      }}
                    >
                      <ListItemButton
                        selected={isActive}
                        sx={{
                          px: 4,
                          py: { sm: 3, md: 4, lg: 6 },
                          borderLeft: 3,
                          borderLeftColor: 'transparent',
                          '&.Mui-selected': {
                            borderLeftColor: 'background.primary',
                          },
                        }}
                      >
                        {icon && (
                          <ListItemIcon>
                            <Box
                              component={icon}
                              width={{
                                sm: '1.1rem',
                                md: '1.3rem',
                                lg: '1.5rem',
                              }}
                              height="auto"
                            />
                          </ListItemIcon>
                        )}

                        <ListItemText
                          primary={text}
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

          {/* -------------------- BOTTOM -------------------- */}
         <DropdownMenu />
        </Stack>
      </Drawer>
    </Box>
  );
}

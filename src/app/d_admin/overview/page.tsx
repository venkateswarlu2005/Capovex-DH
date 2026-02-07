'use client';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  IconButton,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';

import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const cardSx = {
  borderRadius: 3,
  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
};

const statIcon = (bg: string, color: string) => ({
  bgcolor: bg,
  color,
  width: 40,
  height: 40,
});

/* -------------------------------------------------------------------------- */
/* Static Data (NO API)                                                       */
/* -------------------------------------------------------------------------- */

const recentActivity = [
  {
    name: 'Q3_Financial_Audit.pdf',
    category: 'Financials',
    action: 'Viewed',
    time: '10 min ago',
  },
  {
    name: 'Frontend_Assets_v2.zip',
    category: 'Web',
    action: 'Downloaded',
    time: '2 hours ago',
  },
  {
    name: 'LLM_Training_Data_Spec.docx',
    category: 'AI Models',
    action: 'Edited',
    time: 'Yesterday',
  },
  {
    name: 'Investor_Relations_Q3.xlsx',
    category: 'General',
    action: 'Viewed',
    time: 'Oct 24, 2023',
  },
];

const quickAccess = [
  { name: 'Web Development', files: 8, iconBg: '#FFF3E0', color: '#FB8C00' },
  { name: 'AI Models', files: 8, iconBg: '#F3E5F5', color: '#AB47BC' },
  { name: 'Financials', files: 8, iconBg: '#E3F2FD', color: '#1E88E5' },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DepartmentAdminOverviewPage() {
  return (
    <Box sx={{ p: 6 }}>
      {/* HEADER */}
      <Stack mb={4}>
        <Typography variant="h1" fontWeight={600}>
          Welcome Back, <span style={{ color: '#ff4d4f' }}>John</span>
        </Typography>
        <Typography variant="h2" color="text.secondary" pb={4}>
          Here's what's happening in your data room today.
        </Typography>
      </Stack>

      {/* TOP STATS */}
      <Grid container spacing={3} mb={4} pb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={cardSx}>
            <CardContent sx={{p:10}}>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" color="text.secondary">
                    ACCESSIBLE FILES
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    142
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +12 new
                  </Typography>
                </Box>
                <IconButton sx={statIcon('#FFF3E0', '#FB8C00')}>
                  <FolderOutlinedIcon />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={cardSx}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" color="text.secondary">
                    RECENT SHARED
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    8
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    This week
                  </Typography>
                </Box>
                <IconButton sx={statIcon('#E3F2FD', '#1E88E5')}>
                  <ShareOutlinedIcon />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={cardSx}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" color="text.secondary">
                    PENDING REQUESTS
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    3
                  </Typography>
                  <Typography variant="caption" color="error.main">
                    Action required
                  </Typography>
                </Box>
                <IconButton sx={statIcon('#FDECEA', '#E53935')}>
                  <HourglassEmptyOutlinedIcon />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MAIN GRID */}
      <Grid container spacing={8}>
        {/* RECENT ACTIVITY */}
        <Grid item xs={12} md={8}>
          <Card sx={cardSx } >
            <CardContent >
              <Stack direction="row" justifyContent="space-between" mb={4}>
                <Typography variant='h2' fontWeight={600}>Recent Activity</Typography>
                <Button size="small">View All</Button>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <Typography variant="h3">DOCUMENT NAME</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h3">CATEGORY</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="h3">ACTION</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="h3">TIME</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 1, pb:3}} />

              {recentActivity.map((item, i) => (
                <Grid container spacing={3} alignItems="center" key={i} sx={{ py: 8 }}>
                  <Grid item xs={5}>
                    <Stack direction="row" spacing={10} alignItems="center">
                      <Avatar sx={{ bgcolor: 'grey.100', color: 'text.primary', width: 32, height: 32 }}>
                        <InsertDriveFileOutlinedIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="h3">{item.name}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={3}>
                    <Chip size="small" label={item.category} />
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">{item.action}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="caption">{item.time}</Typography>
                  </Grid>
                </Grid>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* QUICK ACCESS */}
        <Grid item xs={12} md={4}>
          <Card sx={cardSx}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={4}>
                <Typography fontWeight={600} variant='h2'>Quick Access</Typography>
                <Button size="small">View All</Button>
              </Stack>

              <Stack spacing={8}>
                {quickAccess.map((item) => (
                  <Card key={item.name} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton
                          sx={{
                            bgcolor: item.iconBg,
                            color: item.color,
                          }}
                        >
                          <LayersOutlinedIcon />
                        </IconButton>
                        <Box>
                          <Typography fontWeight={600}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.files} files
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  fullWidth
                  startIcon={<AddOutlinedIcon />}
                  variant="outlined"
                >
                  Browse All Categories
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FOOTER */}
      <Stack alignItems="center" mt={6}>
        <Chip
          label="ACTIVE PROTECTION"
          color="success"
          size="small"
          variant="outlined"
        />
        <Typography variant="caption" color="text.secondary" mt={1}>
          End-to-End Encryption (AES-256) Enabled
        </Typography>
      </Stack>
    </Box>
  );
}

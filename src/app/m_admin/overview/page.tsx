'use client';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
} from '@mui/material';

import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';

/* -------------------------------------------------------------------------- */
/* Shared styles                                                               */
/* -------------------------------------------------------------------------- */

const cardSx = {
  borderRadius: 3,
  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
};

const iconBubble = (color: string) => ({
  bgcolor: `${color}.50`,
  color: `${color}.main`,
  width: 44,
  height: 44,
});

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function MasterAdminOverviewPage() {
  return (
    <Box sx={{ p: 6 }}>
      {/* -------------------- HEADER -------------------- */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={6}
      >
        <Typography variant="h4" fontWeight={600}>
          Dashboard / Overview
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button startIcon={<AddOutlinedIcon />} variant="outlined">
            Create Dept
          </Button>
          <Button startIcon={<UploadFileOutlinedIcon />} variant="outlined">
            Upload File
          </Button>
          <Button startIcon={<AddOutlinedIcon />} variant="outlined">
            New Category
          </Button>
          <Button startIcon={<PersonAddOutlinedIcon />} variant="outlined">
            Invite User
          </Button>
          <Button
            startIcon={<AssessmentOutlinedIcon />}
            variant="outlined"
          >
            Report
          </Button>
        </Stack>
      </Stack>

      {/* -------------------- STATS -------------------- */}
      <Grid container spacing={4} mb={6}>
        {[
          {
            title: 'TOTAL DOCUMENTS',
            value: '1,284',
            sub: '+12 over last week',
            icon: <DescriptionOutlinedIcon />,
            color: 'primary',
          },
          {
            title: 'ACTIVE USERS',
            value: '56',
            sub: '24 currently online',
            icon: <PeopleOutlinedIcon />,
            color: 'success',
          },
          {
            title: 'OPEN REQUESTS',
            value: '14',
            sub: '5 high priority',
            icon: <FolderOutlinedIcon />,
            color: 'warning',
          },
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Card sx={cardSx}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {item.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={
                        item.color === 'warning'
                          ? 'error.main'
                          : 'success.main'
                      }
                    >
                      {item.sub}
                    </Typography>
                  </Box>

                  <IconButton sx={iconBubble(item.color)}>
                    {item.icon}
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* -------------------- MAIN CONTENT -------------------- */}
      <Grid container spacing={4}>
        {/* -------- Department Overview -------- */}
        <Grid item xs={12} md={8}>
          <Card sx={cardSx}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                mb={3}
              >
                <Typography variant="h6" fontWeight={600}>
                  Department Overview
                </Typography>
                <Button size="small">View All Departments</Button>
              </Stack>

              <Grid container spacing={3}>
                {[
                  {
                    name: 'Technology',
                    files: 452,
                    used: 85,
                    icon: <MemoryOutlinedIcon />,
                    color: 'primary',
                  },
                  {
                    name: 'Finance',
                    files: 890,
                    used: 45,
                    icon: <AccountBalanceOutlinedIcon />,
                    color: 'success',
                  },
                  {
                    name: 'Legal',
                    files: 230,
                    used: 60,
                    icon: <GavelOutlinedIcon />,
                    color: 'warning',
                  },
                ].map((dept) => (
                  <Grid item xs={12} md={4} key={dept.name}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Stack direction="row" spacing={2} mb={1}>
                          <IconButton
                            size="small"
                            sx={iconBubble(dept.color)}
                          >
                            {dept.icon}
                          </IconButton>
                          <Box>
                            <Typography fontWeight={600}>
                              {dept.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {dept.files} Files
                            </Typography>
                          </Box>
                        </Stack>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Storage Used
                        </Typography>

                        <LinearProgress
                          variant="determinate"
                          value={dept.used}
                          color={dept.color as any}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        />

                        <Typography
                          variant="caption"
                          sx={{ mt: 0.5, display: 'block' }}
                        >
                          {dept.used}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* -------- Recent Activity -------- */}
          <Card sx={{ ...cardSx, mt: 4 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                mb={3}
              >
                <Typography variant="h6" fontWeight={600}>
                  Recent Activity
                </Typography>
                <Button size="small">View All</Button>
              </Stack>

              <Stack spacing={10}>
                {[
                  {
                    user: 'John Doe',
                    action: 'uploaded',
                    target: 'Financial_Q4.pdf',
                    tag: 'Finance',
                  },
                  {
                    user: 'Admin',
                    action: 'invited',
                    target: 'Sarah Miller',
                    tag: 'General',
                  },
                  {
                    user: 'Legal Team',
                    action: 'accessed',
                    target: 'Merger_Docs.zip',
                    tag: 'Tech',
                  },
                ].map((item, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">
                      <b>{item.user}</b> {item.action}{' '}
                      <span style={{ color: '#2563eb' }}>
                        {item.target}
                      </span>
                    </Typography>

                    <Chip size="small" label={item.tag} />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* -------- Centralized Requests -------- */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                mb={3}
              >
                <Typography variant="h5">Centralized Requests</Typography>
                <Button size="small">Manage All</Button>
              </Stack>

              <Stack spacing={3}>
                {[
                  {
                    type: 'Document Request',
                    title: 'Q3 Financials.pdf',
                    desc: 'Requested from Finance Dept',
                    action1: 'Upload',
                    action2: 'Decline',
                  },
                  {
                    type: 'Category Request',
                    title: 'M&A Due Diligence',
                    desc: 'Create folder for new deal',
                    action1: 'Create',
                    action2: 'Review',
                  },
                  {
                    type: 'User Access Request',
                    title: 'External Auditor Access',
                    desc: 'Access to Finance',
                    action1: 'Approve',
                    action2: 'Deny',
                  },
                ].map((req, i) => (
                  <Card key={i} variant="outlined">
                    <CardContent>
                      <Chip
                        size="small"
                        label={req.type}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="subtitle1">
                        {req.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {req.desc}
                      </Typography>

                      <Stack direction="row" spacing={1} mt={2}>
                        <Button
                          size="small"
                          variant="contained"
                        >
                          {req.action1}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                        >
                          {req.action2}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

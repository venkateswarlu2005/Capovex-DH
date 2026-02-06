'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
} from '@mui/material';

import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
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
  const router = useRouter();

  /* -------------------- Dialog State -------------------- */
  const [openDept, setOpenDept] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  /* -------------------- Data -------------------- */
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    activeUsers: 0,
    openRequests: 0,
  });

  /* -------------------- Forms -------------------- */
  const [deptName, setDeptName] = useState('');
  const [catForm, setCatForm] = useState({
    departmentId: '',
    name: '',
  });

  const [uploadForm, setUploadForm] = useState({
    departmentId: '',
    categoryId: '',
    file: null as File | null,
  });

  /* -------------------- API Calls -------------------- */

  const fetchDepartments = async () => {
    const res = await fetch('/api/departments', { cache: 'no-store' });
    if (res.ok) setDepartments(await res.json());
  };

  const fetchCategories = async (departmentId: string) => {
    const res = await fetch(`/api/categories?departmentId=${departmentId}`, {
      cache: 'no-store',
    });
    if (res.ok) setCategories(await res.json());
  };

  const fetchStats = async () => {
    const res = await fetch('/api/dashboard/stats', { cache: 'no-store' });
    if (res.ok) setStats(await res.json());
  };

  const fetchActivity = async () => {
    const res = await fetch('/api/dashboard/activity', { cache: 'no-store' });
    if (res.ok) setActivities(await res.json());
  };

  const fetchRequests = async () => {
    const res = await fetch('/api/requests', { cache: 'no-store' });
    if (res.ok) setRequests(await res.json());
    else setRequests([]);
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchDepartments(),
      fetchStats(),
      fetchActivity(),
      fetchRequests(),
    ]);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  /* -------------------- Mutations -------------------- */

  const createDepartment = async () => {
    await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: deptName }),
    });
    setDeptName('');
    setOpenDept(false);
    fetchDepartments();
  };

  const createCategory = async () => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catForm),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Create Category Failed:', res.status, err);
      alert(err);
      return;
    }

    setCatForm({ departmentId: '', name: '' });
    setOpenCat(false);
    fetchAllData();
  };

  const uploadDocument = async () => {
    if (!uploadForm.file || !uploadForm.categoryId) return;

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('categoryId', uploadForm.categoryId);

    await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });

    setUploadForm({ departmentId: '', categoryId: '', file: null });
    setOpenUpload(false);
    fetchAllData();
  };

  const updateRequestStatus = async (
    requestId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    const res = await fetch(`/api/requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    fetchAllData();
  };

  /* -------------------------------------------------------------------------- */
  /* UI                                                                         */
  /* -------------------------------------------------------------------------- */

  return (
    <Box sx={{ p: 6 }}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={6}>
        <Typography variant="h1" fontWeight={600}>
          Dashboard / Overview
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button startIcon={<AddOutlinedIcon />} onClick={() => setOpenDept(true)} variant="outlined">
            Create Dept
          </Button>
          <Button startIcon={<UploadFileOutlinedIcon />} onClick={() => setOpenUpload(true)} variant="outlined">
            Upload File
          </Button>
          <Button startIcon={<AddOutlinedIcon />} onClick={() => setOpenCat(true)} variant="outlined">
            New Category
          </Button>
          {/*<Button startIcon={<PersonAddOutlinedIcon />} variant="outlined">
            Invite User
          </Button>
          <Button startIcon={<AssessmentOutlinedIcon />} variant="outlined">
            Report
          </Button>*/}
        </Stack>
      </Stack>

      {/* STATS */}
      <Grid container spacing={4} mb={6}>
        {[
          { title: 'TOTAL DOCUMENTS', value: stats.totalDocuments, icon: <DescriptionOutlinedIcon />, color: 'primary' },
          { title: 'ACTIVE USERS', value: stats.activeUsers, icon: <PeopleOutlinedIcon />, color: 'success' },
          { title: 'OPEN REQUESTS', value: stats.openRequests, icon: <FolderOutlinedIcon />, color: 'warning' },
        ].map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Card sx={cardSx}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption">{item.title}</Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {item.value}
                    </Typography>
                  </Box>
                  <IconButton sx={iconBubble(item.color)}>{item.icon}</IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
             <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={cardSx}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h2" fontWeight={600}>Department Overview</Typography>
                <Button size="small" onClick={() => router.push('/m_admin/departments')}>
                  View All Departments
                </Button>
              </Stack>
              <Grid container spacing={3}>
                {departments.map((dept) => (
                  <Grid item xs={12} md={4} key={dept.id}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Stack direction="row" spacing={2} mb={1}>
                          <IconButton size="small" sx={iconBubble('primary')}><MemoryOutlinedIcon /></IconButton>
                          <Box>
                            <Typography fontWeight={600}>{dept.name}</Typography>
                            <Typography variant="caption">{dept._count?.categories ?? 0} Categories</Typography>
                          </Box>
                        </Stack>
                        <Typography variant="caption">Storage Used</Typography>
                        <LinearProgress variant="determinate" value={dept.storageUsed ?? 0} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ ...cardSx, mt: 4 }}>
            <CardContent>
              <Typography variant="h2" fontWeight={600} mb={3}>Recent Activity</Typography>
              <Stack spacing={3}>
                {activities.map((item) => (
                  <Stack key={item.id} direction="row" spacing={2} alignItems="center">
                    <Avatar src={item.avatar || undefined}>{item.user?.[0]}</Avatar>
                    <Box flex={1}>
                      <Typography variant="body2"><b>{item.user}</b> {item.action}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.details}</Typography>
                    </Box>
                    <Typography variant="caption">{new Date(item.timestamp).toLocaleDateString()}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={cardSx}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h2" fontWeight={600}>Centralized Requests</Typography>
              </Stack>
              <Stack spacing={2}>
                {requests.length === 0 && <Typography variant="caption" color="text.secondary">No pending requests</Typography>}
                {requests.map((req) => (
                  <Card key={req.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Chip size="small" label={req.type} color="primary" variant="outlined" sx={{ mb: 1 }} />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {req.details?.categoryName || req.title || "Request"}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        By: {req.requester?.firstName} {req.requester?.lastName}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={2}>
                        <Button size="small" variant="contained" onClick={() => updateRequestStatus(req.id, 'APPROVED')}>Approve</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => updateRequestStatus(req.id, 'REJECTED')}>Deny</Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
         {/* ==================== DIALOGS ==================== */}
      {/* Create Department Dialog */}
       <Dialog open={openDept} onClose={() => setOpenDept(false)}>
        <DialogTitle>Create New Department</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Department Name" value={deptName} onChange={(e) => setDeptName(e.target.value)} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDept(false)}>Cancel</Button>
          <Button variant="contained" onClick={createDepartment}>Create</Button>
        </DialogActions>
      </Dialog>
      {/* CREATE CATEGORY DIALOG */}
      <Dialog open={openCat} onClose={() => setOpenCat(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <TextField
              select
              fullWidth
              label="Select Department"
              value={catForm.departmentId}
              onChange={(e) =>
                setCatForm({ ...catForm, departmentId: e.target.value })
              }
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Category Name"
              value={catForm.name}
              onChange={(e) =>
                setCatForm({ ...catForm, name: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCat(false)}>Cancel</Button>
          <Button variant="contained" onClick={createCategory}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
       {/* Upload Dialog */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField select fullWidth label="Department" value={uploadForm.departmentId} onChange={(e) => {
              setUploadForm({ ...uploadForm, departmentId: e.target.value });
              fetchCategories(e.target.value);
            }}>
              {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Category" value={uploadForm.categoryId} onChange={(e) => setUploadForm({ ...uploadForm, categoryId: e.target.value })}>
              {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <Button variant="outlined" component="label">
              Select File
              <input type="file" hidden onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })} />
            </Button>
            {uploadForm.file && <Typography variant="caption">{uploadForm.file.name}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button variant="contained" onClick={uploadDocument}>Upload</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

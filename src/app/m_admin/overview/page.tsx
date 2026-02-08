'use client';

import { useState } from 'react';
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
import { useCreateUser } from '@/hooks/m_admin/mutations/useCreateUser';

import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';

/* ================= HOOKS ================= */

import { useDepartments } from '@/hooks/m_admin/queries/useDepartments';
import {
  useDashboardStats,
  useDashboardActivity,
} from '@/hooks/m_admin/queries/useDashboard';
import * as DashboardHooks from '@/hooks/m_admin/queries/useDashboard';

console.log('DashboardHooks:', DashboardHooks);

import { useRequests } from '@/hooks/m_admin/queries/useRequests';

import { useCreateDepartment } from '@/hooks/m_admin/mutations/useCreateDepartment';
import { useCreateCategory } from '@/hooks/m_admin/mutations/useCreateCategory';
import { useUploadDocument } from '@/hooks/m_admin/mutations/useUploadDocument';
import { useApproveRequest } from '@/hooks/m_admin/mutations/useApproveRequest';
import { useCategories } from '@/hooks/m_admin/queries/useCategories';

/* ================= STYLES ================= */

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

/* ================= PAGE ================= */

export default function MasterAdminOverviewPage() {
  const router = useRouter();

  /* ---------- Dialog State ---------- */
  const [openDept, setOpenDept] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);

  /* ---------- Form State ---------- */
  const [deptName, setDeptName] = useState('');
  const [catForm, setCatForm] = useState({ departmentId: '', name: '' });
  const [uploadForm, setUploadForm] = useState({
    departmentId: '',
    categoryId: '',
    file: null as File | null,
  });

  /* ---------- Queries ---------- */
  const { data: departments = [] } = useDepartments();
  const { data: stats } = useDashboardStats();
  const { data: activities = [] } = useDashboardActivity();
  const { data: requests = [] } = useRequests();
  const { data: categories = [] } = useCategories(uploadForm.departmentId);

  /* ---------- Mutations ---------- */
  const createDepartment = useCreateDepartment();
  const createCategory = useCreateCategory();
  const uploadDocument = useUploadDocument();
  const approveRequest = useApproveRequest();
  const createUser = useCreateUser();

  /* ---------- Create User Dialog ---------- */
const [openUser, setOpenUser] = useState(false);

const [userForm, setUserForm] = useState({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'DEPT_USER',
  departmentId: '',
});

  /* ================= UI ================= */

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
          <Button startIcon={<AddOutlinedIcon />} onClick={() => setOpenUser(true)} variant="outlined">
    Create User
  </Button>
        </Stack>
      </Stack>

      {/* STATS */}
      <Grid container spacing={4} mb={6}>
        {[
          { title: 'TOTAL DOCUMENTS', value: stats?.totalDocuments ?? 0, icon: <DescriptionOutlinedIcon />, color: 'primary' },
          { title: 'ACTIVE USERS', value: stats?.activeUsers ?? 0, icon: <PeopleOutlinedIcon />, color: 'success' },
          { title: 'OPEN REQUESTS', value: stats?.openRequests ?? 0, icon: <FolderOutlinedIcon />, color: 'warning' },
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
        {/* LEFT */}
        <Grid item xs={12} md={8}>
          <Card sx={cardSx}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h2" fontWeight={600}>
                  Department Overview
                </Typography>
                <Button size="small" onClick={() => router.push('/m_admin/departments')}>
                  View All Departments
                </Button>
              </Stack>

              <Grid container spacing={3}>
  {departments.slice(0, 9).map((dept: any) => (

                  <Grid item xs={12} md={4} key={dept.id}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Stack direction="row" spacing={2} mb={1}>
                          <IconButton size="small" sx={iconBubble('primary')}>
                            <MemoryOutlinedIcon />
                          </IconButton>
                          <Box>
                            <Typography fontWeight={600}>{dept.name}</Typography>
                            <Typography variant="caption">
                              {dept._count?.categories ?? 0} Categories
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography variant="caption">Storage Used</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={dept.storageUsed ?? 0}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ ...cardSx, mt: 4 }}>
            <CardContent>
              <Typography variant="h2" fontWeight={600} mb={3}>
                Recent Activity
              </Typography>
              <Stack spacing={3}>
                {activities.map((item: any) => (
                  <Stack key={item.id} direction="row" spacing={2} alignItems="center">
                    <Avatar src={item.avatar || undefined}>{item.user?.[0]}</Avatar>
                    <Box flex={1}>
                      <Typography variant="body2">
                        <b>{item.user}</b> {item.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.details}
                      </Typography>
                    </Box>
                    <Typography variant="caption">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT */}
        <Grid item xs={12} md={4}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="h2" fontWeight={600} mb={3}>
                Centralized Requests
              </Typography>
              <Stack spacing={2}>
                {requests.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    No pending requests
                  </Typography>
                )}

                {requests.map((req: any) => (
                  <Card key={req.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Chip size="small" label={req.type} variant="outlined" sx={{ mb: 1 }} />
                      <Typography fontWeight={700}>
                        {req.details?.categoryName || req.title || 'Request'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        By: {req.requester?.firstName} {req.requester?.lastName}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={2}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() =>
                            approveRequest.mutate({ id: req.id, status: 'APPROVED' })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            approveRequest.mutate({ id: req.id, status: 'REJECTED' })
                          }
                        >
                          Deny
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

      {/* ================= DIALOGS ================= */}

      {/* CREATE DEPARTMENT */}
      <Dialog open={openDept} onClose={() => setOpenDept(false)}>
        <DialogTitle>Create New Department</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Department Name"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDept(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              createDepartment.mutate({ name: deptName });
              setOpenDept(false);
              setDeptName('');
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE CATEGORY */}
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
              {departments.map((d: any) => (
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
          <Button
            variant="contained"
            onClick={() => {
              createCategory.mutate(catForm);
              setOpenCat(false);
              setCatForm({ departmentId: '', name: '' });
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* UPLOAD DOCUMENT */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <TextField
              select
              fullWidth
              label="Department"
              value={uploadForm.departmentId}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, departmentId: e.target.value })
              }
            >
              {departments.map((d: any) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Category"
              value={uploadForm.categoryId}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, categoryId: e.target.value })
              }
            >
              {categories.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            <Button component="label" variant="outlined">
              Select File
              <input
                hidden
                type="file"
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    file: e.target.files?.[0] || null,
                  })
                }
              />
            </Button>

            {uploadForm.file && (
              <Typography variant="caption">{uploadForm.file.name}</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (uploadForm.file && uploadForm.categoryId) {
                uploadDocument.mutate({
                  file: uploadForm.file,
                  categoryId: uploadForm.categoryId,
                });
              }
              setOpenUpload(false);
              setUploadForm({ departmentId: '', categoryId: '', file: null });
            }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
      {/* CREATE USER */}
<Dialog open={openUser} onClose={() => setOpenUser(false)} fullWidth maxWidth="sm">
  <DialogTitle>Create New User</DialogTitle>

  <DialogContent>
    <Stack spacing={8} mt={4}>
      <TextField
        label="Email"
        fullWidth
        value={userForm.email}
        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
      />

      <TextField
        label="Temporary Password"
        type="password"
        fullWidth
        value={userForm.password}
        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
      />

      <TextField
        label="First Name"
        fullWidth
        value={userForm.firstName}
        onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
      />

      <TextField
        label="Last Name"
        fullWidth
        value={userForm.lastName}
        onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
      />

      <TextField
        select
        label="Role"
        fullWidth
        value={userForm.role}
        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
      >
        <MenuItem value="DEPT_ADMIN">Dept Admin</MenuItem>
        <MenuItem value="DEPT_USER">Dept User</MenuItem>
        <MenuItem value="VIEW_ONLY_USER">Viewer</MenuItem>
      </TextField>

      <TextField
        select
        label="Department"
        fullWidth
        value={userForm.departmentId}
        onChange={(e) =>
          setUserForm({ ...userForm, departmentId: e.target.value })
        }
      >
        {departments.map((d: any) => (
          <MenuItem key={d.id} value={d.id}>
            {d.name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenUser(false)}>Cancel</Button>

    <Button
      variant="contained"
      disabled={createUser.isPending}
      onClick={() => {
        createUser.mutate(userForm);
        setOpenUser(false);
        setUserForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'DEPT_USER',
          departmentId: '',
        });
      }}
    >
      {createUser.isPending ? 'Creating...' : 'Create User'}
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
}

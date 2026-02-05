'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Divider,
  TextField,
  Avatar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import GroupIcon from '@mui/icons-material/Group';
import StorageIcon from '@mui/icons-material/Storage';
import SearchIcon from '@mui/icons-material/Search';

const getStatIcon = (type: string) => {
  switch (type) {
    case 'folder': return <FolderIcon color="primary" />;
    case 'users': return <GroupIcon color="secondary" />;
    case 'storage': return <StorageIcon color="success" />;
    default: return <FolderIcon />;
  }
};

const mapRoleToDisplay = (dbRole: string) => {
  switch (dbRole) {
    case 'DEPT_ADMIN': return 'Dept Admin';
    case 'DEPT_USER': return 'Dept User'
    case 'MASTER_ADMIN': return 'Master Admin';
    default: return 'Viewer';
  }
};

export default function DepartmentSlugPage() {
  const params = useParams();
  const router = useRouter();   
  const slug = params?.slug ? String(params.slug) : '';

  const [isLoading, setIsLoading] = useState(true);
  const [currentDept, setCurrentDept] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); 
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const initData = async () => {
      setIsLoading(true);
      try {
        const deptRes = await fetch('/api/departments');
        const allDepts = await deptRes.json();
        const foundDept = allDepts.find((d: any) =>
          d.name.toLowerCase() === slug.toLowerCase() || d.id === slug
        );
        if (!foundDept) return;
        setCurrentDept(foundDept);
        const deptId = foundDept.id;

        const catRes = await fetch(`/api/categories?departmentId=${deptId}`);
        setCategories(await catRes.json());

        const reqRes = await fetch('/api/requests');
        const allRequests = await reqRes.json();
        setRequests(allRequests.filter((r: any) =>
          r.details?.departmentId === deptId &&
          (r.type === 'CREATE_CATEGORY' || r.requestType === 'CREATE_CATEGORY') &&
          r.status === 'PENDING'
        ));

        const userRes = await fetch(`/api/admin/users`);
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('RAW users from API:', userData);

          setUsers(userData.filter((u: any) => ((u.departmentId === deptId )||(u.role==="VIEW_ONLY_USER"))).map((u: any) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            role: mapRoleToDisplay(u.role),
            dbRole: u.role,
            status: u.status || 'Active',
          })));
        }
        
      } catch (error) {
        console.error('Failed to fetch department data', error);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [slug]);

  const handleRequestAction = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) { console.error("Error updating request", error); }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          role: selectedUser.dbRole, 
          departmentId: currentDept?.id
        }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id ? { ...u, dbRole: selectedUser.dbRole, role: mapRoleToDisplay(selectedUser.dbRole) } : u
        ));
        setIsEditOpen(false);
      } else {
        alert(`Failed: ${await res.text()}`);
      }
    } catch (error) { console.error("Update failed", error); } finally { setIsUpdating(false); }
  };

  const departmentName = currentDept ? currentDept.name : slug.toUpperCase();
  const departmentDesc = currentDept ? `Manage categories and permissions for ${currentDept.name}` : 'Loading...';
  const totalCategories = categories.length;
  
  const statsData = [
    { label: 'TOTAL CATEGORIES', value: totalCategories.toString(), sub: 'Active substructures', type: 'folder' },
    { label: 'TOTAL DEPT USERS', value: users.length.toString(), sub: 'All Active', type: 'users' },
    { label: 'TOTAL STORAGE', value: currentDept?.storageUsed ? `${currentDept.storageUsed} GB` : '0 GB', sub: '', type: 'storage' },
  ];

  const logRows = [
    { action: 'Permissions Updated', user: 'Sarah Jenkins', time: '10 mins ago' },
    { action: 'File Upload Batch', user: 'Mike Ross', time: '1 hr ago' },
  ];

  if (isLoading) {
    return <Box p={6} display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
      startIcon={<ArrowBackIcon />}
      variant="outlined"
      size="small"
      sx={{ color: 'text.secondary', borderColor: 'divider' }}
      onClick={() => router.back()}
    >
      Back
    </Button>
          <Box>
            <Typography variant="h2" color="text.secondary">
              DEPARTMENT /{' '}
              <Typography
                component="span"
                variant="h1"
                sx={{ color: '#ff6a00', display: 'inline' }}
              >
                {departmentName}
              </Typography>
            </Typography>

            <Typography variant="body2" color="text.secondary">{departmentDesc}</Typography>
          </Box>
        </Stack>
        <Button startIcon={<SettingsIcon />} variant="outlined" size="small">Department Settings</Button>
      </Stack>

      {/* STATS */}
      <Grid container spacing={5} mb={3} py={8} alignItems="stretch">
        {statsData.map((item, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h3" fontWeight={600}>{item.value}</Typography>
                    {item.sub && <Typography variant="caption" color="text.secondary">{item.sub}</Typography>}
                  </Box>
                  {getStatIcon(item.type)}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* MAIN GRID */}
      <Grid container spacing={10}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={8}>
          <Stack spacing={10}>
            {/* CATEGORIES */}
            <Card>
              <CardContent sx={{ p: 10 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography fontWeight={600} variant='h2'>Categories & Structure</Typography>
                  <Button size="small" sx={{ textTransform: 'none', color: '#ff6a00', fontWeight: 500 }}>View All Departments</Button>
                </Stack>
                <Grid container sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, py: 5 }}>
                  <Grid item xs={4}>Category Name</Grid>
                  <Grid item xs={3}>Owner</Grid>
                  <Grid item xs={2}>Files</Grid>
                  <Grid item xs={3} textAlign="right">Actions</Grid>
                </Grid>
                <Divider />
                {categories.length === 0 ? (
                  <Box py={4} textAlign="center"><Typography variant="body2" color="text.secondary">No categories found.</Typography></Box>
                ) : (
                  categories.map((cat, index) => (
                    <Box key={cat.id}>
                      <Grid container alignItems="center" sx={{ py: 5 }}>
                        <Grid item xs={4}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', width: 36, height: 36 }}><FolderIcon fontSize="small" /></Avatar>
                            <Typography fontWeight={500} fontSize={14}>{cat.name}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={3}><Typography fontSize={13} color="text.secondary">System Admin</Typography></Grid>
                        <Grid item xs={2}><Typography fontSize={13} color="text.secondary">{cat._count?.documents || 0}</Typography></Grid>
                        <Grid item xs={3}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" sx={{ textTransform: 'none' }}>Permissions</Button>
                            <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                          </Stack>
                        </Grid>
                      </Grid>
                      {index < categories.length - 1 && <Divider />}
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* USER MANAGEMENT */}
            <Card >
              <CardContent sx={{ p: 10 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography fontWeight={600} variant='h2'>User Management</Typography>
                  <Stack direction="row" spacing={10}>
                    <TextField size="small" placeholder="Find user..." InputProps={{ startAdornment: (<SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />) }} sx={{ width: 240 }} />
                    <Button variant="contained" size="small" sx={{ textTransform: 'none' }}>Add User</Button>
                  </Stack>
                </Stack>
                <Grid container sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, py: 5 }}>
                  <Grid item xs={4}>USER NAME</Grid>
                  <Grid item xs={3}>ROLE</Grid>
                  <Grid item xs={3}>STATUS</Grid>
                  <Grid item xs={2} textAlign="right">ACTIONS</Grid>
                </Grid>
                <Divider sx={{ mb: 2 }} />
                {users.map((user, i) => (
                  <Box key={user.id}>
                    <Grid container alignItems="center" sx={{ py: 5 }}>
                      <Grid item xs={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36 }}>{user.name[0]}</Avatar>
                          <Box>
                            <Typography fontSize={14} fontWeight={500}>{user.name}</Typography>
                            <Typography fontSize={12} color="text.secondary">{user.email}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={3}><Chip label={user.role} size="small" sx={{ fontWeight: 500, borderRadius: 1 }} /></Grid>
                      <Grid item xs={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2e7d32' }} />
                          <Typography fontSize={13}>{user.status}</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={2} textAlign="right">
                        <Button size="small" sx={{ textTransform: 'none' }} onClick={() => handleEditClick(user)}>Edit Access</Button>
                      </Grid>
                    </Grid>
                    {i < users.length - 1 && <Divider />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={4}>
          <Stack spacing={10}>
            {/* REQUESTS */}
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase',  }} variant='h2'>Departmental Requests</Typography>
                  <Button size="small" sx={{ color: '#ff6a00', fontWeight: 600 }}>Manage All</Button>
                </Stack>
                <Stack spacing={2}>
                  {requests.length === 0 ? (
                    <Box py={2} textAlign="center"><Typography variant="caption" color="text.secondary">No pending requests.</Typography></Box>
                  ) : (
                    requests.map((req) => (
                      <Box key={req.id} sx={{ border: '1px solid #eee', borderRadius: 2, p: 10 }}>
                        <Stack direction="row" justifyContent="space-between" mb={4}>
                          <Chip label={req.type} size="small" sx={{ bgcolor: '#fff3e0', color: '#ff9800', fontWeight: 'bold', fontSize: '0.6rem' }} />
                          <Typography  variant="caption" color="text.secondary">{new Date(req.createdAt).toLocaleDateString()}</Typography>
                        </Stack>
                        <Typography p={3} fontWeight={700} fontSize="1.5rem">{req.details?.categoryName || 'New Category'}</Typography>
                        <Typography pb={2} variant="body2" sx={{ fontSize: '0.8rem' }} color="text.secondary" mb={2}>Requested by {req.requester?.firstName}</Typography>
                        <Stack direction="row" spacing={5}>
                          <Button fullWidth variant="contained" color="success" size="small" onClick={() => handleRequestAction(req.id, 'APPROVED')}>Approve</Button>
                          <Button fullWidth variant="contained" size="small" onClick={() => handleRequestAction(req.id, 'REJECTED')} sx={{ bgcolor: '#f5f5f5', color: 'black' }}>Decline</Button>
                        </Stack>
                      </Box>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* AUDIT LOGS */}
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Typography fontWeight={600} variant='h2'>Audit Logs</Typography>
                  <Button size="small" sx={{ color: '#ff6a00' }}>View All</Button>
                </Stack>
                <Divider sx={{ mb: 2 }}  />
                {logRows.map((log, i) => (
                  <Stack key={i} direction="row" spacing={4} mb={2} alignItems="flex-start" py={2.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: i === 0 ? '#1976d2' : '#e0e0e0', mt: 1 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500} >{log.action}</Typography>
                      <Typography variant="caption" color="text.secondary" pb={2}>{log.user} • {log.time}</Typography>
                    </Box>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* EDIT ACCESS DIALOG */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 600 }}>Update User Access</DialogTitle>
        <DialogContent>
          <Box pt={2}>
            <Typography variant="body2" mb={3}>Modify system-wide role for <b>{selectedUser?.name}</b></Typography>
            <FormControl fullWidth>
              <InputLabel>System Role</InputLabel>
              <Select
                value={selectedUser?.dbRole || ''}
                label="System Role"
                onChange={(e) => setSelectedUser({ ...selectedUser, dbRole: e.target.value })}
              >
                <MenuItem value="DEPT_ADMIN">Dept Head</MenuItem>
                <MenuItem value="DEPT_USER">Dept user</MenuItem>
                <MenuItem value="VIEW_ONLY">Viewer</MenuItem>
                <MenuItem value="MASTER_ADMIN">Master Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsEditOpen(false)} disabled={isUpdating}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateUser} disabled={isUpdating} sx={{ bgcolor: '#ff6a00', '&:hover': { bgcolor: '#e55a00' } }}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
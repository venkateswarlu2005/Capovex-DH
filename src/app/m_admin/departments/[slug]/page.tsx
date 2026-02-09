'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
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
  TextField,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';

/* ================= TYPES ================= */
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId?: string | null;
  categoryAccess?: { categoryId: string }[];
}

/* ================= HOOKS ================= */
import { useDepartments } from '@/hooks/m_admin/queries/useDepartments';
import { useCategories } from '@/hooks/m_admin/queries/useCategories';
import { useRequests } from '@/hooks/m_admin/queries/useRequests';
import { useUsers } from '@/hooks/m_admin/queries/useUser';
import { useApproveRequest } from '@/hooks/m_admin/mutations/useApproveRequest';
import { useSyncPermissions } from '@/services/m_admin/useSyncPermissions';

/* ================= HELPERS ================= */
const getStatIcon = (type: string) => {
  switch (type) {
    case 'folder': return <FolderIcon sx={{ color: '#1976d2', fontSize: 40 }} />;
    case 'users': return <PeopleOutlinedIcon sx={{ color: '#9c27b0', fontSize: 40 }} />;
    case 'storage': return <StorageIcon sx={{ color: '#2e7d32', fontSize: 40 }} />;
    default: return <FolderIcon sx={{ fontSize: 40 }} />;
  }
};

const mapRoleToDisplay = (dbRole: string) => {
  switch (dbRole) {
    case 'DEPT_ADMIN': return 'Dept Admin';
    case 'DEPT_USER': return 'Dept User';
    case 'MASTER_ADMIN': return 'Master Admin';
    case 'VIEW_ONLY_USER': return 'Viewer';
    default: return dbRole;
  }
};

export default function DepartmentSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug ? String(params.slug) : '';

  const { data: departments = [], isLoading: deptsLoading } = useDepartments();
  const { data: allUsers = [], isLoading: usersLoading } = useUsers();
  const { data: allRequests = [] } = useRequests();

  const currentDept = departments.find(
    (d: any) => d.name.toLowerCase() === slug.toLowerCase() || d.id === slug
  );

  const departmentId = currentDept?.id;
  const { data: categories = [] } = useCategories(departmentId);

  /* ---------- UI State ---------- */
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tempCategoryIds, setTempCategoryIds] = useState<string[]>([]);

  /* ---------- Mutations ---------- */
  const { mutate: approveRequest } = useApproveRequest();
  const { mutate: syncPermissions, isPending: isSyncing } = useSyncPermissions();

  /* ---------- Data Derivation ---------- */
  const deptUsers = useMemo(() => {
    // 1. Start with all users
    let list = [...(allUsers as User[])];

    // 2. Apply Search Filter
    if (userSearch) {
      list = list.filter((u: User) =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase())
      );
    }

    // 3. Apply Role Filter
    if (roleFilter !== 'ALL') {
      list = list.filter((u: User) => u.role === roleFilter);
    }

    // 4. Sort: Members of this department first, then alphabetical
    return list.sort((a, b) => {
      const isAMember = a.departmentId === departmentId;
      const isBMember = b.departmentId === departmentId;
      if (isAMember && !isBMember) return -1;
      if (!isAMember && isBMember) return 1;
      return a.firstName.localeCompare(b.firstName);
    });
  }, [allUsers, departmentId, userSearch, roleFilter]);

  const pendingRequests = useMemo(() => {
    return allRequests.filter((r: any) =>
      r.details?.departmentId === departmentId && r.status === 'PENDING'
    );
  }, [allRequests, departmentId]);

  /* ---------- Actions ---------- */
  const handleOpenAccess = (user: User) => {
    setSelectedUser(user);
    const existingIds = user.categoryAccess?.map(a => a.categoryId) || [];
    setTempCategoryIds(existingIds);
    setIsAccessOpen(true);
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;
    const existingIds = selectedUser.categoryAccess?.map(a => a.categoryId) || [];

    syncPermissions({
      userId: selectedUser.id,
      newCategoryIds: tempCategoryIds,
      existingCategoryIds: existingIds
    }, {
      onSuccess: () => setIsAccessOpen(false)
    });
  };

  if (deptsLoading || usersLoading) {
    return <Box p={6} display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  if (!currentDept) return <Box p={6}><Typography>Department not found.</Typography></Box>;

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
              <Typography component="span" variant="h1" sx={{ color: '#ff6a00', display: 'inline', fontWeight: 600 }}>
                {currentDept.name.toUpperCase()}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage categories and permissions for {currentDept.name}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* STATS */}
      <Grid container spacing={5} mb={3} py={8} alignItems="stretch">
        {[
          { label: 'TOTAL CATEGORIES', value: categories.length, type: 'folder', sub: 'Active substructures' },
          { label: 'TOTAL LISTED USERS', value: deptUsers.length, type: 'users', sub: 'Based on filters' },
          { label: 'TOTAL STORAGE', value: `${currentDept.storageUsed ?? 0} GB`, type: 'storage', sub: '' },
        ].map((item, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
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
        <Grid item xs={12} md={8}>
          <Stack spacing={10}>
            {/* CATEGORIES CARD */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 10 }}>
                <Typography fontWeight={600} variant='h2' mb={2}>Categories & Structure</Typography>
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
                  categories.map((cat: any, index: number) => (
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
                        <Grid item xs={3} textAlign="right">
                          <Button
                            size="small"
                            sx={{ textTransform: 'none', color: '#ff6a00' }}
                            onClick={() => router.push(`/m_admin/departments/${slug}/categories/${cat.id}`)}
                          >
                            View Files
                          </Button>
                        </Grid>
                      </Grid>
                      {index < categories.length - 1 && <Divider />}
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>

            {/* USERS MANAGEMENT CARD */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 10 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography fontWeight={600} variant='h2'>User Management</Typography>
                  <Stack direction="row" spacing={2}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={roleFilter}
                        label="Role"
                        onChange={(e) => setRoleFilter(e.target.value)}
                        startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} fontSize="small" />}
                      >
                        <MenuItem value="ALL">All Roles</MenuItem>
                        <MenuItem value="MASTER_ADMIN">Master Admin</MenuItem>
                        <MenuItem value="DEPT_ADMIN">Dept Admin</MenuItem>
                        <MenuItem value="DEPT_USER">Dept User</MenuItem>
                        <MenuItem value="VIEW_ONLY_USER">Viewer</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      placeholder="Find user..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      sx={{ width: 240 }}
                    />
                  </Stack>
                </Stack>

                <Grid container sx={{ color: 'text.secondary', fontSize: 12, fontWeight: 500, py: 5 }}>
                  <Grid item xs={4}>USER NAME</Grid>
                  <Grid item xs={3}>ROLE</Grid>
                  <Grid item xs={3}>DEPT STATUS</Grid>
                  <Grid item xs={2} textAlign="right">ACTIONS</Grid>
                </Grid>
                <Divider sx={{ mb: 2 }} />

                {deptUsers.length === 0 ? (
                    <Box py={4} textAlign="center"><Typography color="text.secondary">No users found matching these criteria.</Typography></Box>
                ) : (
                  deptUsers.map((user: User, i: number) => {
                    const isDeptMember = user.departmentId === departmentId;
                    return (
                      <Box key={user.id}>
                        <Grid container alignItems="center" sx={{ py: 5 }}>
                          <Grid item xs={4}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar sx={{
                                width: 36,
                                height: 36,
                                bgcolor: isDeptMember ? 'primary.main' : 'grey.300',
                                color: isDeptMember ? 'white' : 'grey.600'
                              }}>
                                {user.firstName[0]}
                              </Avatar>
                              <Box>
                                <Typography fontSize={14} fontWeight={500}>{user.firstName} {user.lastName}</Typography>
                                <Typography fontSize={12} color="text.secondary">{user.email}</Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={3}><Chip label={mapRoleToDisplay(user.role)} size="small" variant="outlined" /></Grid>
                          <Grid item xs={3}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: isDeptMember ? '#2e7d32' : 'grey.400'
                              }} />
                              <Typography fontSize={13}>
                                {isDeptMember ? 'Member' : 'External'}
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item xs={2} textAlign="right">
                            <Button size="small" sx={{ textTransform: 'none', color: '#ff6a00' }} onClick={() => handleOpenAccess(user)}>
                              Edit Access
                            </Button>
                          </Grid>
                        </Grid>
                        {i < deptUsers.length - 1 && <Divider />}
                      </Box>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* REQUESTS COLUMN */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 2 }} variant='h2'>
                Departmental Requests
              </Typography>
              <Stack spacing={2}>
                {pendingRequests.map((req: any) => (
                  <Box key={req.id} sx={{ border: '1px solid #eee', borderRadius: 2, p: 4 }}>
                    <Stack direction="row" justifyContent="space-between" mb={2}>
                      <Chip label={req.type} size="small" sx={{ bgcolor: '#fff3e0', color: '#ff9800', fontWeight: 'bold', fontSize: '0.6rem' }} />
                      <Typography variant="caption" color="text.secondary">{new Date(req.createdAt).toLocaleDateString()}</Typography>
                    </Stack>
                    <Typography fontWeight={700} fontSize="1.1rem" mb={1}>{req.details?.categoryName || 'New Category'}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>Requested by {req.requester?.firstName}</Typography>
                    <Stack direction="row" spacing={2}>
                      <Button fullWidth variant="contained" color="success" size="small" onClick={() => approveRequest({ id: req.id, status: 'APPROVED' })}>Approve</Button>
                      <Button fullWidth variant="contained" size="small" sx={{ bgcolor: '#f5f5f5', color: 'black' }} onClick={() => approveRequest({ id: req.id, status: 'REJECTED' })}>Decline</Button>
                    </Stack>
                  </Box>
                ))}
                {pendingRequests.length === 0 && (
                  <Typography variant="caption" color="text.secondary">No pending requests.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DIALOG FOR CATEGORY PERMISSIONS */}
      <Dialog open={isAccessOpen} onClose={() => setIsAccessOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Category Permissions: {selectedUser?.firstName}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" mb={3} color="text.secondary">
            Select the categories within <b>{currentDept.name}</b> that this user can access.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Accessible Categories</InputLabel>
            <Select
              multiple
              value={tempCategoryIds}
              onChange={(e) => setTempCategoryIds(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="Accessible Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => (
                    <Chip key={id} label={categories.find((c: any) => c.id === id)?.name || id} size="small" />
                  ))}
                </Box>
              )}
            >
              {categories.map((cat: any) => (
                <MenuItem key={cat.id} value={cat.id}>
                  <Checkbox checked={tempCategoryIds.indexOf(cat.id) > -1} />
                  <ListItemText primary={cat.name} secondary={`${cat._count?.documents || 0} documents`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setIsAccessOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSavePermissions}
            disabled={isSyncing}
            sx={{ bgcolor: '#ff6a00', '&:hover': { bgcolor: '#e65f00' } }}
          >
            {isSyncing ? 'Updating...' : 'Save Permissions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
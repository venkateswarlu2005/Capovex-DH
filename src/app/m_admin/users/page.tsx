'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Divider,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useSession } from 'next-auth/react';


import { useUpdateUserRole } from '@/hooks/m_admin/mutations/useUpdateUserRole';
import { UserRole } from '@/shared/enums';
import { useUsers } from '@/hooks/m_admin/queries/useUser';

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const roleLabel = (role: string) => {
  switch (role) {
    case 'MASTER_ADMIN': return 'Master Admin';
    case 'DEPT_ADMIN': return 'Dept Admin';
    case 'DEPT_USER': return 'Dept User';
    case 'VIEW_ONLY_USER': return 'View Only';
    default: return role;
  }
};

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function UserManagementPage() {
  const { data: session } = useSession();
  const isMasterAdmin = session?.user?.role === UserRole.MasterAdmin;

  const { data: users = [], isLoading } = useUsers();
  const { mutate: updateUserRole, isPending } = useUpdateUserRole();

  /* ------------------------------ UI STATE -------------------------------- */

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | string>('ALL');
  const [sortLatest, setSortLatest] = useState(true);

  const [editUser, setEditUser] = useState<any>(null);

  /* --------------------------- DATA DERIVATION ---------------------------- */

 const filteredUsers = useMemo(() => {
  let list = [...users];

  // Global search
  if (search) {
    list = list.filter(u =>
      `${u.firstName} ${u.lastName} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }

  // Role filter
  if (roleFilter !== 'ALL') {
    list = list.filter(u => u.role === roleFilter);
  }

  // Sort by createdAt
  list.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortLatest ? timeB - timeA : timeA - timeB;
  });

  return list;
}, [users, search, roleFilter, sortLatest]);


  const departmentMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredUsers.forEach(u => {
      if (u.departmentId) {
        const dept = u.department?.name || 'Unknown Department';
        if (!map[dept]) map[dept] = [];
        map[dept].push(u);
      }
    });
    return map;
  }, [filteredUsers]);

  const viewOnlyUsers = useMemo(() => {
    return filteredUsers.filter(
      u => u.role === UserRole.ViewOnlyUser && !u.departmentId
    );
  }, [filteredUsers]);

  /* ------------------------------ ACTIONS ---------------------------------- */

  const handleSaveRole = () => {
    updateUserRole({
      userId: editUser.id,
      role: editUser.role,
      departmentId: editUser.departmentId,
    });
    setEditUser(null);
  };

  /* ------------------------------ RENDER ---------------------------------- */

  if (isLoading) {
    return <Box p={6}><Typography>Loading users...</Typography></Box>;
  }

  return (
    <Box p={4}>
      {/* HEADER */}
      <Typography variant="h1" mb={3}>
        User Management
      </Typography>

      {/* GLOBAL CONTROLS */}
      <Stack direction="row" spacing={2} mb={4}>
        <TextField
          fullWidth
          placeholder="Search users by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          size="small"
        >
          <MenuItem value="ALL">All Roles</MenuItem>
          <MenuItem value="MASTER_ADMIN">Master Admin</MenuItem>
          <MenuItem value="DEPT_ADMIN">Dept Admin</MenuItem>
          <MenuItem value="DEPT_USER">Dept User</MenuItem>
          <MenuItem value="VIEW_ONLY_USER">View Only</MenuItem>
        </Select>

        <Button
          variant="outlined"
          onClick={() => setSortLatest(!sortLatest)}
        >
          {sortLatest ? 'Latest First' : 'Oldest First'}
        </Button>
      </Stack>

      {/* DEPARTMENT TABLES */}
      {Object.entries(departmentMap).map(([dept, deptUsers]) => (
        <Card key={dept} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h2" mb={2}>
              {dept}
            </Typography>

            <Divider />

            {deptUsers.map((u) => (
              <Stack
                key={u.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                py={1.5}
              >
                <Box>
                  <Typography fontWeight={500}>
                    {u.firstName} {u.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {u.email}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography>{roleLabel(u.role)}</Typography>

                  {isMasterAdmin && (
                    <Button
                      size="small"
                      onClick={() => setEditUser({ ...u })}
                    >
                      Edit
                    </Button>
                  )}
                </Stack>
              </Stack>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* VIEW ONLY USERS */}
      {viewOnlyUsers.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h2" mb={2}>
              View-Only / Unassigned Users
            </Typography>

            <Divider />

            {viewOnlyUsers.map((u) => (
              <Stack
                key={u.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                py={1.5}
              >
                <Box>
                  <Typography fontWeight={500}>
                    {u.firstName} {u.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {u.email}
                  </Typography>
                </Box>

                {isMasterAdmin && (
                  <Button size="small" onClick={() => setEditUser({ ...u })}>
                    Edit
                  </Button>
                )}
              </Stack>
            ))}
          </CardContent>
        </Card>
      )}

      {/* EDIT ROLE DIALOG */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={editUser?.role || ''}
              label="Role"
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value })
              }
            >
              <MenuItem value="MASTER_ADMIN">Master Admin</MenuItem>
              <MenuItem value="DEPT_ADMIN">Dept Admin</MenuItem>
              <MenuItem value="DEPT_USER">Dept User</MenuItem>
              <MenuItem value="VIEW_ONLY_USER">View Only</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUser(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={isPending}
            onClick={handleSaveRole}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

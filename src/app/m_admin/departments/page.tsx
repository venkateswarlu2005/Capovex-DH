'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ApartmentIcon from '@mui/icons-material/Apartment';
import GroupIcon from '@mui/icons-material/Group';
import StorageIcon from '@mui/icons-material/Storage';

export default function DepartmentsPage() {
  const router = useRouter();

  /* ---------------- STATE ---------------- */
  const [departments, setDepartments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- API ---------------- */
  const fetchDepartments = async () => {
    const res = await fetch('/api/departments', { cache: 'no-store' });
    if (res.ok) setDepartments(await res.json());
  };

  const createDepartment = async () => {
    if (!deptName.trim()) {
      setError('Department name is required');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: deptName,
        description: deptDesc || null,
      }),
    });

    if (!res.ok) {
      const msg = await res.text();

      if (res.status === 403) {
        setError('Only Master Admin can create departments');
      } else if (res.status === 409) {
        setError('Department name already exists');
      } else {
        setError(msg || 'Failed to create department');
      }

      setLoading(false);
      return;
    }

    setDeptName('');
    setDeptDesc('');
    setOpen(false);
    setLoading(false);
    fetchDepartments();
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  /* ---------------- STATS ---------------- */
  const totalDepartments = departments.length;
  const activeUsers = departments.reduce(
    (sum, d) => sum + (d._count?.users || 0),
    0
  );
  const totalData = '0 TB';

  const slugify = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Box p={4}>
      {/* ================= HEADER ================= */}
      <Box display="flex" justifyContent="space-between" mb={5}>
        <Box>
          <Typography variant='h1' fontWeight={700} color="#ff7a18">
            DEPARTMENT
          </Typography>
          <Typography variant='h2' color="text.secondary">
            Manage all the departments
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            backgroundColor: '#ff7a18',
            height: 44,
            fontSize: 15,
            px: 2.5,
          }}
          onClick={() => setOpen(true)}
        >
          Add New Department
        </Button>
      </Box>

      {/* ================= STATS ================= */}
      <Grid container spacing={4} mb={5}>
        {[
          {
            label: 'TOTAL DEPARTMENTS',
            value: totalDepartments,
            icon: <ApartmentIcon />,
          },
          {
            label: 'ACTIVE USERS',
            value: activeUsers,
            icon: <GroupIcon />,
          },
          {
            label: 'TOTAL DATA',
            value: totalData,
            icon: <StorageIcon />,
          },
        ].map((item, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card
              sx={{
                borderRadius: 3,
                height: 100,
                display: 'flex',
                alignItems: 'center',
                px: 1,
              }}
            >
              <CardContent
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pb: '16px !important',
                }}
              >
                <Box>
                  <Typography fontSize={12} color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography fontSize={26} fontWeight={700}>
                    {item.value}
                  </Typography>
                </Box>
                {item.icon}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ================= DEPARTMENT CARDS ================= */}
      <Grid container spacing={25}>
        {departments.map((dept) => (
          <Grid item xs={12} md={4} key={dept.id}>
            <Card
              sx={{
                borderRadius: 3,
                height: 250,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant='h2' fontWeight={700}>
                      {dept.name}
                    </Typography>
                    <Typography variant='h3' color="text.secondary">
                      {dept.description}
                    </Typography>
                  </Box>

                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography fontSize={24} fontWeight={700}>
                      {dept._count?.categories || 0}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                      CATEGORIES
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontSize={24} fontWeight={700}>
                      {dept._count?.users || 0}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary">
                      USERS
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography fontSize={13} color="text.secondary">
                      Storage Usage (0 TB)
                    </Typography>
                    <Typography fontSize={13} fontWeight={600}>
                      0%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={0}
                    sx={{
                      mt: 1,
                      height: 7,
                      borderRadius: 5,
                      backgroundColor: '#eee',
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: 14,
                    height: 40,
                  }}
                  onClick={() =>
                    router.push(`/m_admin/departments/${slugify(dept.name)}`)
                  }
                >
                  Manage Department →
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ================= ADD DEPARTMENT DIALOG ================= */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Department</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Department Name"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            sx={{ mt: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Description (optional)"
            value={deptDesc}
            onChange={(e) => setDeptDesc(e.target.value)}
            sx={{ mt: 2 }}
            multiline
            rows={2}
          />

          {error && (
            <Typography color="error" fontSize={13} mt={1}>
              {error}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={createDepartment}
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

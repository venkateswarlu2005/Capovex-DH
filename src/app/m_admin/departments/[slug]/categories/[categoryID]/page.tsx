'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useSession } from 'next-auth/react';

import { DocumentTable } from '@/components/DocumentTable';
import { useCategoryDocuments } from '@/hooks/m_admin/useCategoryDocument';
import { useCategories } from '@/hooks/m_admin/queries/useCategories';

type Category = {
  id: string;
  name: string;
  departmentId: string;
  _count?: { documents: number };
};

export default function CategoryDocumentsPage() {
  /* PARAMS */
  const params = useParams();

  const slug =
    typeof params.slug === 'string'
      ? params.slug
      : '';

  const categoryId =
    typeof params.categoryId === 'string'
      ? params.categoryId
      : undefined;

  /* SESSION */
  const { data: session } = useSession();
  const departmentId = session?.user?.departmentId ?? undefined;

  /* DATA */
  const {
    documents,
    loading,
    view,
    remove,
  } = useCategoryDocuments(categoryId, departmentId);

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useCategories(departmentId) as { data: Category[]; isLoading: boolean };

  /* DERIVED */
  const categoryName = useMemo(() => {
    return (
      categories.find((c) => c.id === categoryId)?.name ??
      'Category Documents'
    );
  }, [categories, categoryId]);

  /* LOADING */
  if (loading || categoriesLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }


  /* RENDER */
  return (
    <Box p={4}>
      <Typography
        variant="h1"
        color="#ff7a18"
        mb={1}
        sx={{ letterSpacing: '-0.5px' }}
      >
        {categoryName.toUpperCase()}
      </Typography>

      <Typography color="text.secondary" mb={4}>
        Department: {slug}
      </Typography>

      <Card>
        <CardContent>
          <DocumentTable
            documents={documents}
            onView={view}
            onDelete={remove}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

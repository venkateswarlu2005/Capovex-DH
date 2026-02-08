import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Stack, Typography
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';

export function DocumentTable({
  documents,
  onView,
  onDelete,
}: {
  documents: any[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>DOCUMENT</TableCell>
            <TableCell>SIZE</TableCell>
            <TableCell>TYPE</TableCell>
            <TableCell align="right">ACTION</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.documentId} hover>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <DescriptionIcon color="primary" />
                  <Typography fontWeight={600}>{doc.fileName}</Typography>
                </Stack>
              </TableCell>
              <TableCell>{(doc.size / 1024).toFixed(2)} KB</TableCell>
              <TableCell>{doc.fileType}</TableCell>
              <TableCell align="right">
                <Stack direction="row" justifyContent="flex-end">
                  <IconButton onClick={() => onView(doc.documentId)}>
                    <VisibilityIcon />
                  </IconButton>

                  <IconButton onClick={() => onDelete(doc.documentId)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

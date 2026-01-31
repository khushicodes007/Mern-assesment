import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TableSortLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

interface Header {
  label: string;
  fieldName: string;
  sortable?: boolean;
}

interface TableRendererProps {
  headers: Header[];
  data: any[];
  onEditClick?: (row: any) => void;
  onDeleteClick?: (row: any) => void;
}

const TableRenderer: React.FC<TableRendererProps> = ({
  headers,
  data,
  onEditClick,
  onDeleteClick,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  //  Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: any | null;
  }>({
    open: false,
    user: null,
  });

  const handleSort = (fieldName: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === fieldName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: fieldName, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  //  Open delete confirmation
  const handleDeleteClick = (user: any) => {
    setDeleteDialog({ open: true, user });
  };

  //  Confirm delete
  const handleConfirmDelete = () => {
    if (deleteDialog.user && onDeleteClick) {
      onDeleteClick(deleteDialog.user);
      setDeleteDialog({ open: false, user: null });
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialog({ open: false, user: null });
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header.fieldName}>
                  {header.sortable ? (
                    <TableSortLabel
                      active={sortConfig?.key === header.fieldName}
                      direction={sortConfig?.key === header.fieldName ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort(header.fieldName)}
                    >
                      {header.label}
                    </TableSortLabel>
                  ) : (
                    header.label
                  )}
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length + 1} align="center">
                  <Typography color="textSecondary">No data available</Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={index} hover>
                  {headers.map((header) => (
                    <TableCell key={header.fieldName}>
                      {typeof row[header.fieldName] === 'boolean'
                        ? row[header.fieldName]
                          ? 'Active'
                          : 'Inactive'
                        : row[header.fieldName]}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    {onEditClick && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEditClick(row)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {onDeleteClick && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(row)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialog.open} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user{' '}
            <strong>{deleteDialog.user?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TableRenderer;
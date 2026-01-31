import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TableRenderer from '../../components/TableRenderer/TableRenderer';
import { fetchUsers, deleteUser } from '../../redux/slices/usersSlice';
import { RootState, AppDispatch } from '../../redux/store';

const UsersList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { list, loading } = useSelector((state: RootState) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const headers = [
    { label: 'Name', fieldName: 'name', sortable: true },
    { label: 'Email', fieldName: 'email', sortable: true },
    { label: 'Role', fieldName: 'role' },
    { label: 'Status', fieldName: 'isActive' },
  ];

  // ✅ Handle delete
  const handleDelete = async (user: any) => {
    try {
      await dispatch(deleteUser(user._id)).unwrap();
      console.log(`✅ User ${user.name} deleted successfully`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/users/create')}
        >
          Add User
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : list.length === 0 ? (
        <Typography variant="body1" color="textSecondary" textAlign="center" mt={4}>
          No users found. Create your first user!
        </Typography>
      ) : (
        <TableRenderer
          headers={headers}
          data={list}
          onEditClick={(user) => navigate(`/users/${user._id}/edit`)}
          onDeleteClick={handleDelete} // ✅ Add delete handler
        />
      )}
    </Box>
  );
};

export default UsersList;
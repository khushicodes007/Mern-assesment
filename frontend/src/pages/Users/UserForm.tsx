import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import FormRenderer from '../../components/FormRenderer/FormRenderer';
import { createUser, updateUser, fetchUsers } from '../../redux/slices/usersSlice';
import { AppDispatch, RootState } from '../../redux/store';

const UserForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { list } = useSelector((state: RootState) => state.users);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const user = list.find((u) => u._id === id);
      if (user) {
        setInitialData(user);
      } else {
        dispatch(fetchUsers());
      }
    }
  }, [id, list, dispatch]);

  const userFormSchema = {
    title: id ? 'Edit User' : 'Add User',
    fields: [
      { 
        fieldName: 'name', 
        label: 'Full Name', 
        type: 'text' as const, 
        value: initialData?.name || '',
        validation: { required: true } 
      },
      { 
        fieldName: 'email', 
        label: 'Email', 
        type: 'text' as const, 
        value: initialData?.email || '',
        validation: { required: true } 
      },
      {
        fieldName: 'role',
        label: 'Role',
        type: 'select' as const,
        value: initialData?.role || 'editor',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Editor', value: 'editor' },
        ],
        validation: { required: true },
      },
      { 
        fieldName: 'isActive', 
        label: 'Active', 
        type: 'boolean' as const,
        value: initialData?.isActive ?? true,
      },
    ],
  };

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (id) {
        await dispatch(updateUser({ id, data })).unwrap();
      } else {
        await dispatch(createUser(data)).unwrap();
      }
      navigate('/users');
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (id && !initialData) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/users')}
        sx={{ mb: 2 }}
      >
        Back to Users
      </Button>
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <FormRenderer schema={userFormSchema} onSubmit={handleSubmit} />
      )}
    </Box>
  );
};

export default UserForm;
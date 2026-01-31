import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface UsersState {
  list: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  loading: false,
  error: null,
};

const API_URL = 'http://localhost:5000/api/users';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
});

export const createUser = createAsyncThunk('users/createUser', async (userData: any) => {
  const response = await axios.post(API_URL, userData, getAuthHeader());
  return response.data;
});

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
    return response.data;
  }
);
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string) => {
    await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return id; 
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // ✅ Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((user) => user._id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
import api from '@/utils/api';

import { toast } from 'sonner';

// ==================== USER MANAGEMENT ====================

export async function getUserCounts() {
  try {
    const response = await api.get('/admin/users/counts');
    console.log(response.data);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
}

export async function getUsers(role = '', page = 0, size = 10) {
  try {
    const params = { page, size };
    if (role) params.role = role;

    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
}

export async function deleteUser(userId) {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    toast.success(response.data?.message || 'User deleted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
}

// ==================== MCQ CONTEST MANAGEMENT ====================

export async function getAllQuestionSets() {
  try {
    const response = await api.get('/admin/mcq-sets');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
}

export async function getQuestionSetById(id) {
  try {
    const response = await api.get(`/admin/mcq-sets/${id}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
}

export async function createQuestionSet(data) {
  try {
    const response = await api.post('/admin/mcq-sets', data);
    toast.success(response.data?.message || 'Question set created successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
}

export async function updateQuestionSet(id, data) {
  try {
    const response = await api.put(`/admin/mcq-sets/${id}`, data);
    toast.success(response.data?.message || 'Question set updated successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
}

export async function deleteQuestionSet(id) {
  try {
    const response = await api.delete(`/admin/mcq-sets/${id}`);
    toast.success(response.data?.message || 'Question set deleted successfully');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    return error.response?.data;
  }
}
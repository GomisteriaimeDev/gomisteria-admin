import { useState, useEffect } from 'react';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://gomisteria-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to dynamically set the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get the token dynamically
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

type FetchFunction<T, Args extends any[]> = (...args: Args) => Promise<T>;

function useFetchData<T, Args extends any[]>(
  fetchFunction: FetchFunction<T, Args>,
  ...args: Args
) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchFunction(...args);
        setData(result);
      } catch (error) {
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchFunction, ...args]);

  return { data, isLoading, error };
}
export default useFetchData;

export const getUserById = async (id: any): Promise<any> => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response?.data ?? null;
};

/**
 * * Sales
 */
export const getOrders = async (page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc', status?: string, search?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const response = await axiosInstance.get(`/orders?${params.toString()}`);
  return response?.data ?? null;
};

export const getOrdersByUserId = async (id: any): Promise<any> => {
  const response = await axiosInstance.get(`/orders/user/${id}`);
  return response?.data ?? null;
};

export const getOrderById = async (id: any): Promise<any> => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response?.data ?? null;
};
export const deleteOrder = async (id: any): Promise<any> => {
  const response = await axiosInstance.delete(`/orders/${id}`);
  return response?.data ?? null;
};

export const assignOrderToEmployee = async (data: any) => {
  const response = await axiosInstance.post('/users/assignOrder', data);
  return response.data;
};
export const updateOrderStatus = async (orderId: any, newStatus: any) => {
  try {
    const response = await axiosInstance.put(
      `/orders/${orderId}/status`,
      { newStatus },

    );
    return response.data;
  } catch (error) {
    console.error("Failed to update order status:", error);
    throw error;
  }
};

/**
 * * Products
 */
export const getProducts = async (page?: number, limit?: number, query?: string, status?: string, search?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const url = `/products?${params.toString()}${query ? `&${query}` : ''}`;
  const response = await axiosInstance.get(url);
  return response?.data ?? null;
};

export const getSearchProducts = async (page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc', query?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (query) params.append('query', query);
  const response = await axiosInstance.get(`/products?${params.toString()}`);
  return response?.data ?? null;
};

export const getProductsByCategory = async (category: string, page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc'): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  params.append('category', category);
  const response = await axiosInstance.get(`/products?${params.toString()}`);
  return response?.data ?? null;
};

export const getProductsById = async (id: any): Promise<any> => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response?.data ?? null;
};

/**
 * * Businesses
 */
export const getBusinesses = async (page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc', status?: string, search?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const response = await axiosInstance.get(`/users/businesses?${params.toString()}`);
  return response?.data ?? null;
};

export const activateBusiness = async (business: any) => {
  try {
    const response = await axiosInstance.put(`/users/activate/${business.id}`);
    return response?.data ?? null;
  } catch (error) {
    console.error("Failed to activate business:", error);
    throw error;
  }
};
export const deactivateBusiness = async (business: any) => {
  try {
    const response = await axiosInstance.put(`/users/deactivate/${business.id}`);
    return response?.data ?? null;
  } catch (error) {
    console.error("Failed to activate business:", error);
    throw error;
  }
};

export const forceActivateBusiness = async (business: any) => {
  try {
    const response = await axiosInstance.put(
      `/users/force-activate/${business.id}`
    );
    return response?.data ?? null;
  } catch (error) {
    console.error("Failed to force-activate business:", error);
    throw error;
  }
};

export const updateBusiness = async (businessId: string, businessData: any) => {
  try {
    const response = await axiosInstance.put(`/users/${businessId}`, businessData);
    return response?.data ?? null;
  } catch (error) {
    console.error("Failed to update business:", error);
    throw error;
  }
};

/**
 * * Services
 */
export const getServices = async (): Promise<any> => {
  const response = await axiosInstance.get('/services');
  return response?.data ?? null;
};

export const getServiceOrders = async (page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc', status?: string, search?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const response = await axiosInstance.get(`/service-orders?${params.toString()}`);
  return response?.data ?? null;
};

export const approveService = async (id: string, status: string) => {
  try {
    const response = await axiosInstance.patch(`/service-orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * * Reservations
 */
export const getPreorders = async (page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc', status?: string, search?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const response = await axiosInstance.get(`/ngarkesa/preorders?${params.toString()}`);
  return response?.data ?? null;
};

export const getPreorderById = async (id: any): Promise<any> => {
  const response = await axiosInstance.get(`/ngarkesa/preorder/${id}`);
  return response?.data ?? null;
};

export const updatePreorderStatus = async (id: any, status: string) => {
  const response = await axiosInstance.patch(`/ngarkesa/preorder/${id}/status`, { status });
  return response.data;
};

/**
 * * Loads
 */
export const getNgarkesat = async (page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc', status?: string, search?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const response = await axiosInstance.get(`/ngarkesa?${params.toString()}`);
  return response?.data ?? null;
};

export const getNgarkesaById = async (id: any): Promise<any> => {
  const response = await axiosInstance.get(`/ngarkesa/${id}`);
  return response?.data ?? null;
};

export const createNgarkesa = async (ngarkesaData: any) => {
  const response = await axiosInstance.post('/ngarkesa', ngarkesaData);
  return response.data;
};

export const addProductsToNgarkesa = async (ngarkesaId: any, products: any) => {
  const response = await axiosInstance.post(`/ngarkesa/${ngarkesaId}/products`, { products });
  return response.data;
};
export const removeProductFromNgarkesa = async (ngarkesaId: string, productId: string) => {
  const response = await axiosInstance.delete(`/ngarkesa/${ngarkesaId}/products/${productId}`);
  return response.data;
};

export const updateNgarkesa = async (ngarkesaId: any, updatedData: Record<string, any>): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/ngarkesa/${ngarkesaId}`, { updatedData });
    return response.data;
  } catch (error) {
    console.error(`Error updating ngarkesa with ID ${ngarkesaId}:`, error);
    throw error;
  }
};

// **TOGGLE Ngarkesa Status (PATCH request)**
export const toggleNgarkesaStatus = async (ngarkesaId: any): Promise<any> => {
  try {
    const response = await axiosInstance.patch(`/ngarkesa/${ngarkesaId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling status of ngarkesa with ID ${ngarkesaId}:`, error);
    throw error;
  }
};
/**
 * * Employees
 */
export const getEmployees = async (page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc', status?: string, search?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const response = await axiosInstance.get(`/users/employees?${params.toString()}`);
  return response?.data ?? null;
};
export const getClients = async (page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc', status?: string, search?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', String(page));
  if (limit !== undefined) params.append('limit', String(limit));
  if (sort) params.append('sort', sort);
  if (order) params.append('order', order);
  if (search) params.append('search', search);
  const response = await axiosInstance.get(`/users/clients?${params.toString()}`);
  return response?.data ?? null;
};

export const getEmployeesList = async (page?: number, limit?: number, sort?: string, order?: 'asc' | 'desc',): Promise<any> => {
  const response = await axiosInstance.get(`/users/employees`);
  return response?.data ?? null;
};
/**
 * * Statistics
 */
export const getUsersByRole = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/users-by-role/:role');
  return response?.data ?? null;
};

export const getUsersWithOrders = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/users-with-orders');
  return response?.data ?? null;
};

export const getTotalProductsSold = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/total-products-sold');
  return response?.data ?? null;
};

export const getMostSoldProduct = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/most-sold-product');
  return response?.data ?? null;
};

export const getTotalRevenue = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/total-revenue');
  return response?.data ?? null;
};

export const getOrdersByStatus = async (status: string): Promise<any> => {
  const response = await axiosInstance.get(`/statistics/orders-by-status/${status}`);
  return response?.data ?? null;
};

export const getFirstFourMostSoldProducts = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/first-four-most-sold-products');
  return response?.data ?? null;
};

export const getTotalRevenuePerCategory = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/total-revenue-per-category');
  return response?.data ?? null;
};

export const getTotalCompletedOrders = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/total-completed-orders');
  return response?.data ?? null;
};

export const getOrdersByCountry = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/orders-by-country');
  return response?.data ?? null;
};

export const getRevenuePerCategoryLastYear = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/revenue-per-category-last-year');
  return response?.data ?? null;
};

export const getActiveUsers = async (): Promise<any> => {
  const response = await axiosInstance.get('/statistics/active-users');
  return response?.data ?? null;
};

export const getDiscounts = async (): Promise<any> => {
  const response = await axiosInstance.get('/discount');
  return response?.data ?? null;
};

export const getDiscountById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/discount/${id}`);
  return response?.data ?? null;
};

export const deleteDiscounts = async (id: any): Promise<any> => {
  const response = await axiosInstance.delete(`/discount/${id}`);
  return response?.data ?? null;
};
// Function to fetch orders by country


/*COUPONS */

export const getCoupon = async (code: string): Promise<any> => {
  const response = await axiosInstance.get(`/coupons/${code}`);
  return response?.data ?? null;
};
export const getCoupons = async (): Promise<any> => {
  const response = await axiosInstance.get(`/coupons`);
  return response?.data ?? null;
};
export const updateCoupon = async (): Promise<any> => {
  const response = await axiosInstance.get(`/coupons`);
  return response?.data ?? null;
};
export const getSmsCredit = async (): Promise<any> => {
  const response = await axiosInstance.get('/sms/credit');
  return response?.data ?? null;
};

export const getSmsIntlCredit = async (): Promise<any> => {
  const response = await axiosInstance.get('/sms/credit/intl');
  return response?.data ?? null;
};

export const getBusinessTypes = async (): Promise<any> => {
  const response = await axiosInstance.get(`/business-types`);
  return response?.data ?? null;
};
export const getBusinessTypeById = async (id: string): Promise<any> => {
  const response = await axiosInstance.get(`/business-types/${id}`);
  return response?.data ?? null;
};
export const updateBusinessType = async (): Promise<any> => {
  const response = await axiosInstance.get(`/business-types`);
  return response?.data ?? null;
};
export const getAdminHomepageCms = async (): Promise<any> => {
  const response = await axiosInstance.get(`/homepage`);
  return response?.data ?? null;
};

export const saveAdminHomepageCms = async (payload: any): Promise<any> => {
  const response = await axiosInstance.put(`/admin/homepage`, payload);
  return response?.data ?? null;
};

// Triggers a manual product sync from ProData (admin only). Returns
// { synced, count, skipped?, lastSyncAt }.
export const syncProdataProducts = async (): Promise<any> => {
  const response = await axiosInstance.post(`/prodata/sync`);
  return response?.data ?? null;
};

export const uploadCmsImage = async (file: File, folder: string): Promise<any> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axiosInstance.post(
    `/admin/cms/upload?folder=${encodeURIComponent(folder)}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response?.data ?? null;
};

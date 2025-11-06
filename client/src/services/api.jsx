import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";

      if (!url.includes("/login") && !url.includes("/register")) {
        localStorage.removeItem("token");

        if (error.config && error.config.triggerAuthModal) {
          const event = new CustomEvent("unauthorized");
          window.dispatchEvent(event);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  getSalesReport: async (days = 30) => {
    const response = await api.get(`/admin/sales-report?days=${days}`);
    return response.data;
  },

  getComprehensiveAnalytics: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/admin/analytics/comprehensive?${params}`);
    return response.data;
  },
};

export const movieAPI = {
  getMovies: async (endpoint = "/movies") => {
    try {
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMovieById: async (movieId) => {
    try {
      const response = await api.get(`/movies/${movieId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMyWatchlist: async () => {
    try {
      const response = await api.get("/watchlist");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  addToWatchlist: async (movieId) => {
    try {
      const response = await api.post("/watchlist", { movieId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  removeFromWatchlist: async (movieId) => {
    try {
      const response = await api.delete(`/watchlist/${movieId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  isInWatchlist: async (movieId) => {
    try {
      const watchlist = await this.getWatchlist();
      return watchlist.some((item) => item.movie._id === movieId);
    } catch (error) {
      return false;
    }
  },
};

export const showtimeAPI = {
  getShowtimes: async (params) => {
    const response = await api.get("/showtimes", { params });
    return response.data;
  },

  getShowtimeById: async (id) => {
    const response = await api.get(`/showtimes/${id}`);
    return response.data;
  },

  getSeatMap: async (showtimeId) => {
    const response = await api.get(`/showtimes/${showtimeId}/seats`);
    return response.data;
  },
};

export const theaterAPI = {
  getAllTheaters: async () => {
    const response = await api.get("/theaters");
    return response.data;
  },

  getTheaterById: async (id) => {
    const response = await api.get(`/theaters/${id}`);
    return response.data;
  },
};

export const bookingAPI = {
  initiateKhaltiPayment: async (showtimeId, seats) => {
    const response = await api.post("/bookings/initiate-khalti", {
      showtimeId,
      seats,
    });
    return response.data;
  },

  verifyKhaltiPayment: async (pidx, purchase_order_id) => {
    const response = await api.post("/bookings/verify-khalti", {
      pidx,
      purchase_order_id,
    });
    return response.data;
  },

  initiateEsewaPayment: async (showtimeId, seats) => {
    const response = await api.post("/bookings/initiate-esewa", {
      showtimeId,
      seats,
    });
    return response.data;
  },

  verifyEsewaPayment: async (transaction_uuid) => {
    const response = await api.post("/bookings/verify-esewa", {
      transaction_uuid,
    });
    return response.data;
  },

  getMyBookings: async () => {
    const response = await api.get("/bookings/my-bookings");
    return response.data;
  },

  resendEmail: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/resend-email`);
    return response.data;
  },

  downloadTicket: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}/ticket`);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return response.data;
  },
};

export const notificationAPI = {
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/notifications?${queryString}`);
    return response.data;
  },

  markAsRead: async (notificationIds = [], markAll = false) => {
    const response = await api.patch("/notifications/read", {
      notificationIds,
      markAll,
    });
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export const recommendationAPI = {
  getRecommendations: async (limit = 6) => {
    const response = await api.get(`/recommendations?limit=${limit}`);
    return response.data;
  },

  getUserPreferences: async () => {
    const response = await api.get("/recommendations/preferences");
    return response.data;
  },
};

export const historyAPI = {
  getMyHistory: async () => {
    const response = await api.get("/history");
    return response.data;
  },
};

export const reviewAPI = {
  getReviews: async (movieId) => {
    const response = await api.get(`/movies/${movieId}/reviews`);
    return response.data;
  },

  createReview: async (movieId, rating, comment) => {
    const response = await api.post(`/movies/${movieId}/reviews`, {
      rating,
      comment,
    });
    return response.data;
  },

  updateReview: async (movieId, reviewId, rating, comment) => {
    const response = await api.put(`/movies/${movieId}/reviews/${reviewId}`, {
      rating,
      comment,
    });
    return response.data;
  },

  deleteReview: async (movieId, reviewId) => {
    const response = await api.delete(`/movies/${movieId}/reviews/${reviewId}`);
    return response.data;
  },
};

export const postMultipart = (url, formData) => {
  return api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const putMultipart = (url, formData) => {
  return api.put(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default api;

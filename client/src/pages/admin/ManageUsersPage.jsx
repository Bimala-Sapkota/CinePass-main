import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import {
  FaSearch,
  FaUsers,
  FaUserShield,
  FaUserEdit,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import { getImageUrl } from "../../services/utils";

function ManageUsersPage() {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data.users);
    } catch (error) {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
    window.scrollTo(0, 0);
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;
    try {
      await api.delete(`/admin/users/${userId}`);
      showToast("User deleted successfully", "success");
      fetchUsers();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete user",
        "error"
      );
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role: newRole });
      showToast("User role updated successfully", "success");
      fetchUsers();
    } catch (error) {
      showToast("Failed to update user role", "error");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div
        className={`p-4 rounded-lg ${
          darkMode ? "bg-gray-800" : "bg-white"
        } mb-6 border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"
            }`}
          />
        </div>
      </div>

      <div
        className={`rounded-xl overflow-hidden ${
          darkMode ? "bg-gray-800" : "bg-white"
        } border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin mx-auto text-3xl text-purple-500" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className={
                    darkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-200 text-purple-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() =>
                        handleChangeRole(
                          user._id,
                          user.role === "admin" ? "user" : "admin"
                        )
                      }
                      title="Change Role"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <FaUserShield />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageUsersPage;

export const formatDate = (dateString, language = "en") => {
  if (!dateString) return "";
  const locale = language === "np" ? "ne-NP" : "en-US";
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";
  
  return date.toLocaleDateString(locale, {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatMonthDay = (dateString, locale = "en-US") => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (dateString, locale = "en-US") => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
export const formatDuration = (totalMinutes) => {
  if (isNaN(totalMinutes) || totalMinutes < 0) {
    return "";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let result = "";
  if (hours > 0) {
    result += `${hours}hr `;
  }
  if (minutes > 0) {
    result += `${minutes}m`;
  }
  return result.trim();
};

export const formatPrice = (price, currency = "NRs.") => {
  if (!price && price !== 0) return "";
  return `${currency} ${price.toLocaleString()}`;
};

export const formatBookingReference = (reference) => {
  if (!reference) return "";
  return reference.toUpperCase();
};

export const formatCastArray = (cast) => {
  if (!cast) return "Not available";

  if (
    Array.isArray(cast) &&
    cast.length > 0 &&
    typeof cast[0] === "string" &&
    !cast[0].includes('"')
  ) {
    return cast.join(", ");
  }

  let castString = Array.isArray(cast) ? JSON.stringify(cast) : cast.toString();

  const cleanedCast = castString
    .replace(/[\[\]"\\]/g, "")
    .split(",")
    .map((name) => name.trim())
    .filter(
      (name) => name.length > 0 && name !== "null" && name !== "undefined"
    )
    .join(", ");

  return cleanedCast || "Not available";
};

export const getBookingStatusColor = (status, darkMode = false) => {
  const colors = {
    Pending: darkMode ? "text-yellow-400" : "text-yellow-600",
    Confirmed: darkMode ? "text-green-400" : "text-green-600",
    Cancelled: darkMode ? "text-red-400" : "text-red-600",
    Used: darkMode ? "text-gray-400" : "text-gray-600",
    Completed: darkMode ? "text-green-400" : "text-green-600",
    Failed: darkMode ? "text-red-400" : "text-red-600",
    Refunded: darkMode ? "text-blue-400" : "text-blue-600",
  };
  return colors[status] || (darkMode ? "text-gray-400" : "text-gray-600");
};

export const getImageUrl = (imageData, fallback = "/default-banner.png") => {
  if (!imageData) {
    return fallback;
  }

  if (typeof imageData === "string") {
    if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
      return imageData;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const cleanPath = imageData.startsWith("/")
      ? imageData.substring(1)
      : imageData;
    return `${baseUrl}/${cleanPath}`;
  }

  if (typeof imageData === "object" && imageData.url) {
    if (
      imageData.url.startsWith("http://") ||
      imageData.url.startsWith("https://")
    ) {
      return imageData.url;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const cleanPath = imageData.url.startsWith("/")
      ? imageData.url.substring(1)
      : imageData.url;
    return `${baseUrl}/${cleanPath}`;
  }

  return fallback;
};

export const getUserAvatarUrl = (user, fallback = "/default-avatar.png") => {
  if (!user || !user.avatar) {
    return fallback;
  }

  if (typeof user.avatar === "string") {
    if (
      user.avatar.startsWith("http://") ||
      user.avatar.startsWith("https://")
    ) {
      return user.avatar;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const cleanPath = user.avatar.startsWith("/")
      ? user.avatar.substring(1)
      : user.avatar;
    return `${baseUrl}/${cleanPath}`;
  }

  if (typeof user.avatar === "object" && user.avatar.url) {
    if (
      user.avatar.url.startsWith("http://") ||
      user.avatar.url.startsWith("https://")
    ) {
      return user.avatar.url;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const cleanPath = user.avatar.url.startsWith("/")
      ? user.avatar.url.substring(1)
      : user.avatar.url;
    return `${baseUrl}/${cleanPath}`;
  }

  return fallback;
};

export const getGenreColor = (genre, darkMode) => {
  const colors = {
    Action: "bg-red-500",
    Comedy: "bg-yellow-500",
    Drama: "bg-blue-500",
    Horror: "bg-purple-600",
    Romance: "bg-pink-500",
    Thriller: "bg-gray-500",
    "Sci-Fi": "bg-green-500",
    Fantasy: "bg-indigo-500",
  };
  return colors[genre] || (darkMode ? "bg-gray-700" : "bg-gray-300");
};

export const generateQRCodeUrl = (data, size = "200x200") => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodeURIComponent(
    data
  )}`;
};

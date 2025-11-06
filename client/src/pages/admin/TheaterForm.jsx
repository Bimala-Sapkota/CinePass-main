import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import api, { postMultipart, putMultipart } from "../../services/api";
import { FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { useEffect } from "react";

const defaultScreen = {
  name: "Audi 1",
  rows: 10,
  seatsPerRow: 15,
  premiumSeats: "D4, D5, D6, D7, E4, E5, E6, E7",
};

const initialFormState = {
  name: "",
  nameNepali: "",
  location: "",
  locationNepali: "",
  city: "",
  screens: [defaultScreen],
  amenities: [],
  contact: { phone: "", email: "" },
  existingImages: [],
};

function TheaterForm({ theaterToEdit, onFormSubmit, onCancel }) {
  const { darkMode } = useTheme();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(initialFormState);
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(false);

  const amenityOptions = [
    "Parking",
    "Food Court",
    "Dolby Sound",
    "IMAX",
    "3D",
    "Recliner Seats",
    "Wheelchair Access",
    "Air Conditioned",
  ];

  useEffect(() => {
    if (theaterToEdit) {
      setFormData({
        name: theaterToEdit.name || "",
        nameNepali: theaterToEdit.nameNepali || "",
        location: theaterToEdit.location || "",
        locationNepali: theaterToEdit.locationNepali || "",
        city: theaterToEdit.city || "",
        screens:
          theaterToEdit.screens?.length > 0
            ? theaterToEdit.screens.map((screen) => ({
                ...screen,
                premiumSeats: screen.premiumSeats?.join(",") || "",
              }))
            : [defaultScreen],
        amenities: theaterToEdit.amenities || [],
        contact: {
          phone: theaterToEdit.contact?.phone || "",
          email: theaterToEdit.contact?.email || "",
        },
        existingImages: theaterToEdit.images || [],
      });
      setImagesToUpload([]);
      setImagesToDelete([]);
    } else {
      setFormData(initialFormState);
      setImagesToUpload([]);
      setImagesToDelete([]);
    }
  }, [theaterToEdit]);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (name === "amenities") {
      setFormData((prev) => ({
        ...prev,
        amenities: checked
          ? [...prev.amenities, value]
          : prev.amenities.filter((a) => a !== value),
      }));
    } else if (type === "file") {
      setImagesToUpload(Array.from(files));
    } else if (name === "phone" || name === "email") {
      setFormData((prev) => ({
        ...prev,
        contact: { ...prev.contact, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMarkImageForDeletion = (image) => {
    setImagesToDelete((prev) => [...prev, image]);
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter(
        (img) => img.public_id !== image.public_id
      ),
    }));
  };

  const handleScreenChange = (index, field, value) => {
    const updatedScreens = [...formData.screens];
    updatedScreens[index][field] = value;
    setFormData((prev) => ({ ...prev, screens: updatedScreens }));
  };

  const addScreen = () => {
    const newScreen = {
      name: `Audi ${formData.screens.length + 1}`,
      rows: 10,
      seatsPerRow: 15,
      premiumSeats: "",
    };
    setFormData((prev) => ({ ...prev, screens: [...prev.screens, newScreen] }));
  };

  const removeScreen = (index) => {
    if (formData.screens.length > 1) {
      const updatedScreens = formData.screens.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, screens: updatedScreens }));
    } else {
      showToast("Theater must have at least one screen", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.location || !formData.city) {
        showToast("Name, location, and city are required fields", "error");
        setLoading(false);
        return;
      }

      const data = new FormData();

      data.append("name", formData.name);
      data.append("location", formData.location);
      data.append("city", formData.city);
      if (formData.nameNepali) {
        data.append("nameNepali", formData.nameNepali);
      }
      if (formData.locationNepali) {
        data.append("locationNepali", formData.locationNepali);
      }
      if (formData.contact.phone) {
        data.append("contact.phone", formData.contact.phone);
      }
      if (formData.contact.email) {
        data.append("contact.email", formData.contact.email);
      }

      const sanitizedScreens = formData.screens.map((screen) => ({
        name: screen.name,
        rows: screen.rows,
        seatsPerRow: screen.seatsPerRow,
        premiumSeats: screen.premiumSeats
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      }));

      data.append("screens", JSON.stringify(sanitizedScreens));

      if (formData.amenities.length > 0) {
        formData.amenities.forEach((amenity) => {
          data.append("amenities[]", amenity);
        });
      }

      if (imagesToDelete.length > 0) {
        data.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }
      if (imagesToUpload.length > 0) {
        imagesToUpload.forEach((file) => data.append("images", file));
      }

      if (theaterToEdit) {
        await putMultipart(`/theaters/${theaterToEdit._id}`, data);
        showToast("Theater updated successfully!", "success");
      } else {
        await postMultipart("/theaters", data);
        showToast("Theater created successfully!", "success");
        setFormData(initialFormState);
        setImagesToUpload([]);
      }
      if (onFormSubmit) onFormSubmit();
    } catch (error) {
      console.error("Failed to save theater:", error);
      console.error("Error response:", error.response?.data);
      showToast(
        error.response?.data?.message || "An unexpected error occured.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className={`p-6 md:p-8 rounded-xl shadow-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      } animate-fade-in`}
    >
      <h2
        className={`text-2xl font-bold mb-6 border-b pb-4 ${
          darkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        {theaterToEdit ? "Edit Theater" : "Add New Theater"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="transition duration-300">
            <label
              htmlFor="name"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Name (English)
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full p-2 border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>
          <div className="transition duration-300">
            <label
              htmlFor="nameNepali"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Name (Nepali)
            </label>
            <input
              type="text"
              name="nameNepali"
              value={formData.nameNepali}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>
          <div className="transition duration-300">
            <label
              htmlFor="location"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className={`w-full p-2 border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>
          <div className="transition duration-300">
            <label
              htmlFor="locationNepali"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Location (Nepali)
            </label>
            <input
              type="text"
              name="locationNepali"
              value={formData.locationNepali}
              onChange={handleChange}
              required
              className={`w-full p-2 border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>
          <div className="transition duration-300">
            <label
              htmlFor="city"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., Butwal"
              required
              className={`w-full p-2 border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>
        </div>
        {/* Contact info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="phone"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Contact Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.contact.phone}
              onChange={handleChange}
              placeholder="+977-XXX-XXXXXXX"
              className={`w-full p-2 border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Contact Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.contact.email}
              onChange={handleChange}
              placeholder="theater@example.com"
              className={`w-full p-2 border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>
        </div>
        {/* amenities */}
        <div>
          <label className={`block text-sm font-medium mb-2`}>Amenities</label>

          <div
            className={`p-4 border rounded-md grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${
              darkMode ? "border-gray-600" : "border-gray-300"
            }`}
          >
            {amenityOptions.map((amenity) => (
              <label
                key={amenity}
                className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
                  formData.amenities.includes(amenity)
                    ? "bg-purple-600/20"
                    : "hover:bg-gray-500/10"
                }`}
              >
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onChange={handleChange}
                  className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 border-gray-400 bg-transparent"
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>

        {/* Screens Configuration */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={`block text-sm font-medium`}>
              Screens Configuration *
            </label>
            <button
              type="button"
              onClick={addScreen}
              className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              <FaPlus size={12} /> Add Screen
            </button>
          </div>
          <div className="space-y-4">
            {formData.screens.map((screen, index) => (
              <div
                key={screen._id || index}
                className={`p-4 border rounded-md ${
                  darkMode
                    ? "border-gray-600 bg-gray-700/50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Screen {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeScreen(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove screen"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium">Screen Name</label>
                    <input
                      type="text"
                      value={screen.name}
                      onChange={(e) =>
                        handleScreenChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., Audi 1"
                      className={`w-full p-2 border rounded-md text-sm ${
                        darkMode
                          ? "bg-gray-600 border-gray-500"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Rows</label>
                    <input
                      type="number"
                      value={screen.rows}
                      onChange={(e) =>
                        handleScreenChange(
                          index,
                          "rows",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      max="26"
                      className={`w-full p-2 border rounded-md text-sm ${
                        darkMode
                          ? "bg-gray-600 border-gray-500"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Seats Per Row</label>
                    <input
                      type="number"
                      value={screen.seatsPerRow}
                      onChange={(e) =>
                        handleScreenChange(
                          index,
                          "seatsPerRow",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      max="30"
                      className={`w-full p-2 border rounded-md text-sm ${
                        darkMode
                          ? "bg-gray-600 border-gray-500"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-medium">
                    Premium Seats (comma-separated, e.g., D5, D6, D7, E5, E6,
                    E7)
                  </label>
                  <input
                    type="text"
                    value={screen.premiumSeats || ""}
                    onChange={(e) =>
                      handleScreenChange(index, "premiumSeats", e.target.value)
                    }
                    placeholder="D4, D5, D6, D7, E4, E5, E6, E7"
                    className={`w-full p-2 border rounded-md text-sm ${
                      darkMode
                        ? "bg-gray-600 border-gray-500"
                        : "bg-white border-gray-300"
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Total seats: {screen.rows * screen.seatsPerRow}, Premium:
                    {screen.premiumSeats
                      ? screen.premiumSeats.split(",").filter((s) => s.trim())
                          .length
                      : 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manages images section */}
        <div>
          <label
            className={`block text-sm font-medium mb-1 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Manage Images
          </label>

          {/* Display existing images */}
          {formData.existingImages && formData.existingImages.length > 0 && (
            <div
              className={`flex flex-wrap gap-4 p-4 border rounded-md mb-4 ${
                darkMode ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              {formData.existingImages
                .filter((image) => image && image.url)
                .map((image) => (
                  <div key={image._id || image.public_id} className="relative">
                    <img
                      src={image.url}
                      alt="Theater"
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleMarkImageForDeletion(image)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none shadow-md hover:bg-red-700"
                      title="Delete Image"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
            </div>
          )}
          {/* images */}
          <div className="transition duration-300">
            <label
              htmlFor="images"
              className={`block text-sm font-medium mb-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Upload New Images{" "}
              <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleChange}
              multiple
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-100 dark:file:bg-purple-800 dark:file:text-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />
            {imagesToUpload.length > 0 && (
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <span className="block font-medium">
                  New file(s) to upload:
                </span>
                <ul className="list-disc pl-5 text-xs">
                  {imagesToUpload.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center items-center pt-4 gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-md font-semibold text-white
      transition-all duration-300 ease-in-out transform hover:scale-105
      ${
        loading
          ? "bg-purple-400 cursor-not-allowed"
          : "bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/50"
      }`}
          >
            {loading
              ? "Saving..."
              : theaterToEdit
              ? "Update Theater"
              : "Save Theater"}
          </button>

          {theaterToEdit && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-8 py-3 rounded-md font-semibold text-white bg-gray-500 hover:bg-gray-600 transition-colors duration-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TheaterForm;

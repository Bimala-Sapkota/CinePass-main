import React, { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import api, { postMultipart, putMultipart } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

//Reusable Input Component
const FormInput = ({ label, name, value, onChange, ...props }) => {
  const { darkMode } = useTheme();
  const isFile = props.type === "file";

  if (isFile) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div className="flex items-center gap-4">
          <label
            htmlFor={name}
            className={`px-4 py-2 rounded-md font-medium cursor-pointer transition-colors duration-200 shadow-sm border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-base
              ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-purple-700 hover:text-white"
                  : "bg-white border-gray-300 text-gray-900 hover:bg-purple-600 hover:text-white"
              }
            `}
          >
            Choose File
            <input
              id={name}
              name={name}
              type="file"
              onChange={onChange}
              className="hidden"
              {...props}
            />
          </label>
          <span
            className={`truncate text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {value && value.name ? value.name : "No file chosen"}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium mb-2">
        {label}
      </label>

      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded-md transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
          darkMode
            ? `bg-gray-700 border-gray-600 focus:ring-purple-400 focus:border-purple-400`
            : "bg-white border-gray-300 focus:ring-purple-500 focus:border-purple-500"
        }`}
        {...props}
      />
    </div>
  );
};

//Reusable Component for boolean fields
const FormToggle = ({ label, name, checked, onChange }) => {
  const { darkMode } = useTheme();
  return (
    <label
      htmlFor={name}
      className="flex items-center justify-between cursor-pointer select-none"
    >
      <span
        className={`text-sm font-medium ${
          darkMode ? "text-gray-200" : "text-gray-800"
        }`}
      >
        {label}
      </span>
      <div className="relative flex items-center ">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div
          className={`block w-10 h-4 rounded-full transition-colors duration-200 shadow-inner border-2 ${
            checked
              ? darkMode
                ? "bg-purple-700 border-purple-500"
                : "bg-purple-600 border-purple-500"
              : darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-300 border-gray-300"
          }`}
        ></div>
        <div
          className={`absolute top-0 left-0 w-4 h-4 rounded-full shadow-md transition-transform duration-200 bg-white border border-gray-300 ${
            checked ? "translate-x-6" : ""
          }`}
        ></div>
      </div>
    </label>
  );
};

const getImageFileName = (imageData) => {
  if (!imageData) return null;

  if (typeof imageData === "string") {
    return imageData.split("/").pop();
  }

  if (typeof imageData === "object" && imageData.url) {
    return imageData.url.split("/").pop();
  }

  return null;
};

const initialFormState = {
  title: "",
  titleNepali: "",
  description: "",
  descriptionNepali: "",
  director: "",
  cast: "",
  duration: "",
  genre: [],
  language: "Nepali",
  certification: "U",
  releaseDate: "",
  trailerUrl: "",
  posterImage: null,
  bannerImage: null,
  featured: false,
  isNowShowing: true,
  // isLatest: true,
  isComingSoon: false,
};

function MovieForm({ movieToEdit, onFormSubmit, onCancel }) {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movieToEdit) {
      setFormData({
        title: movieToEdit?.title || "",
        titleNepali: movieToEdit?.titleNepali || "",
        description: movieToEdit?.description || "",
        descriptionNepali: movieToEdit?.descriptionNepali || "",
        director: movieToEdit?.director || "",
        cast: movieToEdit?.cast?.join(", ") || "",
        duration: movieToEdit?.duration || "",
        genre: Array.isArray(movieToEdit?.genre)
          ? movieToEdit.genre
          : movieToEdit?.genre
          ? [movieToEdit.genre]
          : [],
        language: movieToEdit?.language || "Nepali",
        certification: movieToEdit?.certification || "U",
        releaseDate: movieToEdit?.releaseDate
          ? new Date(movieToEdit.releaseDate).toISOString().split("T")[0]
          : "",
        trailerUrl: movieToEdit?.trailerUrl || "",
        posterImage: null,
        bannerImage: null,
        featured: movieToEdit?.featured || false,
        isNowShowing: movieToEdit?.isNowShowing || true,
        // isLatest: movieToEdit?.isLatest || true,
        isComingSoon: movieToEdit?.isComingSoon || false,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [movieToEdit]);

  const genreOptions = [
    "Action",
    "Comedy",
    "Drama",
    "Thriller",
    "Romance",
    "Sci-Fi",
    "Horror",
    "RomCom",
    "Adventure",
    "Animation",
    "Biography",
    "Political",
    "Crime",
    "Documentary",
    "Family",
    "Fantasy",
    "History",
    "Musical",
    "Mystery",
    "Mythological",
    "Sports",
    "War",
    "Western",
  ];

  const certificationOptions = [
    "G",
    "PG",
    "PG-13",
    "R",
    "NC-17",
    "U",
    "U/A",
    "A",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "genre") {
      const newGenres = [...formData.genre];
      if (checked) {
        newGenres.push(value);
      } else {
        const index = newGenres.indexOf(value);
        if (index > -1) newGenres.splice(index, 1);
      }
      setFormData((prev) => ({ ...prev, genre: newGenres }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.genre.length === 0) {
      showToast("Please select at least one genre.", "error");
      return;
    }
    setLoading(true);

    const data = new FormData();

    const castArray = formData.cast.split(",").map((item) => item.trim());
    castArray.forEach((actor) => data.append("cast", actor));
    formData.genre.forEach((g) => data.append("genre", g));

    for (const key in formData) {
      if (key !== "cast" && key !== "genre") {
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      }
    }

    try {
      if (movieToEdit) {
        await putMultipart(`/movies/${movieToEdit._id}`, data);
      } else {
        await postMultipart("/movies", data);
      }
      showToast(
        `Movie ${movieToEdit ? "updated" : "added"} successfully!`,
        "success"
      );
      if (onFormSubmit) onFormSubmit();
    } catch (error) {
      console.error("Failed to save movie:", error);
      showToast(error.response?.data?.message || "An error occured", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className={`p-6 md:p-8 rounded-lg shadow-xl ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2 className="text-2xl font-bold mb-6 border-b pb-4">
        {movieToEdit
          ? t("चलचित्र सम्पादन गर्नुहोस्", "Edit Movie")
          : t("नयाँ चलचित्र थप्नुहोस्", "Add New Movie")}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
      >
        {/* left col */}
        <div className="space-y-6">
          <FormInput
            label="Title (English)"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Title (Nepali)"
            name="titleNepali"
            value={formData.titleNepali}
            onChange={handleChange}
          />

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description (English)
            </label>
            <textarea
              name="description"
              value={formData.description}
              id="description"
              onChange={handleChange}
              required
              rows="4"
              className={`w-full p-2 border rounded-md transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[100px] text-base ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-400 focus:border-purple-400"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="descriptionNepali"
              className="block text-sm font-medium mb-1"
            >
              Description (Nepali)
            </label>
            <textarea
              name="descriptionNepali"
              value={formData.descriptionNepali}
              id="descriptionNepali"
              onChange={handleChange}
              rows="4"
              className={`w-full p-2 border rounded-md transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[100px] text-base ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-400 focus:border-purple-400"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            ></textarea>
          </div>

          <FormInput
            label="Director"
            name="director"
            value={formData.director}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Cast (comma separated)"
            name="cast"
            value={formData.cast}
            onChange={handleChange}
            required
            placeholder="e.g. Actor One, Actor Two"
          />
        </div>

        {/* right col */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Duration (mins)"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
            />
            <FormInput
              label="Language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium mb-2">
              Genre (Select at least one)
            </label>
            <div
              className={`p-3 border rounded-md grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto ${
                darkMode ? "border-gray-600" : "border-gray-300"
              }`}
            >
              {genreOptions.map((genre) => (
                <label key={genre} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="genre"
                    value={genre}
                    checked={formData.genre.includes(genre)}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-400 [appearance:checkbox]"
                  />
                  {genre}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Release Date"
              name="releaseDate"
              type="date"
              value={formData.releaseDate}
              onChange={handleChange}
              required
            />
            <div>
              <label
                htmlFor="certification"
                className="block text-sm font-medium mb-1"
              >
                Certification
              </label>
              <select
                name="certification"
                id="certification"
                value={formData.certification}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md transition-colors duration-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none text-base ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-400 focus:border-purple-400"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                {certificationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FormInput
            label="Trailer URL"
            name="trailerUrl"
            value={formData.trailerUrl}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=..."
          />

          <FormInput
            label="Poster Image"
            name="posterImage"
            type="file"
            value={formData.posterImage}
            onChange={handleChange}
            accept="image/*"
            required={!movieToEdit}
          />
          {movieToEdit?.posterImage && !formData.posterImage && (
            <div className="text-sm text-gray-500 -mt-4">
              <p>
                Current:{" "}
                {getImageFileName(movieToEdit.posterImage) || "Image uploaded"}
              </p>
              {typeof movieToEdit.posterImage === "object" &&
                movieToEdit.posterImage.url && (
                  <img
                    src={movieToEdit.posterImage.url}
                    alt="Current poster"
                    className="mt-2 w-20 h-28 object-cover rounded border"
                  />
                )}
            </div>
          )}

          <FormInput
            label="Banner Image"
            name="bannerImage"
            type="file"
            value={formData.bannerImage}
            onChange={handleChange}
            accept="image/*"
          />
          {movieToEdit?.bannerImage && !formData.bannerImage && (
            <div className="text-sm text-gray-500 -mt-4">
              <p>
                Current:{" "}
                {getImageFileName(movieToEdit.bannerImage) || "Image uploaded"}
              </p>
              {typeof movieToEdit.bannerImage === "object" &&
                movieToEdit.bannerImage.url && (
                  <img
                    src={movieToEdit.bannerImage.url}
                    alt="Current banner"
                    className="mt-2 w-20 h-28 object-cover rounded border"
                  />
                )}
            </div>
          )}
          <div
            className={`p-4 border rounded-md space-y-4 ${
              darkMode ? "border-gray-600" : "border-gray-300"
            }`}
          >
            <h3 className="font-medium text-sm mb-2">Movie Status</h3>
            <FormToggle
              label="Featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
            />
            <FormToggle
              label="Now Showing"
              name="isNowShowing"
              checked={formData.isNowShowing}
              onChange={handleChange}
            />
            {/* <FormToggle
              label="Latest Release"
              name="isLatest"
              checked={formData.isLatest}
              onChange={handleChange}
            /> */}
            <FormToggle
              label="Coming Soon"
              name="isComingSoon"
              checked={formData.isComingSoon}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="md:col-span-2 text-center mt-4">
          <button
            type="submit"
            disabled={loading || formData.genre.length === 0}
            className="bg-purple-600 text-white  px-8 py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors duration-300 disabled:bg-purple-400 disabled:cursor-not-allowed"
          >
            {loading
              ? "Saving..."
              : movieToEdit
              ? "Update Movie"
              : "Save Movie"}
          </button>

          {movieToEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="ml-4 bg-gray-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-600 transition-colors duration-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default MovieForm;

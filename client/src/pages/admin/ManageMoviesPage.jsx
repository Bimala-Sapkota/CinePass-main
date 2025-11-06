import React, { useState } from "react";
import MovieForm from "./MovieForm";
import MovieList from "./MovieList";
import { useToast } from "../../context/ToastContext";
import { useEffect } from "react";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

function ManageMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState(null);
  const { showToast } = useToast();
  const { t } = useLanguage();

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await api.get("/movies");
      setMovies(response.data.data);
    } catch (error) {
      showToast("Failed to fetch movies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
    window.scrollTo(0, 0);
  }, []);

  const handleFormSuccess = () => {
    setMovieToEdit(null);
    fetchMovies();
  };

  const handleEditMovie = (movie) => {
    setMovieToEdit(movie);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMovieDeleted = async (movieId) => {
    const originalMovies = [...movies];
    setMovies(movies.filter((movie) => movie._id !== movieId));

    try {
      await api.delete(`/movies/${movieId}`);
      showToast("Movie deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete movie", "error");
      setMovies(originalMovies);
    }
  };

  const handleCancelEdit = () => {
    setMovieToEdit(null);
  };

  return (
    <div>
      <MovieForm
        movieToEdit={movieToEdit}
        onFormSubmit={handleFormSuccess}
        onCancel={handleCancelEdit}
      />
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          {t("अवस्थित चलचित्रहरू", "Existing Movies")}
        </h2>
        <MovieList
          movies={movies}
          loading={loading}
          onMovieDeleted={handleMovieDeleted}
          onEditMovie={handleEditMovie}
        />
      </div>
    </div>
  );
}

export default ManageMoviesPage;

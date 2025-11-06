import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../../services/api";
import MovieForm from "./MovieForm";
import { useLanguage } from "../../context/LanguageContext";

function EditMoviePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await api.get(`/movies/${id}`);
        setMovie(response.data.data);
      } catch (error) {
        console.error("Failed to fetch movie for editing:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const handleUpdateSuccess = () => {
    navigate("/admin/movies");
  };

  if (loading)
    return <p>{t("चलचित्र विवरण लोड हुँदैछ...", "Loading movie data...")}</p>;
  if (!movie) return <p>{t("चलचित्र फेला परेन।", "Movie not found.")}</p>;

  return <MovieForm movieToEdit={movie} onFormSubmit={handleUpdateSuccess} />;
}

export default EditMoviePage;

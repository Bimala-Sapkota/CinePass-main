import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import api from "./../../services/api";
import { FaTrash } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";

const getNowForInput = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

function ManageShowtimesPage() {
  const { darkMode } = useTheme();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [allShowtimes, setAllShowtimes] = useState([]);

  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("");

  const [screen, setScreen] = useState("");
  const [availableScreens, setAvailableScreens] = useState([]);

  const [startTime, setStartTime] = useState("");
  const [ticketPrice, setTicketPrice] = useState({
    standard: 300,
    premium: 500,
  });

  const [loading, setLoading] = useState(false);

  const fetchAllShowtimes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/showtimes`);
      const groupedData = res.data.data || [];

      const flatShowtimes = groupedData.flatMap((group) =>
        group.showtimes.map((showtime) => ({
          ...showtime,
          theater: group.theater,
        }))
      );

      setAllShowtimes(flatShowtimes);
      filterShowtimes(flatShowtimes, selectedMovie, selectedTheater);
    } catch (error) {
      console.error("Failed to fetch showtimes", error);
      showToast(
        t("शो समयहरू ल्याउन असफल", "Failed to fetch showtimes"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showToast, t, movies]);

  const filterShowtimes = useCallback((showtimesList, movieId, theaterId) => {
    let filtered = showtimesList;

    if (movieId) {
      filtered = filtered.filter((st) => {
        const stMovieId = st.movie?._id || st.movie;
        return stMovieId === movieId;
      });
    }

    if (theaterId) {
      filtered = filtered.filter((st) => {
        const stTheaterId = st.theater?._id || st.theater;
        return stTheaterId === theaterId;
      });
    }

    setShowtimes(filtered);
  }, []);
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [moviesRes, theatersRes] = await Promise.all([
          api.get("/movies"),
          api.get("/theaters"),
        ]);

        setMovies(moviesRes.data.data);
        setTheaters(theatersRes.data.data);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        showToast("Could not load movies and theaters.", "error");
      }
    };
    fetchInitialData();
    window.scrollTo(0, 0);
  }, [showToast]);

  useEffect(() => {
    if (movies.length > 0) {
      fetchAllShowtimes();
    }
  }, [movies, fetchAllShowtimes]);

  useEffect(() => {
    const fetchScreensForSelectedTheater = async () => {
      if (selectedTheater) {
        try {
          const res = await api.get(`/theaters/${selectedTheater}`);
          setAvailableScreens(res.data.data.screens || []);
          setScreen("");
        } catch (error) {
          console.error("Failed to fetch screens for theater", error);
          setAvailableScreens([]);
        }
      } else {
        setAvailableScreens([]);
      }
    };
    fetchScreensForSelectedTheater();
  }, [selectedTheater]);

  useEffect(() => {
    filterShowtimes(allShowtimes, selectedMovie, selectedTheater);
  }, [selectedMovie, selectedTheater, allShowtimes, filterShowtimes]);

  const handleAddShowtime = async (e) => {
    e.preventDefault();
    if (!selectedMovie || !selectedTheater || !screen || !startTime) {
      showToast(
        t("कृपया सबै फिल्डहरू भर्नुहोस्।", "Please fill all fields."),
        "error"
      );
      return;
    }

    if (
      !ticketPrice.standard ||
      ticketPrice.standard <= 0 ||
      !ticketPrice.premium ||
      ticketPrice.premium <= 0
    ) {
      showToast(
        t(
          "कृपया मान्य टिकट मूल्यहरू प्रविष्ट गर्नुहोस्।",
          "Please enter valid ticket prices."
        ),
        "error"
      );
      return;
    }

    try {
      const payload = {
        movie: selectedMovie,
        theater: selectedTheater,
        screen,
        startTime,
        ticketPrice: {
          standard: Number(ticketPrice.standard),
          premium: Number(ticketPrice.premium),
        },
      };

      const response = await api.post("/showtimes", payload);
      showToast(
        t("शो समय सफलतापूर्वक थपियो!", "Showtime added successfully!"),
        "success"
      );

      await fetchAllShowtimes();

      setScreen("");
      setStartTime("");
      setTicketPrice({ standard: 300, premium: 500 });
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          t("शो समय थप्न असफल।", "Failed to add showtime."),
        "error"
      );
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (
      window.confirm(
        t(
          "के तपाईं यो शो समय मेटाउन निश्चित हुनुहुन्छ?",
          "Are you sure you want to delete this showtime?"
        )
      )
    ) {
      try {
        await api.delete(`/showtimes/${showtimeId}`);
        showToast(
          t("शो समय सफलतापूर्वक मेटाइयो!", "Showtime deleted successfully!"),
          "success"
        );
        setAllShowtimes((prev) => prev.filter((s) => s._id !== showtimeId));
        setShowtimes((prev) => prev.filter((s) => s._id !== showtimeId));
      } catch (error) {
        showToast(
          error.response?.data?.message ||
            t("शो समय मेटाउन असफल।", "Failed to delete showtime."),
          "error"
        );
      }
    }
  };

  const getScreenInfo = useCallback(
    (screenName) => {
      const theater = theaters.find((t) => t._id === selectedTheater);
      const screenInfo = theater?.screens?.find((s) => s.name === screenName);
      return screenInfo;
    },
    [theaters, selectedTheater]
  );

  const getMovieTitle = useCallback(
    (show) => {
      if (show.movie?.title) return show.movie.title;

      if (typeof show.movie === "string") {
        const movie = movies.find((m) => m._id === show.movie);
        return movie?.title || t("अज्ञात चलचित्र", "Unknown Movie");
      }

      return t("अज्ञात चलचित्र", "Unknown Movie");
    },
    [movies, t]
  );

  const getTheaterName = useCallback(
    (show) => {
      if (show.theater?.name)
        return `${show.theater.name} - ${show.theater.location}`;
      if (typeof show.theater === "string") {
        const theater = theaters.find((t) => t._id === show.theater);
        return theater
          ? `${theater.name} - ${theater.location}`
          : t("अज्ञात थिएटर", "Unknown Theater");
      }

      return t("अज्ञात थिएटर", "Unknown Theater");
    },
    [theaters, t]
  );

  const noShowtimesMessage = useMemo(() => {
    if (selectedMovie || selectedTheater) {
      return t(
        "चयन गरिएको चलचित्र र थिएटरको लागि कुनै शो समय फेला परेन। माथि एउटा थप्नुहोस्!",
        "No showtimes found for the selected movie and theater. Add one above!"
      );
    }
    return t(
      "कुनै शो समय फेला परेन। माथि एउटा थप्नुहोस्!",
      "No showtimes found. Add one above!"
    );
  }, [selectedMovie, selectedTheater, t]);

  return (
    <div className="space-y-8">
      {/* section 1: add new showtime */}
      <div
        className={`p-6 rounded-lg shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">
          {t("शो समय थप्नुहोस्", "Add Showtime")}
        </h2>
        <form
          onSubmit={handleAddShowtime}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end"
        >
          <div>
            <label htmlFor="movie" className="block text-sm font-medium mb-1">
              {t("चलचित्र", "Movie")}
            </label>
            <select
              name="movie"
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                darkMode ? "bg-gray-700 border-gray-600" : ""
              }`}
            >
              <option value="">
                {t("चलचित्र छान्नुहोस्", "Select a Movie")}
              </option>
              {movies.map((movie) => (
                <option key={movie._id} value={movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="theater" className="block text-sm font-medium mb-1">
              {t("थिएटर", "Theater")}
            </label>
            <select
              name="theater"
              value={selectedTheater}
              onChange={(e) => setSelectedTheater(e.target.value)}
              className={`w-full p-2 border rounded-md ${
                darkMode ? "bg-gray-700 border-gray-600" : ""
              }`}
            >
              <option value="">
                {t("थिएटर छान्नुहोस्", "Select a Theater")}
              </option>
              {theaters.map((theater) => (
                <option key={theater._id} value={theater._id}>
                  {theater.name} - {theater.location}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="screen"
                className="block text-sm font-medium mb-1"
              >
                {t("स्क्रिन", "Screen")}
              </label>
              <select
                name="screen"
                value={screen}
                onChange={(e) => setScreen(e.target.value)}
                disabled={!selectedTheater}
                className={`w-full p-2 border rounded-md ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                } ${!selectedTheater ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <option value="">
                  {t("स्क्रिन छान्नुहोस्", "Select Screen")}
                </option>
                {availableScreens.map((screenObj, index) => (
                  <option
                    key={screenObj._id || `${screenObj.name}-${index}`}
                    value={screenObj.name}
                  >
                    {screenObj.name} ({screenObj.rows} {t("पङ्क्तिहरू", "rows")}{" "}
                    * {screenObj.seatsPerRow} {t("सिटहरू", "seats")})
                  </option>
                ))}
              </select>
              {screen && getScreenInfo(screen)?.premiumSeats && (
                <p className="text-xs text-gray-500 mt-1">
                  {t("प्रिमियम सिटहरू:", "Premium seats:")}
                  {getScreenInfo(screen).premiumSeats.join(", ")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium mb-1"
              >
                {t("सुरु समय", "Start Time")}
              </label>
              <input
                type="datetime-local"
                value={startTime}
                name="startTime"
                onChange={(e) => setStartTime(e.target.value)}
                min={getNowForInput()}
                className={`w-full p-2 border rounded-md ${
                  darkMode ? "bg-gray-700 border-gray-600" : ""
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="standardPrice"
                className="block text-sm font-medium mb-1"
              >
                {t("मानक टिकट मूल्य (रु.)", "Standard Ticket Price (NRs)")}
              </label>
              <input
                type="number"
                name="standardPrice"
                value={ticketPrice.standard}
                onChange={(e) =>
                  setTicketPrice({ ...ticketPrice, standard: e.target.value })
                }
                min="0"
                step="50"
                className={`w-full p-2 border rounded-md ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="premiumPrice"
                className="block text-sm font-medium mb-1"
              >
                {t("प्रिमियम टिकट मूल्य (रु.)", "Premium Ticket Price (NRs)")}{" "}
              </label>
              <input
                type="number"
                name="premiumPrice"
                value={ticketPrice.premium}
                onChange={(e) =>
                  setTicketPrice({ ...ticketPrice, premium: e.target.value })
                }
                min="0"
                step="50"
                className={`w-full p-2 border rounded-md ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-purple-700 transition"
          >
            {t("शो समय थप्नुहोस्", "Add Showtime")}
          </button>
        </form>
      </div>

      {/* section 2: list of existing showtimes */}
      <div
        className={`p-6 rounded-lg shadow-md ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">
          {t("अवस्थित शो समयहरू", "Existing Showtimes")}{" "}
          {(selectedMovie || selectedTheater) &&
            `(${t("फिल्टर गरिएको", "Filtered")})`}
        </h2>
        {loading && (
          <p>{t("शो समयहरू लोड गर्दै...", "Loading showtimes...")}</p>
        )}
        {!loading && showtimes.length > 0 ? (
          <div className="space-y-3">
            {showtimes.map((show) => (
              <div
                key={show._id}
                className={`flex justify-between items-center p-3 rounded ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex-1">
                  <p className="font-semibold">
                    {getMovieTitle(show)} - {getTheaterName(show)}
                  </p>
                  <p className="text-sm">
                    {new Date(show.startTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("स्क्रिन", "Screen")}: {show.screen} |{" "}
                    {t("मानक", "Standard")}: {t("रु.", "NRs")}{" "}
                    {show.ticketPrice?.standard || "N/A"} |{" "}
                    {t("प्रिमियम", "Premium")}: {t("रु.", "NRs")}{" "}
                    {show.ticketPrice?.premium || "N/A"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleDeleteShowtime(show._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-gray-500">{noShowtimesMessage}</p>
        )}
      </div>
    </div>
  );
}

export default ManageShowtimesPage;

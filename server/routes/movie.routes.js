import express from 'express'
import { authorize, protect } from '../middleware/auth.js';
import { upload } from '../config/multer.config.js';
import { createMovie, deleteMovie, getAllMovies, getMovieById, updateMovie } from '../controllers/movie.controller.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('admin'), upload.fields([
        { name: 'posterImage', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 }
    ]), createMovie)
    .get(getAllMovies);

router.route("/:id")
    .get(getMovieById)
    .put(protect, authorize('admin'), upload.fields([{ name: 'posterImage', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]), updateMovie)
    .delete(protect, authorize('admin'), deleteMovie);

export default router;
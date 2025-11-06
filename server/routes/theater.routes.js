import express from 'express'
import { createTheater, deleteTheater, getAllTheaters, getTheaterById, updateTheater } from '../controllers/theater.controller.js';
import { authorize, protect } from './../middleware/auth.js';
import { upload } from './../config/multer.config.js';

const router = express.Router();

router.route("/")
    .get(getAllTheaters)
    .post(protect, authorize("admin"), upload.array('images', 5), createTheater);

router.route("/:id")
    .get(getTheaterById)
    .put(protect, authorize('admin'), upload.array('images', 5), updateTheater)
    .delete(protect, authorize('admin'), deleteTheater);

export default router;
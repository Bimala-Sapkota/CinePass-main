import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    rows: {
        type: Number,
        required: true
    },
    seatsPerRow: {
        type: Number,
        required: true
    },
    premiumSeats: { type: [String], default: ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8'] },

})

const theaterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a theater name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    nameNepali: {
        type: String,
        trim: true,
        maxLength: [50, 'Nepali name cannot be more than 50 characters']
    },
    location: {
        type: String,
        required: [true, 'Please add location']
    },
    locationNepali: {
        type: String
    },
    city: {
        type: String,
        required: [true, 'Please add city']
    },
    screens: [screenSchema],
    amenities: {
        type: [String],
        enum: [
            'Parking', 'Food Court', 'Dolby Sound', 'IMAX', '3D',
            'Recliner Seats', 'Wheelchair Access', 'Air Conditioned'
        ]
    },
    contact: {
        phone: String,
        email: String
    },
    images: [
        {
            url: { type: String, required: true },
            public_id: { type: String }
        }
    ],
}, { timestamps: true });

export const Theater = mongoose.model('Theater', theaterSchema);

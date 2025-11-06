import nodemailer from "nodemailer";
import transporter from "../config/nodemailer.config.js";
import { User } from "./../models/User.model.js";

export const sendBookingConfirmationEmail = async (bookingDetails) => {
  try {
    const user = await User.findById(bookingDetails.user);
    if (!user) {
      console.error(
        "User not found for booking confirmation email:",
        bookingDetails.user
      );
      return;
    }

    const movieTitle = bookingDetails.showtime.movie.title;
    const theaterName = bookingDetails.showtime.theater.name;
    const showtimeDate = new Date(
      bookingDetails.showtime.startTime
    ).toLocaleDateString("en-Us", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const showtimeTime = new Date(
      bookingDetails.showtime.startTime
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const mailOptions = {
      from: `"CinePass" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Your CinePass Booking Confirmation: 
            ${movieTitle}`,
      text: `Dear ${
        user.username || user.firstName || "User"
      }, \n\nYour booking for ${movieTitle} at ${theaterName} on ${showtimeDate} at ${showtimeTime} for seat(s) ${bookingDetails.seats.join(
        ", "
      )} is confirmed!\n\nTotal Price: NPR ${
        bookingDetails.totalPrice
      }\nBooking Reference:
            ${
              bookingDetails.bookingReference
            }\n\nThank you for using CinePass!`,

      html: `
            <p>Dear ${user.username || user.firstName || "User"},</p>
            <p>Your booking for <strong>${movieTitle}</strong> at <strong>${theaterName}</strong> is confirmed!</p>
            <ul>
                <li><strong>Date:</strong> ${showtimeDate}</li>
                <li><strong>Time:</strong> ${showtimeTime}</li>
                <li><strong>Seat(s):</strong> ${bookingDetails.seats.join(
                  ", "
                )}</li>
                <li><strong>Total Price:</strong> NPR ${
                  bookingDetails.totalPrice
                }</li>
                <li><strong>Booking Reference:</strong> ${
                  bookingDetails.bookingReference
                }</li>
                <li><strong>QR Code:</strong> <img src="${
                  bookingDetails.qrCode
                }" alt="Booking QR code"/></li>
            </ul>
            <p>Thank you for using CinePass!</p>
                `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
};

export const sendPasswordResetEmail = async (options) => {
  const mailOptions = {
    form: `"CinePass" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: "CinePass Password Reset Request",
    html: `
            <p>Hi ${options.username},</p>
            <p>You requested a password reset. Please click the link below to create a new password. This link is valid for 10 minutes.</p>
            <a href="${options.resetUrl}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,<br/>The CinePass Team</p>
        `,
  };
  await transporter.sendMail(mailOptions);
  console.log(`Password reset email sent to ${options.email}`);
};

export const sendMovieIsNowShowingEmail = async (options) => {
  const mailOptions = {
    from: `"CinePass <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: `Tickets are now available for ${options.movieTitle}!`,
    html: `<p>Hi ${options.username},</p>
        <p>Good news! A movie from your watchlist, <strong>${options.movieTitle}</strong>,
        is now showing.</p>
        <a href="${options.movieLink}"> Click here to see showtimes and book your tickets!</a>
        <p>Thanks,<br/>The CinePass Team</p>`,
  };
  await transporter.sendMail(mailOptions);
};

export const sendContactInquiryEmail = async (options) => {
  const mailOptions = {
    from: `"CinePass Notifier" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ADMIN,
    replyTo: options.email,
    subject: `New Contact Form Submission from ${options.fullName}`,
    html: `
          <h2>New Inquiry from CinePass Contact Form</h2>
            <p><strong>Name:</strong> ${options.fullName}</p>
            <p><strong>Email:</strong> ${options.email}</p>
            <hr>
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${options.message}</p>
        `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Contact inquiry from ${options.email} sent to admin.`);
};

export const sendManualRefundAlertEmail = async (bookingDetails) => {
  const mailOptions = {
    from: `"CinePass System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ADMIN,
    subject: `ACTION REQUIRED: Manual Refund for Booking ${bookingDetails.bookingReference}`,
    html: `
            <h2>Manual Refund Required</h2>
            <p>A booking has been cancelled by a user, but the refund could not be processed automatically.</p>
            <p>Please log in to the eSewa merchant portal and process a refund for the following transaction:</p>
            <ul>
                <li><strong>Booking Reference:</strong> ${bookingDetails.bookingReference}</li>
                <li><strong>eSewa Transaction ID:</strong> ${bookingDetails.paymentId}</li>
                <li><strong>Amount to Refund:</strong> NPR ${bookingDetails.totalPrice}</li>
                <li><strong>User ID:</strong> ${bookingDetails.user}</li>
            </ul>
            <p>Once the refund is complete, please update the booking status in the CinePass admin panel if necessary.</p>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Manual refund alert sent to admin for booking ${bookingDetails.bookingReference}.`
    );
  } catch (error) {
    console.error("Failed to send manual refund alert email:", error);
  }
};

export const sendBookingCancellationEmail = async (
  bookingDetails,
  cancellationMessage
) => {
  try {
    const user = bookingDetails.user;
    if (!user) {
      console.error(
        "User object not populated for cancellation email:",
        bookingDetails._id
      );
      return;
    }

    const movieTitle = bookingDetails.showtime.movie.title;

    const mailOptions = {
      from: `"CinePass" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `CinePass Booking Cancellation Confirmation for ${movieTitle}`,
      html: `
                <p>Dear ${user.username},</p>
                <p>This email confirms that your booking for <strong>${movieTitle}</strong> has been successfully cancelled.</p>
                
                <h3>Cancellation Details:</h3>
                <ul>
                    <li><strong>Booking Reference:</strong> ${
                      bookingDetails.bookingReference
                    }</li>
                    <li><strong>Movie:</strong> ${movieTitle}</li>
                    <li><strong>Seats:</strong> ${bookingDetails.seats.join(
                      ", "
                    )}</li>
                </ul>
                
                <h3>Refund Status:</h3>
                <p><strong>${cancellationMessage}</strong></p>
                
                <p>We're sorry to see you go and hope to see you at the movies again soon.</p>
                <p>Thanks,<br/>The CinePass Team</p>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Booking cancellation email sent to ${user.email}: %s`,
      info.messageId
    );
  } catch (error) {
    console.error("Error sending booking cancellation email:", error);
  }
};

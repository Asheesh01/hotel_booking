package com.example.singlehotelbooking.service.impl;

import com.example.singlehotelbooking.entity.Booking;
import com.example.singlehotelbooking.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.email.mock:true}")
    private boolean mockEmail;

    @Override
    public void sendBookingConfirmationEmail(String toEmail, Booking booking) {
        String html = buildEmailHtml(booking);

        if (mockEmail) {
            log.info("===== MOCK EMAIL (set app.email.mock=false + real SMTP for live sending) =====");
            log.info("To: {}", toEmail);
            log.info("Subject: 🏨 Booking Confirmed - {}", booking.getReservationNumber());
            log.info("Check-in: {} | Check-out: {} | Room: {} | Rooms: {}",
                    booking.getCheckInDate(), booking.getCheckOutDate(),
                    booking.getRoomCategory().getName(), booking.getRoomsBooked());
            log.info("==========================================================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Grand Royal Hotel");
            helper.setTo(toEmail);
            helper.setSubject("🏨 Booking Confirmed — " + booking.getReservationNumber());
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Booking confirmation email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildEmailHtml(Booking booking) {
        long nights = booking.getCheckInDate().until(booking.getCheckOutDate()).getDays();
        double totalCost = nights * booking.getRoomCategory().getPricePerNight() * booking.getRoomsBooked();
        String guestName = booking.getUser().getName();
        String amenities = booking.getRoomCategory().getAmenities() != null
                ? booking.getRoomCategory().getAmenities()
                : "—";

        return """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:30px 0;">
                    <tr><td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:35px 40px;text-align:center;">
                            <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:1px;">🏨 Grand Royal Hotel</h1>
                            <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Luxury Redefined</p>
                          </td>
                        </tr>
                        <!-- Green banner -->
                        <tr>
                          <td style="background:linear-gradient(90deg,#43e97b,#38d96b);padding:14px 40px;text-align:center;">
                            <p style="margin:0;color:#fff;font-weight:700;font-size:16px;letter-spacing:0.5px;">✅ Your Booking is Confirmed!</p>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding:35px 40px;">
                            <p style="margin:0 0 20px;font-size:16px;color:#2d3436;">
                              Dear <strong>%s</strong>,<br/>
                              Thank you for choosing Grand Royal Hotel. Here are your reservation details:
                            </p>

                            <!-- Reservation box -->
                            <div style="background:#f8f4ff;border:2px solid #6c63ff;border-radius:10px;padding:20px 25px;margin:0 0 20px;text-align:center;">
                              <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;color:#888;letter-spacing:1px;">Reservation Number</p>
                              <p style="margin:0;font-size:28px;font-weight:800;color:#6c63ff;letter-spacing:2px;">%s</p>
                            </div>

                            <!-- Details table -->
                            <table width="100%%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;font-size:15px;">
                              <tr style="border-bottom:1px solid #eee;">
                                <td style="color:#888;width:45%%;">🛏 Room Type</td>
                                <td style="color:#2d3436;font-weight:600;">%s</td>
                              </tr>
                              <tr style="border-bottom:1px solid #eee;">
                                <td style="color:#888;">📅 Check-In</td>
                                <td style="color:#2d3436;font-weight:600;">%s</td>
                              </tr>
                              <tr style="border-bottom:1px solid #eee;">
                                <td style="color:#888;">📅 Check-Out</td>
                                <td style="color:#2d3436;font-weight:600;">%s</td>
                              </tr>
                              <tr style="border-bottom:1px solid #eee;">
                                <td style="color:#888;">🌙 Duration</td>
                                <td style="color:#2d3436;font-weight:600;">%d night(s)</td>
                              </tr>
                              <tr style="border-bottom:1px solid #eee;">
                                <td style="color:#888;">🚪 Rooms Booked</td>
                                <td style="color:#2d3436;font-weight:600;">%d</td>
                              </tr>
                              <tr style="border-bottom:1px solid #eee;">
                                <td style="color:#888;">✨ Amenities</td>
                                <td style="color:#2d3436;font-size:13px;">%s</td>
                              </tr>
                              <tr>
                                <td style="color:#888;">💰 Total Amount</td>
                                <td style="color:#f5a623;font-size:20px;font-weight:800;">₹%,.0f</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
                            <p style="margin:0;font-size:13px;color:#999;">
                              Questions? Contact us at <a href="mailto:stay@grandroyal.com" style="color:#6c63ff;">stay@grandroyal.com</a><br/>
                              <span style="font-size:11px;">Grand Royal Hotel | Your comfort is our priority 🏨</span>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """
                .formatted(
                        guestName,
                        booking.getReservationNumber(),
                        booking.getRoomCategory().getName(),
                        booking.getCheckInDate(),
                        booking.getCheckOutDate(),
                        nights,
                        booking.getRoomsBooked(),
                        amenities,
                        totalCost);
    }
}

package com.visionforge.crms.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtp(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("CRMS - OTP Verification");
            message.setText(
                    "Hello,\n\n" +
                    "Your OTP for CRMS account verification is: " + otp + "\n\n" +
                    "Please do not share this OTP with anyone.\n\n" +
                    "Regards,\n" +
                    "CRMS Team"
            );

            mailSender.send(message);

        } catch (MailException e) {
            e.printStackTrace(); // terminal la exact error kaatum

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to send OTP email: " + e.getMessage()
            );
        } catch (Exception e) {
            e.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unexpected error while sending OTP email: " + e.getMessage()
            );
        }
    }
}
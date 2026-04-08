package com.banking.service;

import com.banking.model.Account;
import com.banking.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AccountRepository accountRepository;
    private final JavaMailSender mailSender;

    @Value("${banking.alert.email-enabled:true}")
    private boolean emailEnabled;

    @Value("${banking.alert.low-balance-threshold:500.00}")
    private BigDecimal threshold;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Real-time check called after transactions.
     */
    public void checkAndAlert(Account account) {
        if (account.getBalance().compareTo(threshold) < 0) {
            log.info("Low balance detected for account: {}", account.getAccountNumber());
            sendLowBalanceAlert(account);
        }
    }

    /**
     * Hourly background scan to remind users who still have low balances.
     */
    @Scheduled(fixedRate = 3600000)
    public void scanAllAccounts() {
        log.info("Starting hourly scan for low balance accounts...");
        // Ensure your AccountRepository has this custom query or use findAll and filter
        List<Account> allAccounts = accountRepository.findAll();
        long count = 0;
        for (Account account : allAccounts) {
            if (account.isActive() && account.getBalance().compareTo(threshold) < 0) {
                sendLowBalanceAlert(account);
                count++;
            }
        }
        log.info("Completed hourly scan. Sent {} alerts.", count);
    }

    private void sendLowBalanceAlert(Account account) {
        String subject = "CRITICAL: Low Balance Alert - VaultBank";
        String message = String.format(
                "Dear %s,\n\nYour account %s balance is ₹%.2f, which is below our healthy threshold of ₹%.2f.\n\n" +
                        "Please deposit funds soon to ensure uninterrupted service.\n\nThank you,\nVaultBank Security Team",
                account.getHolderName(), account.getAccountNumber(), account.getBalance(), threshold);

        if (emailEnabled) {
            try {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setFrom(fromEmail);
                mailMessage.setTo(account.getEmail());
                mailMessage.setSubject(subject);
                mailMessage.setText(message);
                mailSender.send(mailMessage);
                log.info("Email alert sent to {} for account {}", account.getEmail(), account.getAccountNumber());
            } catch (Exception e) {
                log.error("Failed to send email alert to {}: {}", account.getEmail(), e.getMessage());
            }
        } else {
            log.warn("EMAIL DISABLED - CONSOLE LOG ONLY: {}", message);
        }
    }
}
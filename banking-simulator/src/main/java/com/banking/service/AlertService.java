package com.banking.service;

import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AccountRepository accountRepository;
    private final JavaMailSender mailSender;

    @Value("${banking.alert.email-enabled:false}")
    private boolean emailEnabled;

    @Value("${banking.alert.low-balance-threshold:500.00}")
    private BigDecimal threshold;

    @Value("${spring.mail.username:noreply@banking.com}")
    private String fromEmail;

    public void checkAndAlert(Account account) {
        if (account.getBalance().compareTo(threshold) < 0) {
            sendLowBalanceAlert(account);
        }
    }

    @Scheduled(fixedRate = 3_600_000)
    public void scanAllAccounts() {
        log.info("Starting hourly scan for low balance accounts...");
        List<Account> lowBalanceAccounts = accountRepository.findAccountsBelowThreshold(threshold);
        for (Account account : lowBalanceAccounts) {
            sendLowBalanceAlert(account);
        }
        log.info("Completed hourly scan. Found {} accounts below threshold.", lowBalanceAccounts.size());
    }

    private void sendLowBalanceAlert(Account account) {
        String message = String.format("Alert: Account %s balance is %.2f, which is below the threshold of %.2f.",
                account.getAccountNumber(), account.getBalance(), threshold);

        if (emailEnabled) {
            try {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setFrom(fromEmail);
                mailMessage.setTo(account.getEmail());
                mailMessage.setSubject("Low Balance Alert - Banking Simulator");
                mailMessage.setText(message);
                mailSender.send(mailMessage);
                log.info("Email alert sent to {} for account {}", account.getEmail(), account.getAccountNumber());
            } catch (Exception e) {
                log.error("Failed to send email alert to {}: {}", account.getEmail(), e.getMessage());
            }
        } else {
            log.warn("CONSOLE ALERT: {}", message);
        }
    }

    @Async
    public void sendTransactionAlert(Account account, Transaction transaction) {
        String message = String.format("Dear %s,\n\nA %s transaction of $%.2f has been processed on your account (%s).\n\n" +
                        "Transaction Details:\n" +
                        "Reference: %s\n" +
                        "Description: %s\n" +
                        "Amount: $%.2f\n" +
                        "Remaining Balance: $%.2f\n\n" +
                        "Thank you for banking with VaultBank.",
                account.getHolderName(),
                transaction.getTransactionType().name(),
                transaction.getAmount(),
                account.getAccountNumber(),
                transaction.getReferenceNumber(),
                transaction.getDescription(),
                transaction.getAmount(),
                account.getBalance());

        if (emailEnabled) {
            try {
                SimpleMailMessage mailMessage = new SimpleMailMessage();
                mailMessage.setFrom(fromEmail);
                mailMessage.setTo(account.getEmail());
                mailMessage.setSubject("Transaction Alert - VaultBank");
                mailMessage.setText(message);
                mailSender.send(mailMessage);
                log.info("Transaction email alert sent to {} for account {}", account.getEmail(), account.getAccountNumber());
            } catch (Exception e) {
                log.error("Failed to send transaction email alert to {}: {}", account.getEmail(), e.getMessage());
            }
        } else {
            log.warn("CONSOLE ALERT (Transaction): {}", message.replace("\n", " "));
        }
    }
}

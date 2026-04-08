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

    @Value("${banking.alert.email-enabled:true}")
    private boolean emailEnabled;

    @Value("${banking.alert.low-balance-threshold:500.00}")
    private BigDecimal threshold;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void checkAndAlert(Account account) {
        if (account.getBalance().compareTo(threshold) < 0) {
            log.info("Low balance detected for account: {}", account.getAccountNumber());
            sendLowBalanceAlert(account);
        }
    }

    @Scheduled(fixedRate = 3600000)
    public void scanAllAccounts() {
        log.info("Starting hourly scan for low balance accounts...");
        List<Account> allAccounts = accountRepository.findAll();
        for (Account account : allAccounts) {
            if (account.isActive() && account.getBalance().compareTo(threshold) < 0) {
                sendLowBalanceAlert(account);
            }
        }
    }

    private void sendLowBalanceAlert(Account account) {
        String subject = "CRITICAL: Low Balance Alert - VaultBank";
        String message = String.format(
                "Dear %s,\n\nYour account %s balance is ₹%.2f, which is below our threshold of ₹%.2f.",
                account.getHolderName(), account.getAccountNumber(), account.getBalance(), threshold);

        if (emailEnabled) {
            sendMail(account.getEmail(), subject, message);
        }
    }

    @Async
    public void sendTransactionAlert(Account account, Transaction transaction) {
        String subject = "VaultBank: Transaction Notification";
        String message = String.format("Dear %s,\n\nA %s transaction of ₹%.2f has been processed.\nBalance: ₹%.2f",
                account.getHolderName(),
                transaction.getTransactionType().name(),
                transaction.getAmount(),
                account.getBalance());

        if (emailEnabled) {
            sendMail(account.getEmail(), subject, message);
        }
    }

    private void sendMail(String to, String subject, String text) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(text);
            mailSender.send(mailMessage);
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            log.error("Mail Error: {}", e.getMessage());
        }
    }
}
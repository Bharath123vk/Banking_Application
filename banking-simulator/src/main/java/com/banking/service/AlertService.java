package com.banking.service;

import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.repository.AccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    private final AccountRepository accountRepository;
    private final JavaMailSender mailSender;

    @Value("${banking.alert.email-enabled:true}")
    private boolean emailEnabled;

    @Value("${banking.alert.low-balance-threshold:500.00}")
    private BigDecimal threshold;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // MANUAL CONSTRUCTOR - FIXES YOUR ERROR
    public AlertService(AccountRepository accountRepository, JavaMailSender mailSender) {
        this.accountRepository = accountRepository;
        this.mailSender = mailSender;
    }

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
        String message = String.format("Dear %s, Your account %s is below ₹%.2f.",
                account.getHolderName(), account.getAccountNumber(), threshold);
        if (emailEnabled) sendMail(account.getEmail(), subject, message);
    }

    @Async
    public void sendTransactionAlert(Account account, Transaction transaction) {
        String subject = "VaultBank: Transaction Notification";
        String message = String.format("Transaction of ₹%.2f processed. Balance: ₹%.2f",
                transaction.getAmount(), account.getBalance());
        if (emailEnabled) sendMail(account.getEmail(), subject, message);
    }

    private void sendMail(String to, String subject, String text) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(text);
            mailSender.send(mailMessage);
        } catch (Exception e) {
            log.error("Mail Error: {}", e.getMessage());
        }
    }
}
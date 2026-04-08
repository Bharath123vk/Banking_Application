package com.banking.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.banking.dto.CreateAccountRequest;
import com.banking.exception.AccountInactiveException;
import com.banking.exception.AccountNotFoundException;
import com.banking.model.Account;
import com.banking.repository.AccountRepository;

@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final AccountRepository accountRepository;

    // Inject the EmailService to handle notifications
    @Autowired
    private EmailService emailService;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * Persists profile changes and sends a notification about the profile update.
     */
    @Transactional
    public Account updateAccount(Account account) {
        log.info("Updating profile details for Account: {}", account.getAccountNumber());
        Account updatedAccount = accountRepository.save(account);

        // Notify user about profile changes
        String subject = "VaultBank: Profile Updated";
        String body = "Dear " + updatedAccount.getHolderName() + ",\n\n" +
                "This is to confirm that your profile details for account " + updatedAccount.getAccountNumber() + " have been successfully updated.\n\n" +
                "If you did not authorize this change, please contact our support team immediately.";

        emailService.sendEmail(updatedAccount.getEmail(), subject, body);

        return updatedAccount;
    }

    /**
     * Creates a new account and sends a Welcome Email to the user.
     */
    @Transactional
    public Account createAccount(CreateAccountRequest req) {
        // 1. Check if email is already registered
        if (accountRepository.existsByEmail(req.getEmail())) {
            log.warn("Signup attempt failed: Email {} already exists", req.getEmail());
            throw new RuntimeException("Email address is already registered.");
        }

        // 2. Generate unique account number
        String generatedAccountNumber = generateUniqueAccountNumber();

        // 3. Ensure initial balance isn't null
        BigDecimal initialBalance = req.getInitialBalance() != null ? req.getInitialBalance() : BigDecimal.ZERO;

        // 4. Build and Save
        Account account = Account.builder()
                .accountNumber(generatedAccountNumber)
                .holderName(req.getHolderName())
                .email(req.getEmail())
                .accountType(req.getAccountType())
                .balance(initialBalance)
                .active(true)
                .build();

        log.info("Creating new account for: {} | Account: {}", req.getHolderName(), generatedAccountNumber);
        Account savedAccount = accountRepository.save(account);

        // 5. Send Welcome Email (The "Wishing" part of the journey)
        String subject = "Welcome to VaultBank!";
        String body = "Dear " + savedAccount.getHolderName() + ",\n\n" +
                "Congratulations! Your digital banking account has been successfully created.\n\n" +
                "Account Details:\n" +
                "Account Number: " + savedAccount.getAccountNumber() + "\n" +
                "Account Type: " + savedAccount.getAccountType() + "\n" +
                "Opening Balance: ₹" + savedAccount.getBalance() + "\n\n" +
                "Thank you for choosing VaultBank for your financial journey.";

        emailService.sendEmail(savedAccount.getEmail(), subject, body);

        return savedAccount;
    }

    @Transactional(readOnly = true)
    public Account getAccount(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account number " + accountNumber + " not found."));
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public BigDecimal getBalance(String accountNumber) {
        return getAccount(accountNumber).getBalance();
    }

    @Transactional
    public Account deactivateAccount(String accountNumber) {
        Account account = getAccount(accountNumber);
        account.setActive(false);
        log.info("Status Update: Account deactivated -> {}", accountNumber);

        emailService.sendEmail(account.getEmail(), "VaultBank: Account Deactivated",
                "Your account " + accountNumber + " has been deactivated. You will not be able to perform any further transactions.");

        return accountRepository.save(account);
    }

    @Transactional
    public Account reactivateAccount(String accountNumber) {
        Account account = getAccount(accountNumber);
        account.setActive(true);
        log.info("Status Update: Account reactivated -> {}", accountNumber);

        emailService.sendEmail(account.getEmail(), "VaultBank: Account Reactivated",
                "Your account " + accountNumber + " is now active. You can resume your banking operations.");

        return accountRepository.save(account);
    }

    /**
     * Helper method to check balance health and send alerts.
     */
    public void sendBalanceHealthAlert(Account account) {
        BigDecimal threshold = new BigDecimal("500.00");
        if (account.getBalance().compareTo(threshold) < 0) {
            String subject = "CRITICAL: Low Balance Alert";
            String body = "Dear " + account.getHolderName() + ",\n\n" +
                    "Your account " + account.getAccountNumber() + " has fallen below the minimum healthy balance of ₹500.00.\n" +
                    "Current Balance: ₹" + account.getBalance() + "\n\n" +
                    "Please top up your account to maintain a healthy status and avoid service interruptions.";
            emailService.sendEmail(account.getEmail(), subject, body);
        }
    }

    public void validateActiveAccount(Account account) {
        if (!account.isActive()) {
            log.error("Access Denied: Account {} is inactive", account.getAccountNumber());
            throw new AccountInactiveException("Account is inactive. Please contact support.");
        }
    }

    private String generateUniqueAccountNumber() {
        Random random = new Random();
        String accNumber;
        int maxAttempts = 10;
        int attempts = 0;

        do {
            long number = 1000000000L + (long)(random.nextDouble() * 9000000000L);
            accNumber = "ACC" + number;
            attempts++;
            if (attempts > maxAttempts) {
                accNumber = "ACC" + System.currentTimeMillis();
                break;
            }
        } while (accountRepository.existsByAccountNumber(accNumber));

        return accNumber;
    }
}
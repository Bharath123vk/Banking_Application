package com.banking.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * UPDATED: Added method to persist profile changes.
     * Used by AccountController.updateProfile
     */
    @Transactional
    public Account updateAccount(Account account) {
        log.info("Updating profile details for Account: {}", account.getAccountNumber());
        return accountRepository.save(account);
    }

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
        return accountRepository.save(account);
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
        return accountRepository.save(account);
    }

    @Transactional
    public Account reactivateAccount(String accountNumber) {
        Account account = getAccount(accountNumber);
        account.setActive(true);
        log.info("Status Update: Account reactivated -> {}", accountNumber);
        return accountRepository.save(account);
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
            // Generates a random 10-digit number
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
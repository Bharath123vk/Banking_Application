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
import com.banking.model.User;
import com.banking.repository.AccountRepository;
import com.banking.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Merged Constructor: Includes both repositories needed for Bharath's Security logic
    public AccountService(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Account updateAccount(Account account) {
        log.info("Updating profile details for Account: {}", account.getAccountNumber());
        Account updatedAccount = accountRepository.save(account);

        String subject = "VaultBank: Profile Updated";
        String body = "Dear " + updatedAccount.getHolderName() + ",\n\n" +
                "This is to confirm that your profile details for account " + updatedAccount.getAccountNumber() + " have been successfully updated.";

        emailService.sendEmail(updatedAccount.getEmail(), subject, body);
        return updatedAccount;
    }

    @Transactional
    public Account createAccount(CreateAccountRequest req) {
        // Bharath's Security Logic: Get current logged-in user
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userEmail = principal instanceof UserDetails ?
                ((UserDetails) principal).getUsername() : principal.toString();

        User authenticatedUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        String generatedAccountNumber = generateUniqueAccountNumber();
        BigDecimal initialBalance = req.getInitialBalance() != null ? req.getInitialBalance() : BigDecimal.ZERO;

        // Build Account using the Authenticated User's data
        Account account = Account.builder()
                .accountNumber(generatedAccountNumber)
                .holderName(authenticatedUser.getName())
                .email(authenticatedUser.getEmail())
                .accountType(req.getAccountType())
                .balance(initialBalance)
                .active(true)
                .build();
        account.setUser(authenticatedUser);

        log.info("Creating new account for: {} | Account: {}", authenticatedUser.getName(), generatedAccountNumber);
        Account savedAccount = accountRepository.save(account);

        // Your Email Logic: Send Welcome Email
        String subject = "Welcome to VaultBank!";
        String body = "Dear " + savedAccount.getHolderName() + ",\n\n" +
                "Congratulations! Your account " + savedAccount.getAccountNumber() + " is now active.\n" +
                "Opening Balance: ₹" + savedAccount.getBalance();

        emailService.sendEmail(savedAccount.getEmail(), subject, body);

        return savedAccount;
    }

    @Transactional(readOnly = true)
    public Account getAccount(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account number " + accountNumber + " not found."));
    }

    public List<Account> getAllAccounts() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return accountRepository.findByUserEmail(email);
        }
        return accountRepository.findAll();
    }

    public BigDecimal getBalance(String accountNumber) {
        return getAccount(accountNumber).getBalance();
    }

    @Transactional
    public Account deactivateAccount(String accountNumber) {
        Account account = getAccount(accountNumber);
        account.setActive(false);
        emailService.sendEmail(account.getEmail(), "VaultBank: Account Deactivated",
                "Your account " + accountNumber + " has been deactivated.");
        return accountRepository.save(account);
    }

    @Transactional
    public Account reactivateAccount(String accountNumber) {
        Account account = getAccount(accountNumber);
        account.setActive(true);
        emailService.sendEmail(account.getEmail(), "VaultBank: Account Reactivated",
                "Your account " + accountNumber + " is now active.");
        return accountRepository.save(account);
    }

    public void sendBalanceHealthAlert(Account account) {
        BigDecimal threshold = new BigDecimal("500.00");
        if (account.getBalance().compareTo(threshold) < 0) {
            emailService.sendEmail(account.getEmail(), "CRITICAL: Low Balance Alert",
                    "Your balance is below ₹500.00. Current Balance: ₹" + account.getBalance());
        }
    }

    public void validateActiveAccount(Account account) {
        if (!account.isActive()) {
            throw new AccountInactiveException("Account is inactive.");
        }
    }

    private String generateUniqueAccountNumber() {
        Random random = new Random();
        String accNumber;
        do {
            long number = 1000000000L + (long)(random.nextDouble() * 9000000000L);
            accNumber = "ACC" + number;
        } while (accountRepository.existsByAccountNumber(accNumber));
        return accNumber;
    }
}
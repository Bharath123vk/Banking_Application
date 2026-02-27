package com.banking.service;

import com.banking.dto.CreateAccountRequest;
import com.banking.exception.AccountInactiveException;
import com.banking.exception.AccountNotFoundException;
import com.banking.model.Account;
import com.banking.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional
    public Account createAccount(CreateAccountRequest req) {
        String generatedAccountNumber = generateUniqueAccountNumber();

        Account account = Account.builder()
                .accountNumber(generatedAccountNumber)
                .holderName(req.getHolderName())
                .email(req.getEmail())
                .accountType(req.getAccountType())
                .balance(req.getInitialBalance())
                .active(true)
                .build();

        log.info("Creating new account for: {}", req.getHolderName());
        return accountRepository.save(account);
    }

    public Account getAccount(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found: " + accountNumber));
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
        log.info("Account deactivated: {}", accountNumber);
        return accountRepository.save(account);
    }

    @Transactional
    public Account reactivateAccount(String accountNumber) {
        Account account = getAccount(accountNumber);
        account.setActive(true);
        log.info("Account reactivated: {}", accountNumber);
        return accountRepository.save(account);
    }

    public void validateActiveAccount(Account account) {
        if (!account.isActive()) {
            throw new AccountInactiveException("Account is inactive: " + account.getAccountNumber());
        }
    }

    private String generateUniqueAccountNumber() {
        Random random = new Random();
        String accNumber;
        do {
            int number = 100000000 + random.nextInt(900000000);
            accNumber = "ACC" + number; // ACC + 9 digits
        } while (accountRepository.existsByAccountNumber(accNumber));
        return accNumber;
    }
}

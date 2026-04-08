package com.banking.service;

import com.banking.exception.InsufficientFundsException;
import com.banking.exception.InvalidAmountException;
import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.model.TransactionStatus;
import com.banking.model.TransactionType;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AlertService alertService;

    @Autowired
    private EmailService emailService;

    public TransactionService(AccountService accountService,
                              AccountRepository accountRepository,
                              TransactionRepository transactionRepository,
                              AlertService alertService) {
        this.accountService = accountService;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.alertService = alertService;
    }

    @Transactional
    public Transaction deposit(String accountNumber, BigDecimal amount, String description) {
        validateAmount(amount);
        Account account = accountService.getAccount(accountNumber);
        accountService.validateActiveAccount(account);

        BigDecimal balanceBefore = account.getBalance();
        BigDecimal balanceAfter = balanceBefore.add(amount);
        account.setBalance(balanceAfter);

        Transaction transaction = buildTransaction(account, amount, balanceBefore, balanceAfter,
                TransactionType.DEPOSIT, TransactionStatus.SUCCESS, description, accountNumber);

        Transaction savedTx = transactionRepository.save(transaction);
        log.info("Deposit successful for account {}", accountNumber);

        // Your Real-Time Email Logic
        String subject = "VaultBank: Deposit Confirmation";
        String body = String.format("Dear %s,\n\nYour account %s has been credited with ₹%.2f.\n" +
                        "Transaction Reference: %s\n" +
                        "New Balance: ₹%.2f",
                account.getHolderName(), accountNumber, amount, savedTx.getReferenceNumber(), balanceAfter);
        emailService.sendEmail(account.getEmail(), subject, body);

        // Bharath's Alert logic
        alertService.checkAndAlert(account);
        alertService.sendTransactionAlert(account, savedTx);

        return savedTx;
    }

    @Transactional
    public Transaction withdraw(String accountNumber, BigDecimal amount, String description) {
        validateAmount(amount);
        Account account = accountService.getAccount(accountNumber);
        accountService.validateActiveAccount(account);

        BigDecimal balanceBefore = account.getBalance();
        if (balanceBefore.compareTo(amount) < 0) {
            Transaction failedTx = buildTransaction(account, amount, balanceBefore, balanceBefore,
                    TransactionType.WITHDRAWAL, TransactionStatus.FAILED, "Insufficient funds", accountNumber);
            transactionRepository.save(failedTx);
            throw new InsufficientFundsException("Insufficient funds in account: " + accountNumber);
        }

        BigDecimal balanceAfter = balanceBefore.subtract(amount);
        account.setBalance(balanceAfter);
        Transaction transaction = buildTransaction(account, amount, balanceBefore, balanceAfter,
                TransactionType.WITHDRAWAL, TransactionStatus.SUCCESS, description, accountNumber);

        Transaction savedTx = transactionRepository.save(transaction);
        log.info("Withdrawal successful for account {}", accountNumber);

        // Your Real-Time Email Logic
        String subject = "VaultBank: Transaction Alert (Debit)";
        String body = String.format("Dear %s,\n\nYour account %s has been debited by ₹%.2f.\n" +
                        "Remaining Balance: ₹%.2f",
                account.getHolderName(), accountNumber, amount, balanceAfter);
        emailService.sendEmail(account.getEmail(), subject, body);

        // Bharath's Alert logic
        alertService.checkAndAlert(account);
        alertService.sendTransactionAlert(account, savedTx);

        return savedTx;
    }

    @Transactional
    public List<Transaction> transfer(String sourceAccountNumber, String destinationAccountNumber, BigDecimal amount,
                                      String description) {
        validateAmount(amount);

        if (sourceAccountNumber.equals(destinationAccountNumber)) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        Account sourceAccount = accountService.getAccount(sourceAccountNumber);
        accountService.validateActiveAccount(sourceAccount);

        BigDecimal sourceBalanceBefore = sourceAccount.getBalance();

        if (sourceBalanceBefore.compareTo(amount) < 0) {
            Transaction failedTx = buildTransaction(sourceAccount, amount, sourceBalanceBefore, sourceBalanceBefore,
                    TransactionType.TRANSFER_OUT, TransactionStatus.FAILED, "Insufficient funds", destinationAccountNumber);
            transactionRepository.save(failedTx);
            throw new InsufficientFundsException("Insufficient balance for this transfer.");
        }

        BigDecimal sourceBalanceAfter = sourceBalanceBefore.subtract(amount);
        sourceAccount.setBalance(sourceBalanceAfter);

        Transaction outTx = buildTransaction(sourceAccount, amount, sourceBalanceBefore, sourceBalanceAfter,
                TransactionType.TRANSFER_OUT, TransactionStatus.SUCCESS,
                (description != null && !description.isEmpty()) ? description : "Transfer to " + destinationAccountNumber,
                destinationAccountNumber);

        List<Transaction> recordedTransactions = new ArrayList<>();
        Transaction savedOutTx = transactionRepository.save(outTx);
        recordedTransactions.add(savedOutTx);

        // Email to Sender
        emailService.sendEmail(sourceAccount.getEmail(), "VaultBank: Fund Transfer Initiated",
                String.format("You transferred ₹%.2f to %s.", amount, destinationAccountNumber));

        Optional<Account> destinationAccountOpt = accountRepository.findByAccountNumber(destinationAccountNumber);

        if (destinationAccountOpt.isPresent()) {
            Account destAccount = destinationAccountOpt.get();
            BigDecimal destBalanceBefore = destAccount.getBalance();
            BigDecimal destBalanceAfter = destBalanceBefore.add(amount);

            destAccount.setBalance(destBalanceAfter);

            Transaction inTx = buildTransaction(destAccount, amount, destBalanceBefore, destBalanceAfter,
                    TransactionType.TRANSFER_IN, TransactionStatus.SUCCESS,
                    "Received from " + sourceAccountNumber,
                    sourceAccountNumber);

            Transaction savedInTx = transactionRepository.save(inTx);
            recordedTransactions.add(savedInTx);

            // Email to Recipient
            emailService.sendEmail(destAccount.getEmail(), "VaultBank: Funds Received",
                    String.format("You received ₹%.2f from %s.", amount, sourceAccountNumber));

            alertService.checkAndAlert(destAccount);
            alertService.sendTransactionAlert(destAccount, savedInTx);
        }

        alertService.checkAndAlert(sourceAccount);
        alertService.sendTransactionAlert(sourceAccount, savedOutTx);

        return recordedTransactions;
    }

    // Kept Bharath's Pagination Support
    public Page<Transaction> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable);
    }

    public List<Transaction> getAccountTransactions(String accountNumber) {
        return transactionRepository.findByAccountAccountNumberOrderByTransactionDateDesc(accountNumber);
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Amount must be greater than zero");
        }
    }

    private Transaction buildTransaction(Account account, BigDecimal amount, BigDecimal before, BigDecimal after,
                                         TransactionType type, TransactionStatus status, String description, String targetAccount) {
        return Transaction.builder()
                .referenceNumber("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .account(account)
                .amount(amount)
                .balanceBefore(before)
                .balanceAfter(after)
                .transactionType(type)
                .transactionStatus(status)
                .description(description)
                .targetAccountNumber(targetAccount)
                .build();
    }
}
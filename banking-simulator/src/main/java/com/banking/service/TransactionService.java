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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        account.setBalance(balanceBefore.add(amount));

        // For deposits, the target is the account itself
        Transaction transaction = buildTransaction(account, amount, balanceBefore, account.getBalance(),
                TransactionType.DEPOSIT, TransactionStatus.SUCCESS, description, accountNumber);

        transactionRepository.save(transaction);
        log.info("Deposit successful for account {}", accountNumber);
        alertService.checkAndAlert(account);
        return transaction;
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

        account.setBalance(balanceBefore.subtract(amount));
        Transaction transaction = buildTransaction(account, amount, balanceBefore, account.getBalance(),
                TransactionType.WITHDRAWAL, TransactionStatus.SUCCESS, description, accountNumber);

        transactionRepository.save(transaction);
        log.info("Withdrawal successful for account {}", accountNumber);
        alertService.checkAndAlert(account);
        return transaction;
    }

    @Transactional
    public List<Transaction> transfer(String sourceAccountNumber, String destinationAccountNumber, BigDecimal amount,
                                      String description) {
        validateAmount(amount);

        if (sourceAccountNumber.equals(destinationAccountNumber)) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        // 1. SOURCE: Must exist (we use accountService here because the sender MUST be our user)
        Account sourceAccount = accountService.getAccount(sourceAccountNumber);
        accountService.validateActiveAccount(sourceAccount);

        BigDecimal sourceBalanceBefore = sourceAccount.getBalance();

        // 2. CHECK BALANCE
        if (sourceBalanceBefore.compareTo(amount) < 0) {
            Transaction failedTx = buildTransaction(sourceAccount, amount, sourceBalanceBefore, sourceBalanceBefore,
                    TransactionType.TRANSFER_OUT, TransactionStatus.FAILED, "Insufficient funds", destinationAccountNumber);
            transactionRepository.save(failedTx);
            throw new InsufficientFundsException("Insufficient balance for this transfer.");
        }

        // 3. DEDUCT FROM SOURCE
        sourceAccount.setBalance(sourceBalanceBefore.subtract(amount));

        // Create the record for the sender
        Transaction outTx = buildTransaction(sourceAccount, amount, sourceBalanceBefore, sourceAccount.getBalance(),
                TransactionType.TRANSFER_OUT, TransactionStatus.SUCCESS,
                (description != null && !description.isEmpty()) ? description : "Transfer to " + destinationAccountNumber,
                destinationAccountNumber);

        List<Transaction> recordedTransactions = new ArrayList<>();
        recordedTransactions.add(transactionRepository.save(outTx));

        // 4. DESTINATION: "Safe Lookup" (This is the fix!)
        // We use accountRepository directly so it DOES NOT throw a 404 if missing
        Optional<Account> destinationAccountOpt = accountRepository.findByAccountNumber(destinationAccountNumber);

        if (destinationAccountOpt.isPresent()) {
            Account destAccount = destinationAccountOpt.get();
            BigDecimal destBalanceBefore = destAccount.getBalance();

            // Update recipient balance
            destAccount.setBalance(destBalanceBefore.add(amount));

            // Create record for recipient
            Transaction inTx = buildTransaction(destAccount, amount, destBalanceBefore, destAccount.getBalance(),
                    TransactionType.TRANSFER_IN, TransactionStatus.SUCCESS,
                    "Received from " + sourceAccountNumber,
                    sourceAccountNumber);

            recordedTransactions.add(transactionRepository.save(inTx));
            alertService.checkAndAlert(destAccount);
            log.info("Internal Transfer: Recipient {} updated.", destinationAccountNumber);
        } else {
            // Destination not in our DB? No problem. No 404 thrown.
            log.info("External Transfer: {} is not in our system. Processing as external payment.", destinationAccountNumber);
        }

        log.info("Transfer successful from {} to {}", sourceAccountNumber, destinationAccountNumber);
        alertService.checkAndAlert(sourceAccount);

        return recordedTransactions;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
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
                .targetAccountNumber(targetAccount) // Linked to the new model field
                .build();
    }
}
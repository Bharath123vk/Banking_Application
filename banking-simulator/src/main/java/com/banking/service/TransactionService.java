package com.banking.service;

import com.banking.exception.InsufficientFundsException;
import com.banking.exception.InvalidAmountException;
import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.model.TransactionStatus;
import com.banking.model.TransactionType;
import com.banking.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final AccountService accountService;
    private final TransactionRepository transactionRepository;
    private final AlertService alertService;

    @Transactional
    public Transaction deposit(String accountNumber, BigDecimal amount, String description) {
        validateAmount(amount);
        Account account = accountService.getAccount(accountNumber);
        accountService.validateActiveAccount(account);

        BigDecimal balanceBefore = account.getBalance();
        account.setBalance(balanceBefore.add(amount));

        Transaction transaction = buildTransaction(account, amount, balanceBefore, account.getBalance(),
                TransactionType.DEPOSIT, TransactionStatus.SUCCESS, description);

        account.getTransactions().add(transaction);
        log.info("Deposit of {} successful for account {}", amount, accountNumber);

        alertService.checkAndAlert(account);
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction withdraw(String accountNumber, BigDecimal amount, String description) {
        validateAmount(amount);
        Account account = accountService.getAccount(accountNumber);
        accountService.validateActiveAccount(account);

        BigDecimal balanceBefore = account.getBalance();

        if (balanceBefore.compareTo(amount) < 0) {
            Transaction failedTx = buildTransaction(account, amount, balanceBefore, balanceBefore,
                    TransactionType.WITHDRAWAL, TransactionStatus.FAILED, "Insufficient funds");
            transactionRepository.save(failedTx);
            throw new InsufficientFundsException("Insufficient funds for withdrawal in account: " + accountNumber);
        }

        account.setBalance(balanceBefore.subtract(amount));

        Transaction transaction = buildTransaction(account, amount, balanceBefore, account.getBalance(),
                TransactionType.WITHDRAWAL, TransactionStatus.SUCCESS, description);

        account.getTransactions().add(transaction);
        log.info("Withdrawal of {} successful for account {}", amount, accountNumber);

        alertService.checkAndAlert(account);
        return transactionRepository.save(transaction);
    }

    @Transactional
    public List<Transaction> transfer(String fromAccountNumber, String toAccountNumber, BigDecimal amount,
            String description) {
        validateAmount(amount);

        if (fromAccountNumber.equals(toAccountNumber)) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        Account fromAccount = accountService.getAccount(fromAccountNumber);
        Account toAccount = accountService.getAccount(toAccountNumber);

        accountService.validateActiveAccount(fromAccount);
        accountService.validateActiveAccount(toAccount);

        BigDecimal fromBalanceBefore = fromAccount.getBalance();

        if (fromBalanceBefore.compareTo(amount) < 0) {
            Transaction failedTx = buildTransaction(fromAccount, amount, fromBalanceBefore, fromBalanceBefore,
                    TransactionType.TRANSFER_OUT, TransactionStatus.FAILED, "Insufficient funds for transfer");
            transactionRepository.save(failedTx);
            throw new InsufficientFundsException("Insufficient funds for transfer from account: " + fromAccountNumber);
        }

        BigDecimal toBalanceBefore = toAccount.getBalance();

        // Update balances
        fromAccount.setBalance(fromBalanceBefore.subtract(amount));
        toAccount.setBalance(toBalanceBefore.add(amount));

        // Create transaction records
        Transaction outTx = buildTransaction(fromAccount, amount, fromBalanceBefore, fromAccount.getBalance(),
                TransactionType.TRANSFER_OUT, TransactionStatus.SUCCESS,
                description != null ? description : "Transfer to " + toAccountNumber);

        Transaction inTx = buildTransaction(toAccount, amount, toBalanceBefore, toAccount.getBalance(),
                TransactionType.TRANSFER_IN, TransactionStatus.SUCCESS,
                description != null ? description : "Transfer from " + fromAccountNumber);

        fromAccount.getTransactions().add(outTx);
        toAccount.getTransactions().add(inTx);

        log.info("Transfer of {} from {} to {} successful", amount, fromAccountNumber, toAccountNumber);

        alertService.checkAndAlert(fromAccount);
        alertService.checkAndAlert(toAccount);

        transactionRepository.save(outTx);
        transactionRepository.save(inTx);

        return List.of(outTx, inTx);
    }

    public Page<Transaction> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable);
    }

    public Page<Transaction> getAccountTransactions(String accountNumber, Pageable pageable) {
        accountService.getAccount(accountNumber); // Verify existence
        return transactionRepository.findByAccountAccountNumberOrderByTransactionDateDesc(accountNumber, pageable);
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException("Amount must be greater than zero");
        }
    }

    private Transaction buildTransaction(Account account, BigDecimal amount, BigDecimal before, BigDecimal after,
            TransactionType type, TransactionStatus status, String description) {
        return Transaction.builder()
                .referenceNumber("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .account(account)
                .amount(amount)
                .balanceBefore(before)
                .balanceAfter(after)
                .transactionType(type)
                .transactionStatus(status)
                .description(description)
                .build();
    }
}

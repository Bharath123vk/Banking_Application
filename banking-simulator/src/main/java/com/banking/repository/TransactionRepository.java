package com.banking.repository;

import com.banking.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Finds all transactions owned by a specific account (Deposits, Withdrawals, and Sent Transfers).
     */
    List<Transaction> findByAccountAccountNumberOrderByTransactionDateDesc(String accountNumber);

    /**
     * Finds transactions where this account number was the target of a transfer.
     * Useful for showing history where the user received money from an external source.
     */
    List<Transaction> findByTargetAccountNumberOrderByTransactionDateDesc(String targetAccountNumber);
}
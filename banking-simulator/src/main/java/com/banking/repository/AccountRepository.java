package com.banking.repository;

import com.banking.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    /**
     * Used for Login: Retrieves account details via the unique Account Number.
     */
    Optional<Account> findByAccountNumber(String accountNumber);

    /**
     * Used for Signup Validation: Prevents multiple accounts with the same email.
     */
    Optional<Account> findByEmail(String email);

    /**
     * Returns all active accounts for administrative or reporting purposes.
     */
    List<Account> findByActiveTrue();

    /**
     * Checks if an account number already exists (useful for generating unique numbers).
     */
    boolean existsByAccountNumber(String accountNumber);

    /**
     * Checks if an email is already registered.
     */
    boolean existsByEmail(String email);

    /**
     * Custom Query to find accounts with balance lower than a specific amount.
     */
    @Query("SELECT a FROM Account a WHERE a.balance < :threshold")
    List<Account> findAccountsBelowThreshold(@Param("threshold") BigDecimal threshold);
}
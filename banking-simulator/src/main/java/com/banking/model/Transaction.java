package com.banking.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String referenceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus transactionStatus;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private BigDecimal balanceBefore;

    @Column(nullable = false)
    private BigDecimal balanceAfter;

    private String description;

    /**
     * Stores the recipient/sender account number for external transfers
     * or to show "To: XXXXXX" in the UI even if the account is local.
     */
    private String targetAccountNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonIgnore
    private Account account;

    @Column(nullable = false, updatable = false)
    private LocalDateTime transactionDate;

    // --- CONSTRUCTORS ---
    public Transaction() {}

    // --- MANUAL BUILDER PATTERN (Updated for targetAccountNumber) ---
    public static TransactionBuilder builder() {
        return new TransactionBuilder();
    }

    public static class TransactionBuilder {
        private Transaction t = new Transaction();

        public TransactionBuilder referenceNumber(String val) { t.referenceNumber = val; return this; }
        public TransactionBuilder transactionType(TransactionType val) { t.transactionType = val; return this; }
        public TransactionBuilder transactionStatus(TransactionStatus val) { t.transactionStatus = val; return this; }
        public TransactionBuilder amount(BigDecimal val) { t.amount = val; return this; }
        public TransactionBuilder balanceBefore(BigDecimal val) { t.balanceBefore = val; return this; }
        public TransactionBuilder balanceAfter(BigDecimal val) { t.balanceAfter = val; return this; }
        public TransactionBuilder description(String val) { t.description = val; return this; }
        public TransactionBuilder targetAccountNumber(String val) { t.targetAccountNumber = val; return this; }
        public TransactionBuilder account(Account val) { t.account = val; return this; }
        public TransactionBuilder transactionDate(LocalDateTime val) { t.transactionDate = val; return this; }

        public Transaction build() {
            return t;
        }
    }

    // --- MANUAL GETTERS & SETTERS ---
    public Long getId() { return id; }
    public String getReferenceNumber() { return referenceNumber; }
    public TransactionType getTransactionType() { return transactionType; }
    public TransactionStatus getTransactionStatus() { return transactionStatus; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public String getDescription() { return description; }
    public String getTargetAccountNumber() { return targetAccountNumber; }
    public void setTargetAccountNumber(String targetAccountNumber) { this.targetAccountNumber = targetAccountNumber; }
    public Account getAccount() { return account; }
    public LocalDateTime getTransactionDate() { return transactionDate; }

    @PrePersist
    protected void onCreate() {
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
    }
}
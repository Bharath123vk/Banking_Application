package com.banking.dto;

import com.banking.model.AccountType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * DTO for creating a new bank account.
 * Manual getters and setters are implemented to ensure compilation 
 * success without relying on Lombok processing.
 */
public class CreateAccountRequest {

    @NotBlank(message = "Holder name is required")
    private String holderName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotNull(message = "Initial balance is required")
    @Min(value = 0, message = "Initial balance cannot be negative")
    private BigDecimal initialBalance;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    // --- NO-ARGS CONSTRUCTOR ---
    public CreateAccountRequest() {
    }

    // --- ALL-ARGS CONSTRUCTOR ---
    public CreateAccountRequest(String holderName, String email, BigDecimal initialBalance, AccountType accountType) {
        this.holderName = holderName;
        this.email = email;
        this.initialBalance = initialBalance;
        this.accountType = accountType;
    }

    // --- MANUAL GETTERS AND SETTERS (Replaces @Data) ---

    public String getHolderName() {
        return holderName;
    }

    public void setHolderName(String holderName) {
        this.holderName = holderName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BigDecimal getInitialBalance() {
        return initialBalance;
    }

    public void setInitialBalance(BigDecimal initialBalance) {
        this.initialBalance = initialBalance;
    }

    public AccountType getAccountType() {
        return accountType;
    }

    public void setAccountType(AccountType accountType) {
        this.accountType = accountType;
    }
}
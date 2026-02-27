package com.banking.dto;

import com.banking.model.AccountType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
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
}

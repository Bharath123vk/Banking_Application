package com.banking.controller;

import com.banking.dto.CreateAccountRequest;
import com.banking.model.Account;
import com.banking.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = {"http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173"})
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * UPDATE PROFILE ENDPOINT
     * Matches api.ts: updateProfile(accountNumber, data)
     */
    @PutMapping("/{accountNumber}/profile")
    public ResponseEntity<Account> updateProfile(
            @PathVariable String accountNumber,
            @RequestBody ProfileUpdateRequest profileData) {

        Account account = accountService.getAccount(accountNumber);

        // Update fields if they are provided in the request
        if (profileData.getHolderName() != null) account.setHolderName(profileData.getHolderName());
        if (profileData.getEmail() != null) account.setEmail(profileData.getEmail());
        if (profileData.getPhoneNumber() != null) account.setPhoneNumber(profileData.getPhoneNumber());
        if (profileData.getAddress() != null) account.setAddress(profileData.getAddress());
        if (profileData.getOccupation() != null) account.setOccupation(profileData.getOccupation());

        // Use the existing service to save the updated account
        Account updatedAccount = accountService.updateAccount(account);
        return ResponseEntity.ok(updatedAccount);
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody CreateAccountRequest req) {
        Account account = accountService.createAccount(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<Account> getAccountDetails(@PathVariable String accountNumber) {
        Account account = accountService.getAccount(accountNumber);
        return ResponseEntity.ok(account);
    }

    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{accountNumber}/balance")
    public ResponseEntity<Map<String, BigDecimal>> getAccountBalance(@PathVariable String accountNumber) {
        BigDecimal balance = accountService.getBalance(accountNumber);
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("balance", balance);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getBankSummary() {
        List<Account> accounts = accountService.getAllAccounts();
        BigDecimal totalBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAccounts", accounts.size());
        summary.put("totalBalance", totalBalance);
        return ResponseEntity.ok(summary);
    }

    @PutMapping("/{accountNumber}/deactivate")
    public ResponseEntity<Account> deactivateAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.deactivateAccount(accountNumber));
    }

    @PutMapping("/{accountNumber}/activate")
    public ResponseEntity<Account> reactivateAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.reactivateAccount(accountNumber));
    }

    /**
     * Data Transfer Object for Profile Updates
     */
    public static class ProfileUpdateRequest {
        private String holderName;
        private String email;
        private String phoneNumber;
        private String address;
        private String occupation;

        // Getters and Setters
        public String getHolderName() { return holderName; }
        public void setHolderName(String holderName) { this.holderName = holderName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getOccupation() { return occupation; }
        public void setOccupation(String occupation) { this.occupation = occupation; }
    }
}
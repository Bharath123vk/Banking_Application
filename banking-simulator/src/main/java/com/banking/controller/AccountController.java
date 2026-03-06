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
// Supporting both default Vite (5173) and your observed port (8080)
public class AccountController {

    private final AccountService accountService;

    // Manual Constructor (Replacing @RequiredArgsConstructor for consistency)
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * SIGNUP ENDPOINT
     * Receives SignUpData from React and persists it.
     */
    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody CreateAccountRequest req) {
        Account account = accountService.createAccount(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    /**
     * LOGIN & FETCH ENDPOINT
     * Used by Login.tsx to retrieve account by Account Number.
     */
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

    @PutMapping("/{accountNumber}/activate") // Renamed from reactivate to match your api.ts
    public ResponseEntity<Account> reactivateAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.reactivateAccount(accountNumber));
    }
}
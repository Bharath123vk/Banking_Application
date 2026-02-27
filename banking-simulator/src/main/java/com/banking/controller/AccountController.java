package com.banking.controller;

import com.banking.dto.CreateAccountRequest;
import com.banking.model.Account;
import com.banking.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody CreateAccountRequest req) {
        Account account = accountService.createAccount(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<Account> getAccountDetails(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getAccount(accountNumber));
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

    @PutMapping("/{accountNumber}/reactivate")
    public ResponseEntity<Account> reactivateAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.reactivateAccount(accountNumber));
    }
}

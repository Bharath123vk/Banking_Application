package com.banking.controller;

import com.banking.dto.TransactionRequest;
import com.banking.dto.TransferRequest;
import com.banking.model.Transaction;
import com.banking.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
// Global CORS is handled in BankingSimulatorApplication.java, so no @CrossOrigin needed here
public class TransactionController {

    private final TransactionService transactionService;

    // Manual Constructor (Replaces @RequiredArgsConstructor)
    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    public ResponseEntity<Transaction> makeDeposit(@Valid @RequestBody TransactionRequest req) {
        Transaction tx = transactionService.deposit(
                req.getAccountNumber(), req.getAmount(), req.getDescription());
        return ResponseEntity.ok(tx);
    }

    @PostMapping("/withdraw")
    public ResponseEntity<Transaction> makeWithdrawal(@Valid @RequestBody TransactionRequest req) {
        Transaction tx = transactionService.withdraw(
                req.getAccountNumber(), req.getAmount(), req.getDescription());
        return ResponseEntity.ok(tx);
    }

    @PostMapping("/transfer")
    public ResponseEntity<List<Transaction>> makeTransfer(@Valid @RequestBody TransferRequest req) {
        // FIXED: Updated to use getSourceAccountNumber and getDestinationAccountNumber
        List<Transaction> transactions = transactionService.transfer(
                req.getSourceAccountNumber(),
                req.getDestinationAccountNumber(),
                req.getAmount(),
                req.getDescription()
        );
        return ResponseEntity.ok(transactions);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<List<Transaction>> getAccountTransactions(@PathVariable String accountNumber) {
        return ResponseEntity.ok(transactionService.getAccountTransactions(accountNumber));
    }
}
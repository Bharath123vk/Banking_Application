package com.banking.controller;

import com.banking.dto.TransactionRequest;
import com.banking.dto.TransferRequest;
import com.banking.model.Transaction;
import com.banking.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

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
        List<Transaction> transactions = transactionService.transfer(
                req.getFromAccountNumber(), req.getToAccountNumber(), req.getAmount(), req.getDescription());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping
    public ResponseEntity<Page<Transaction>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(transactionService.getAllTransactions(pageable));
    }

    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<Page<Transaction>> getAccountTransactions(
            @PathVariable String accountNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(transactionService.getAccountTransactions(accountNumber, pageable));
    }
}

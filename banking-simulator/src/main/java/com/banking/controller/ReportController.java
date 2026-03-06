package com.banking.controller;

import com.banking.model.Account;
import com.banking.repository.AccountRepository;
import com.banking.service.ReportService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:8080", "http://127.0.0.1:8080"})
public class ReportController {

    private final ReportService reportService;
    private final AccountRepository accountRepository;

    @Value("${banking.reports.output-dir:reports/}")
    private String outputDir;

    @Value("${banking.alert.low-balance-threshold:500.00}")
    private BigDecimal threshold;

    public ReportController(ReportService reportService, AccountRepository accountRepository) {
        this.reportService = reportService;
        this.accountRepository = accountRepository;
    }

    @PostMapping("/account-statement/{accountNumber}")
    public ResponseEntity<Map<String, String>> generateAccountStatement(@PathVariable String accountNumber) {
        String filename = reportService.generateAccountStatement(accountNumber);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Statement generated successfully");
        response.put("filename", filename);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bank-summary")
    public ResponseEntity<Map<String, String>> generateBankSummaryReport() {
        String filename = reportService.generateBankSummaryReport();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Bank summary report generated successfully");
        response.put("filename", filename);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<List<String>> listReports() {
        return ResponseEntity.ok(reportService.listReports());
    }

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> readReport(@PathVariable String filename) {
        // Ensure path ends with slash correctly
        String path = outputDir.endsWith("/") ? outputDir : outputDir + "/";
        File file = new File(path + filename);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        // Determine content type dynamically
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM; // Default to binary stream
        if (filename.toLowerCase().endsWith(".pdf")) {
            mediaType = MediaType.APPLICATION_PDF;
        } else if (filename.toLowerCase().endsWith(".txt")) {
            mediaType = MediaType.TEXT_PLAIN;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .body(resource);
    }

    @GetMapping("/alerts/low-balance")
    public ResponseEntity<List<Account>> getLowBalanceAccounts() {
        return ResponseEntity.ok(accountRepository.findAccountsBelowThreshold(threshold));
    }
}
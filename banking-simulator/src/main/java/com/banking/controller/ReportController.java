package com.banking.controller;

import com.banking.model.Account;
import com.banking.repository.AccountRepository;
import com.banking.service.ReportService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173"})
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

    /**
     * NEW: GOOGLE SPREADSHEET (CSV) EXPORT ENDPOINT
     * Directly addresses mentor feedback for spreadsheet-compatible reports.
     */
    @GetMapping("/export-csv/{accountNumber}")
    public ResponseEntity<byte[]> downloadCsv(@PathVariable String accountNumber) {
        // Generates the CSV string content from the Service
        String csvData = reportService.generateTransactionCsv(accountNumber);
        byte[] content = csvData.getBytes();

        String filename = "VaultBank_Statement_" + accountNumber + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(content);
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

    /**
     * SECURED LIST ENDPOINT
     * Filtered by accountNumber to prevent cross-user data leaks.
     */
    @GetMapping("/list")
    public ResponseEntity<List<String>> listReports(@RequestParam(required = false) String accountNumber) {
        List<String> allFiles = reportService.listReports();

        // If no account is provided, return only the general bank summary
        if (accountNumber == null || accountNumber.isEmpty()) {
            return ResponseEntity.ok(allFiles.stream()
                    .filter(name -> name.startsWith("Bank_Summary"))
                    .collect(Collectors.toList()));
        }

        // Return only files belonging to this account OR the general bank summary
        List<String> filteredFiles = allFiles.stream()
                .filter(name -> name.contains(accountNumber) || name.startsWith("Bank_Summary"))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredFiles);
    }

    /**
     * SECURED DOWNLOAD ENDPOINT
     * Includes a path-traversal and owner-validation check.
     */
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> readReport(
            @PathVariable String filename,
            @RequestParam(required = false) String owner) {

        // 1. Security Check: Prevent unauthorized access to other users' files
        if (owner != null && !filename.contains(owner) && !filename.startsWith("Bank_Summary")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String path = outputDir.endsWith("/") ? outputDir : outputDir + "/";
        File file = new File(path + filename);

        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        // Determine Media Type based on extension
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (filename.toLowerCase().endsWith(".pdf")) {
            mediaType = MediaType.APPLICATION_PDF;
        } else if (filename.toLowerCase().endsWith(".csv")) {
            mediaType = MediaType.parseMediaType("text/csv");
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
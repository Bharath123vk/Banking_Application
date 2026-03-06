package com.banking.service;

import com.banking.model.Account;
import com.banking.model.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final AccountService accountService;
    private final TransactionService transactionService;

    @Value("${banking.reports.output-dir:reports/}")
    private String outputDir;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter FILE_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    public String generateAccountStatement(String accountNumber) {
        Account account = accountService.getAccount(accountNumber);
        List<Transaction> transactions = transactionService
                .getAccountTransactions(accountNumber, org.springframework.data.domain.Pageable.unpaged()).getContent();

        ensureDirectoryExists();
        String filename = "Statement_" + accountNumber + "_" + LocalDateTime.now().format(FILE_DATE_FORMATTER) + ".txt";
        String filepath = outputDir + filename;

        try (PrintWriter writer = new PrintWriter(new FileWriter(filepath))) {
            writer.println("=========================================");
            writer.println("             ACCOUNT STATEMENT           ");
            writer.println("=========================================");
            writer.println("Account Number : " + account.getAccountNumber());
            writer.println("Holder Name    : " + account.getHolderName());
            writer.println("Account Type   : " + account.getAccountType());
            writer.println("Current Balance: $" + account.getBalance());
            writer.println("Status         : " + (account.isActive() ? "ACTIVE" : "INACTIVE"));
            writer.println("Generated On   : " + LocalDateTime.now().format(DATE_FORMATTER));
            writer.println("=========================================");
            writer.println("TRANSACTION HISTORY:");
            writer.println("-----------------------------------------------------------------------------------------");
            writer.printf("%-15s | %-20s | %-12s | %-12s | %-10s | %-20s%n",
                    "REFERENCE", "DATE", "TYPE", "AMOUNT", "STATUS", "DESCRIPTION");
            writer.println("-----------------------------------------------------------------------------------------");

            if (transactions.isEmpty()) {
                writer.println("No transactions found.");
            } else {
                for (Transaction tx : transactions) {
                    writer.printf("%-15s | %-20s | $%-11.2f | %-12s | %-10s | %-20s%n",
                            tx.getReferenceNumber(),
                            tx.getTransactionDate().format(DATE_FORMATTER),
                            tx.getAmount(),
                            tx.getTransactionType(),
                            tx.getTransactionStatus(),
                            tx.getDescription() != null ? tx.getDescription() : "");
                }
            }
            writer.println("=========================================");
            writer.println("      END OF STATEMENT      ");
            writer.println("=========================================");
        } catch (IOException e) {
            log.error("Failed to generate statement for {}: {}", accountNumber, e.getMessage());
            throw new RuntimeException("Could not generate report", e);
        }

        log.info("Generated account statement: {}", filepath);
        return filename;
    }

    public String generateBankSummaryReport() {
        List<Account> allAccounts = accountService.getAllAccounts();

        ensureDirectoryExists();
        String filename = "BankSummary_" + LocalDateTime.now().format(FILE_DATE_FORMATTER) + ".txt";
        String filepath = outputDir + filename;

        try (PrintWriter writer = new PrintWriter(new FileWriter(filepath))) {
            writer.println("=========================================");
            writer.println("           BANK SUMMARY REPORT           ");
            writer.println("=========================================");
            writer.println("Generated On : " + LocalDateTime.now().format(DATE_FORMATTER));
            writer.println("=========================================");

            int totalAccounts = allAccounts.size();
            int activeAccounts = 0;
            BigDecimal totalBalance = BigDecimal.ZERO;

            for (Account acc : allAccounts) {
                if (acc.isActive())
                    activeAccounts++;
                totalBalance = totalBalance.add(acc.getBalance());
            }

            writer.println("Total Accounts : " + totalAccounts);
            writer.println("Active Accounts: " + activeAccounts);
            writer.println("Total Holdings : $" + totalBalance);
            writer.println("=========================================");
            writer.println("ACCOUNT LISTING:");
            writer.println("---------------------------------------------------------------");
            writer.printf("%-15s | %-20s | %-12s | %-10s%n",
                    "ACCOUNT NUMBER", "HOLDER NAME", "BALANCE", "STATUS");
            writer.println("---------------------------------------------------------------");

            for (Account acc : allAccounts) {
                writer.printf("%-15s | %-20s | $%-11.2f | %-10s%n",
                        acc.getAccountNumber(),
                        acc.getHolderName(),
                        acc.getBalance(),
                        acc.isActive() ? "ACTIVE" : "INACTIVE");
            }
            writer.println("=========================================");
            writer.println("        END OF REPORT      ");
            writer.println("=========================================");
        } catch (IOException e) {
            log.error("Failed to generate bank summary report: {}", e.getMessage());
            throw new RuntimeException("Could not generate report", e);
        }

        log.info("Generated bank summary report: {}", filepath);
        return filename;
    }

    public List<String> listReports() {
        File dir = new File(outputDir);
        List<String> reportFiles = new ArrayList<>();

        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles((d, name) -> name.endsWith(".txt"));
            if (files != null) {
                for (File file : files) {
                    reportFiles.add(file.getName());
                }
            }
        }
        return reportFiles;
    }

    private void ensureDirectoryExists() {
        File dir = new File(outputDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }
}

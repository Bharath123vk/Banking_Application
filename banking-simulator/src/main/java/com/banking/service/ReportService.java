package com.banking.service;

import com.banking.model.Account;
import com.banking.model.Transaction;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    private final AccountService accountService;
    private final TransactionService transactionService;

    @Value("${banking.reports.output-dir:reports/}")
    private String outputDir;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter FILE_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    public ReportService(AccountService accountService, TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    public String generateAccountStatement(String accountNumber) {
        Account account = accountService.getAccount(accountNumber);
        List<Transaction> transactions = transactionService
                .getAccountTransactions(accountNumber, org.springframework.data.domain.Pageable.unpaged()).getContent();

        ensureDirectoryExists();
        String filename = "Statement_" + accountNumber + "_" + LocalDateTime.now().format(FILE_DATE_FORMATTER) + ".pdf";
        String filepath = outputDir + (outputDir.endsWith("/") ? "" : "/") + filename;

        try (PdfWriter writer = new PdfWriter(filepath);
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {

            document.add(new Paragraph("VAULT BANK - ACCOUNT STATEMENT")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18)
                    .setBold());

            document.add(new Paragraph("Generated on: " + LocalDateTime.now().format(DATE_FORMATTER))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontSize(10));

            document.add(new Paragraph("\nAccount Details")
                    .setBold()
                    .setBorderBottom(new com.itextpdf.layout.borders.SolidBorder(1)));

            document.add(new Paragraph("Account Number: " + account.getAccountNumber()));
            document.add(new Paragraph("Holder Name: " + account.getHolderName()));
            document.add(new Paragraph("Account Type: " + account.getAccountType()));
            // FIXED: Used RoundingMode.HALF_UP instead of deprecated constant
            document.add(new Paragraph("Current Balance: ₹" + account.getBalance().setScale(2, RoundingMode.HALF_UP)));
            document.add(new Paragraph("Status: " + (account.isActive() ? "ACTIVE" : "INACTIVE")));

            document.add(new Paragraph("\nTransaction History").setBold());
            Table table = new Table(UnitValue.createPointArray(new float[]{100f, 120f, 80f, 80f, 150f}));
            table.setWidth(UnitValue.createPercentValue(100));

            table.addHeaderCell(new Cell().add(new Paragraph("Reference")).setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Date")).setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Type")).setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Amount")).setBackgroundColor(ColorConstants.LIGHT_GRAY));
            table.addHeaderCell(new Cell().add(new Paragraph("Description")).setBackgroundColor(ColorConstants.LIGHT_GRAY));

            if (transactions.isEmpty()) {
                table.addCell(new Cell(1, 5).add(new Paragraph("No transactions found.")).setTextAlignment(TextAlignment.CENTER));
            } else {
                for (Transaction tx : transactions) {
                    table.addCell(new Cell().add(new Paragraph(tx.getReferenceNumber())).setFontSize(9));
                    table.addCell(new Cell().add(new Paragraph(tx.getTransactionDate().format(DATE_FORMATTER))).setFontSize(9));
                    table.addCell(new Cell().add(new Paragraph(tx.getTransactionType().toString())).setFontSize(9));
                    table.addCell(new Cell().add(new Paragraph("₹" + tx.getAmount().setScale(2, RoundingMode.HALF_UP))).setFontSize(9));
                    table.addCell(new Cell().add(new Paragraph(tx.getDescription() != null ? tx.getDescription() : "-")).setFontSize(9));
                }
            }

            document.add(table);
            document.add(new Paragraph("\n--- End of Statement ---").setTextAlignment(TextAlignment.CENTER).setFontSize(10));

        } catch (IOException e) {
            log.error("PDF Error: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF statement", e);
        }

        return filename;
    }

    public String generateBankSummaryReport() {
        List<Account> allAccounts = accountService.getAllAccounts();
        ensureDirectoryExists();
        String filename = "BankSummary_" + LocalDateTime.now().format(FILE_DATE_FORMATTER) + ".pdf";
        String filepath = outputDir + (outputDir.endsWith("/") ? "" : "/") + filename;

        try (PdfWriter writer = new PdfWriter(filepath);
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {

            document.add(new Paragraph("VAULT BANK - MANAGEMENT SUMMARY")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18).setBold());

            BigDecimal totalHoldings = allAccounts.stream().map(Account::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);

            document.add(new Paragraph("\nBank Statistics").setBold());
            document.add(new Paragraph("Total Accounts: " + allAccounts.size()));
            document.add(new Paragraph("Total Bank Holdings: ₹" + totalHoldings.setScale(2, RoundingMode.HALF_UP)));
            document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DATE_FORMATTER)));

            Table table = new Table(UnitValue.createPercentArray(new float[]{3, 4, 3, 2}));
            table.setWidth(UnitValue.createPercentValue(100));

            table.addHeaderCell(new Cell().add(new Paragraph("Account Number")));
            table.addHeaderCell(new Cell().add(new Paragraph("Holder Name")));
            table.addHeaderCell(new Cell().add(new Paragraph("Balance")));
            table.addHeaderCell(new Cell().add(new Paragraph("Status")));

            for (Account acc : allAccounts) {
                table.addCell(acc.getAccountNumber());
                table.addCell(acc.getHolderName());
                table.addCell("₹" + acc.getBalance().setScale(2, RoundingMode.HALF_UP));
                table.addCell(acc.isActive() ? "ACTIVE" : "INACTIVE");
            }

            document.add(table);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF summary", e);
        }
        return filename;
    }

    public List<String> listReports() {
        File dir = new File(outputDir);
        List<String> reportFiles = new ArrayList<>();
        if (dir.exists() && dir.isDirectory()) {
            File[] files = dir.listFiles((d, name) -> name.endsWith(".pdf"));
            if (files != null) {
                for (File file : files) reportFiles.add(file.getName());
            }
        }
        return reportFiles;
    }

    private void ensureDirectoryExists() {
        File dir = new File(outputDir);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            if (created) log.info("Created reports directory at: {}", dir.getAbsolutePath());
        }
    }
}
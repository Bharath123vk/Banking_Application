package com.banking.config;

import com.banking.dto.CreateAccountRequest;
import com.banking.model.AccountType;
import com.banking.service.AccountService;
import com.banking.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AccountService accountService;
    private final TransactionService transactionService;

    @Override
    public void run(String... args) throws Exception {
        if (accountService.getAllAccounts().isEmpty()) {
            log.info("Initializing sample data...");

            CreateAccountRequest acc1 = new CreateAccountRequest();
            acc1.setHolderName("John Doe");
            acc1.setEmail("john.doe@example.com");
            acc1.setInitialBalance(new BigDecimal("1500.00"));
            acc1.setAccountType(AccountType.SAVINGS);
            String acct1Num = accountService.createAccount(acc1).getAccountNumber();

            CreateAccountRequest acc2 = new CreateAccountRequest();
            acc2.setHolderName("Jane Smith");
            acc2.setEmail("jane.smith@example.com");
            acc2.setInitialBalance(new BigDecimal("8000.00"));
            acc2.setAccountType(AccountType.CHECKING);
            String acct2Num = accountService.createAccount(acc2).getAccountNumber();

            CreateAccountRequest acc3 = new CreateAccountRequest();
            acc3.setHolderName("Alice Brown");
            acc3.setEmail("alice.brown@example.com");
            acc3.setInitialBalance(new BigDecimal("300.00"));
            acc3.setAccountType(AccountType.CURRENT);
            accountService.createAccount(acc3);

            transactionService.deposit(acct1Num, new BigDecimal("500.00"), "Initial Deposit bonus");
            transactionService.transfer(acct2Num, acct1Num, new BigDecimal("1000.00"), "Rent payment");

            log.info("Sample data initialization complete.");
        }
    }
}

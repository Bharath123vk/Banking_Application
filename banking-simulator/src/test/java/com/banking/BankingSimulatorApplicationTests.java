
package com.banking;

import com.banking.dto.CreateAccountRequest;
import com.banking.exception.InsufficientFundsException;
import com.banking.exception.InvalidAmountException;
import com.banking.model.Account;
import com.banking.model.AccountType;
import com.banking.repository.AccountRepository;
import com.banking.service.AccountService;
import com.banking.service.TransactionService;

import jakarta.transaction.Transactional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import com.banking.model.User;
import com.banking.repository.UserRepository;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BankingSimulatorApplicationTests {

    @Autowired
    private AccountService accountService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    private String acc1Num;
    private String acc2Num;

    @BeforeEach
    void setup() {

        // Clear database before every test
        accountRepository.deleteAll();
        userRepository.deleteAll();

        User testUser = new User("Test User 1", "test1@example.com", "password", com.banking.model.Role.USER);
        testUser = userRepository.save(testUser);

        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth = 
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(testUser, null, testUser.getAuthorities());
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);

        CreateAccountRequest req1 = new CreateAccountRequest();
        req1.setHolderName("Test User 1");
        req1.setEmail("test1@example.com");
        req1.setInitialBalance(new BigDecimal("1000.00"));
        req1.setAccountType(AccountType.SAVINGS);

        Account acc1 = accountService.createAccount(req1);
        acc1Num = acc1.getAccountNumber();

        CreateAccountRequest req2 = new CreateAccountRequest();
        req2.setHolderName("Test User 2");
        req2.setEmail("test1@example.com"); // Reusing same authenticated user for testing logic
        req2.setInitialBalance(new BigDecimal("500.00"));
        req2.setAccountType(AccountType.CHECKING);

        Account acc2 = accountService.createAccount(req2);
        acc2Num = acc2.getAccountNumber();
    }

    @Test
    void testDeposit() {

        BigDecimal initialBalance = accountService.getBalance(acc1Num);

        transactionService.deposit(acc1Num, new BigDecimal("250.00"), "Test Deposit");

        BigDecimal newBalance = accountService.getBalance(acc1Num);

        assertEquals(initialBalance.add(new BigDecimal("250.00")), newBalance);
    }

    @Test
    void testWithdrawal() {

        BigDecimal initialBalance = accountService.getBalance(acc1Num);

        transactionService.withdraw(acc1Num, new BigDecimal("100.00"), "Test Withdrawal");

        BigDecimal newBalance = accountService.getBalance(acc1Num);

        assertEquals(initialBalance.subtract(new BigDecimal("100.00")), newBalance);
    }

    @Test
    void testOverdraftThrowsException() {

        assertThrows(InsufficientFundsException.class, () -> {
            transactionService.withdraw(acc1Num, new BigDecimal("5000.00"), "Overdraft Withdrawal");
        });
    }

    @Test
    void testTransfer() {

        BigDecimal acc1Initial = accountService.getBalance(acc1Num);
        BigDecimal acc2Initial = accountService.getBalance(acc2Num);

        transactionService.transfer(acc1Num, acc2Num, new BigDecimal("200.00"), "Test Transfer");

        BigDecimal acc1New = accountService.getBalance(acc1Num);
        BigDecimal acc2New = accountService.getBalance(acc2Num);

        assertEquals(acc1Initial.subtract(new BigDecimal("200.00")), acc1New);
        assertEquals(acc2Initial.add(new BigDecimal("200.00")), acc2New);
    }

    @Test
    void testInvalidAmountThrowsException() {

        assertThrows(InvalidAmountException.class, () -> {
            transactionService.deposit(acc1Num, new BigDecimal("-50.00"), "Negative Deposit");
        });
    }

}

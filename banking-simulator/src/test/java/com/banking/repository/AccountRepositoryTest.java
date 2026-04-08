package com.banking.repository;

import com.banking.model.Account;
import com.banking.model.AccountType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
public class AccountRepositoryTest {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager entityManager;

    private com.banking.model.User testUser;

    @org.junit.jupiter.api.BeforeEach
    public void setup() {
        testUser = new com.banking.model.User("Test User", "test@test.com", "password",
                com.banking.model.Role.USER);
        testUser = entityManager.persistAndFlush(testUser);
    }

    @Test
    public void testSaveAndFindByAccountNumber() {
        // Arrange
        Account account = Account.builder()
                .accountNumber("TEST001")
                .holderName("Alice Smith")
                .email("alice@test.com")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("1000.00"))
                .active(true)
                .build();
        account.setUser(testUser);

        // Act
        accountRepository.save(account);
        Optional<Account> foundAccount = accountRepository.findByAccountNumber("TEST001");

        // Assert
        assertThat(foundAccount).isPresent();
        assertThat(foundAccount.get().getHolderName()).isEqualTo("Alice Smith");
        assertThat(foundAccount.get().getBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));
    }

    @Test
    public void testFindByEmail() {
        // Arrange
        Account account = Account.builder()
                .accountNumber("TEST002")
                .holderName("Bob Jones")
                .email("bob@test.com")
                .accountType(AccountType.CHECKING)
                .balance(new BigDecimal("500.00"))
                .active(true)
                .build();
        account.setUser(testUser);

        // Act
        accountRepository.save(account);
        Optional<Account> foundAccount = accountRepository.findByEmail("bob@test.com");

        // Assert
        assertThat(foundAccount).isPresent();
        assertThat(foundAccount.get().getAccountNumber()).isEqualTo("TEST002");
    }

    @Test
    public void testExistsByAccountNumberAndEmail() {
        // Arrange
        Account account = Account.builder()
                .accountNumber("TEST003")
                .holderName("Charlie Brown")
                .email("charlie@test.com")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("250.00"))
                .active(true)
                .build();
        account.setUser(testUser);

        accountRepository.save(account);

        // Act & Assert
        assertThat(accountRepository.existsByAccountNumber("TEST003")).isTrue();
        assertThat(accountRepository.existsByAccountNumber("INVALID")).isFalse();
        assertThat(accountRepository.existsByEmail("charlie@test.com")).isTrue();
        assertThat(accountRepository.existsByEmail("invalid@test.com")).isFalse();
    }

    @Test
    public void testFindAccountsBelowThreshold() {
        // Arrange
        Account lowBalanceAccount = Account.builder()
                .accountNumber("TEST004")
                .holderName("Dave")
                .email("dave@test.com")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("100.00"))
                .active(true)
                .build();
        lowBalanceAccount.setUser(testUser);

        Account highBalanceAccount = Account.builder()
                .accountNumber("TEST005")
                .holderName("Eve")
                .email("eve@test.com")
                .accountType(AccountType.CHECKING)
                .balance(new BigDecimal("1500.00"))
                .active(true)
                .build();
        highBalanceAccount.setUser(testUser);

        accountRepository.save(lowBalanceAccount);
        accountRepository.save(highBalanceAccount);

        // Act
        List<Account> accountsBelowThreshold = accountRepository.findAccountsBelowThreshold(new BigDecimal("500.00"));

        // Assert
        assertThat(accountsBelowThreshold).hasSize(1);
        assertThat(accountsBelowThreshold.get(0).getAccountNumber()).isEqualTo("TEST004");
    }
}

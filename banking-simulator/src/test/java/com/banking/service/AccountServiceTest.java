package com.banking.service;

import com.banking.dto.CreateAccountRequest;
import com.banking.exception.AccountInactiveException;
import com.banking.exception.AccountNotFoundException;
import com.banking.model.Account;
import com.banking.model.AccountType;
import com.banking.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import com.banking.model.User;
import com.banking.repository.UserRepository;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AccountService accountService;

    private Account sampleAccount;

    @BeforeEach
    void setUp() {
        sampleAccount = Account.builder()
                .accountNumber("ACC1234567890")
                .holderName("Jane Doe")
                .email("jane@example.com")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("2000.00"))
                .active(true)
                .build();
    }

    @Test
    void testCreateAccount_Success() {
        // Mock Security Context
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        
        UserDetails userDetails = mock(UserDetails.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("jane@example.com");

        User authUser = new User("Jane Doe", "jane@example.com", "pass", com.banking.model.Role.USER);
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(authUser));
        CreateAccountRequest req = new CreateAccountRequest(
                "Jane Doe",
                "jane@example.com",
                new BigDecimal("2000.00"),
                AccountType.SAVINGS
        );

        when(accountRepository.existsByAccountNumber(anyString())).thenReturn(false);
        when(accountRepository.save(any(Account.class))).thenReturn(sampleAccount);

        Account createdAccount = accountService.createAccount(req);

        assertThat(createdAccount).isNotNull();
        assertThat(createdAccount.getHolderName()).isEqualTo("Jane Doe");
        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    void testCreateAccount_EmailAlreadyExists() {
        // Mock Security Context
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        
        UserDetails userDetails = mock(UserDetails.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn("jane@example.com");

        // Act & Assert for user not found scenario (since duplicate email check was removed from service)
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.empty());
        CreateAccountRequest req = new CreateAccountRequest(
                "Jane Doe",
                "jane@example.com",
                new BigDecimal("2000.00"),
                AccountType.SAVINGS
        );

        assertThrows(RuntimeException.class, () -> accountService.createAccount(req));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void testGetAccount_Success() {
        when(accountRepository.findByAccountNumber("ACC1234567890")).thenReturn(Optional.of(sampleAccount));

        Account foundAccount = accountService.getAccount("ACC1234567890");

        assertThat(foundAccount).isNotNull();
        assertThat(foundAccount.getAccountNumber()).isEqualTo("ACC1234567890");
    }

    @Test
    void testGetAccount_NotFound() {
        when(accountRepository.findByAccountNumber("NON_EXISTENT")).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> accountService.getAccount("NON_EXISTENT"));
    }

    @Test
    void testValidateActiveAccount_ThrowsExceptionWhenInactive() {
        sampleAccount.setActive(false);

        assertThrows(AccountInactiveException.class, () -> accountService.validateActiveAccount(sampleAccount));
    }
}

package com.banking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;

    // Explicit Getters to bypass Lombok issues
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
}
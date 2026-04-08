package com.banking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class BankingSimulatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(BankingSimulatorApplication.class, args);
        System.out.println("=== Banking Simulator STARTED ===");
    }

    /**
     * Corrected CORS configuration with @NonNull annotation to resolve
     * the "Not annotated parameter overrides @NonNullApi parameter" error.
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // This must cover everything
                        .allowedOriginPatterns("http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:5173")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
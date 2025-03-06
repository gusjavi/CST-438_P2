package org.tierlist.project02backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/login", "/signup", "/public/**").permitAll() // Allow these routes
                        .requestMatchers("/api/**").authenticated() // Protect API endpoints
                )
                .oauth2Login(oauth2 -> oauth2 // Enable OAuth2 login
                        .defaultSuccessUrl("/api/user", true) //
                );

        return http.build();
    }
}




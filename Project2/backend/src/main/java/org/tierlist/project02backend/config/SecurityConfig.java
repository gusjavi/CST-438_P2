package org.tierlist.project02backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Allow anyone (no authentication) to access your auth endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )


                .csrf(csrf -> csrf.disable())

                // You can enable basic authentication or form login
                .httpBasic(Customizer.withDefaults());


        return http.build();
    }
    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        UserDetails admin = User.withDefaultPasswordEncoder()
                .username("admin")
                .password("admin123")
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(admin);
    }

}

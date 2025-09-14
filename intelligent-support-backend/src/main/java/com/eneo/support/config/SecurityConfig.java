package com.eneo.support.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer; // <-- IMPORT THIS
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration; // <-- IMPORT THIS
import org.springframework.web.cors.CorsConfigurationSource; // <-- IMPORT THIS
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // <-- IMPORT THIS

import java.util.Arrays; // <-- IMPORT THIS

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ✅ ADD THE CORS CONFIGURATION HERE
                .cors(Customizer.withDefaults()) // This will apply the bean below

                // 1. Désactiver la protection CSRF
                .csrf(csrf -> csrf.disable())

                // 2. Définir les règles d'autorisation pour les requêtes
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/chat/**").permitAll()
                        .requestMatchers("/api/v1/admin/**").permitAll()
                        .requestMatchers("/api/v1/agent/**").permitAll()
                        .anyRequest().authenticated()
                )

                // 3. Configurer la gestion de session
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    // ✅ ADD THIS ENTIRE BEAN
    // This bean defines the specific CORS rules
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Spécifiez l'origine de votre application Ionic
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8100"));
        // Spécifiez les méthodes HTTP autorisées
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Spécifiez les en-têtes autorisés
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Applique cette configuration à toutes les routes
        return source;
    }
}
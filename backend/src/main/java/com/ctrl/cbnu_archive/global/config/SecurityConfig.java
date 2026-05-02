package com.ctrl.cbnu_archive.global.config;

import com.ctrl.cbnu_archive.auth.service.TokenBlacklistService;
import com.ctrl.cbnu_archive.global.security.jwt.JwtAccessDeniedHandler;
import com.ctrl.cbnu_archive.global.security.jwt.JwtAuthenticationEntryPoint;
import com.ctrl.cbnu_archive.global.security.jwt.JwtAuthenticationFilter;
import com.ctrl.cbnu_archive.global.security.jwt.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider,
                          TokenBlacklistService tokenBlacklistService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                        .accessDeniedHandler(new JwtAccessDeniedHandler())
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/v1/auth/logout").authenticated()
                        .requestMatchers("/api/v1/auth/signup", "/api/v1/auth/login", "/api/v1/auth/reissue", "/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html", "/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/projects/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/recommend").permitAll()
                        .requestMatchers("/api/v1/files/**").authenticated()
                        .requestMatchers("/api/v1/projects/**").authenticated()
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        http.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, tokenBlacklistService), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}

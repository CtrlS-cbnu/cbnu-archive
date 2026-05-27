package com.ctrl.cbnu_archive.auth.domain;

import com.ctrl.cbnu_archive.global.domain.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Objects;

@Entity
@Table(name = "users")
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String studentNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.PENDING;

    protected User() {
    }

    private User(String email, String password, String name, String studentNumber, UserRole role) {
        this.email = Objects.requireNonNull(email, "email must not be null");
        this.password = Objects.requireNonNull(password, "password must not be null");
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.studentNumber = studentNumber;
        this.role = role == null ? UserRole.USER : role;
        this.status = (this.role == UserRole.ADMIN) ? UserStatus.ACTIVE : UserStatus.PENDING;
    }

    public static User create(String email, String password, String name, String studentNumber) {
        return new User(email, password, name, studentNumber, UserRole.USER);
    }

    public static User create(String email, String password, String name, String studentNumber, UserRole role) {
        return new User(email, password, name, studentNumber, role);
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getName() {
        return name;
    }

    public String getStudentNumber() {
        return studentNumber;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void activate() {
        this.status = UserStatus.ACTIVE;
    }

    public void rejectUser() {
        this.status = UserStatus.REJECTED;
    }

    public void updatePassword(String encodedPassword) {
        this.password = Objects.requireNonNull(encodedPassword, "encodedPassword must not be null");
    }

    public void updateProfile(String name, String studentNumber) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.studentNumber = studentNumber;
    }
}

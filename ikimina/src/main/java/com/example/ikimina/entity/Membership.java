package com.example.ikimina.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "memberships")
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    private boolean isConfirmed;

    private LocalDateTime joinRequestDate;

    private LocalDateTime confirmationDate;

    // Default constructor
    public Membership() {
        this.joinRequestDate = LocalDateTime.now();
        this.isConfirmed = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public boolean isConfirmed() {
        return isConfirmed;
    }

    public void setConfirmed(boolean confirmed) {
        isConfirmed = confirmed;
        if (confirmed) {
            this.confirmationDate = LocalDateTime.now();
        }
    }

    public LocalDateTime getJoinRequestDate() {
        return joinRequestDate;
    }

    public void setJoinRequestDate(LocalDateTime joinRequestDate) {
        this.joinRequestDate = joinRequestDate;
    }

    public LocalDateTime getConfirmationDate() {
        return confirmationDate;
    }

    public void setConfirmationDate(LocalDateTime confirmationDate) {
        this.confirmationDate = confirmationDate;
    }
}
package com.example.ikimina.repository;

import com.example.ikimina.entity.Membership;
import com.example.ikimina.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Find payments by membership
    List<Payment> findByMembership(Membership membership);
    
    // Find confirmed payments by membership
    List<Payment> findByMembershipAndIsConfirmedTrue(Membership membership);
    
    // Find unconfirmed payments by membership
    List<Payment> findByMembershipAndIsConfirmedFalse(Membership membership);
    
    // Find payments by date range
    List<Payment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find rejected payments (those with a rejection reason)
    List<Payment> findByRejectedReasonIsNotNull();
    
    // Find payments by payment code
    Payment findByPaymentCode(String paymentCode);
}
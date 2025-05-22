package com.example.ikimina.service;

import com.example.ikimina.entity.Membership;
import com.example.ikimina.entity.Payment;
import com.example.ikimina.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Create a new payment
     */
    public Payment createPayment(Membership membership, BigDecimal amount, String proofImagePath) {
        // Validate membership is confirmed
        if (!membership.isConfirmed()) {
            throw new IllegalStateException("Cannot create payment for unconfirmed membership");
        }
        
        // Create payment
        Payment payment = new Payment();
        payment.setMembership(membership);
        payment.setAmount(amount);
        payment.setProofImagePath(proofImagePath);
        payment.setPaymentCode(generatePaymentCode());
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // Notify group admin about the new payment
        notificationService.createNotification(
            membership.getGroup().getCreatedByUser(),
            "New payment proof uploaded by " + membership.getUser().getName() + 
            " for group " + membership.getGroup().getGroupName()
        );
        
        return savedPayment;
    }

    /**
     * Generate a unique payment code
     */
    private String generatePaymentCode() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Confirm a payment
     */
    public Payment confirmPayment(Payment payment) {
        if (payment.isConfirmed()) {
            throw new IllegalStateException("Payment is already confirmed");
        }
        
        payment.setConfirmed(true);
        Payment savedPayment = paymentRepository.save(payment);
        
        // Notify user that their payment was confirmed
        notificationService.createNotification(
            payment.getMembership().getUser(),
            "Your payment for group " + payment.getMembership().getGroup().getGroupName() + " has been confirmed"
        );
        
        return savedPayment;
    }

    /**
     * Reject a payment
     */
    public Payment rejectPayment(Payment payment, String rejectedReason) {
        if (payment.isConfirmed()) {
            throw new IllegalStateException("Cannot reject an already confirmed payment");
        }
        
        payment.setRejectedReason(rejectedReason);
        Payment savedPayment = paymentRepository.save(payment);
        
        // Notify user that their payment was rejected
        notificationService.createNotification(
            payment.getMembership().getUser(),
            "Your payment for group " + payment.getMembership().getGroup().getGroupName() + 
            " was rejected. Reason: " + rejectedReason
        );
        
        return savedPayment;
    }

    /**
     * Get payment by ID
     */
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    /**
     * Get payment by payment code
     */
    public Payment getPaymentByCode(String paymentCode) {
        return paymentRepository.findByPaymentCode(paymentCode);
    }

    /**
     * Get all payments for a membership
     */
    public List<Payment> getPaymentsByMembership(Membership membership) {
        return paymentRepository.findByMembership(membership);
    }

    /**
     * Get confirmed payments for a membership
     */
    public List<Payment> getConfirmedPaymentsByMembership(Membership membership) {
        return paymentRepository.findByMembershipAndIsConfirmedTrue(membership);
    }

    /**
     * Get unconfirmed payments for a membership
     */
    public List<Payment> getUnconfirmedPaymentsByMembership(Membership membership) {
        return paymentRepository.findByMembershipAndIsConfirmedFalse(membership);
    }

    /**
     * Get payments by date range
     */
    public List<Payment> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return paymentRepository.findByPaymentDateBetween(startDate, endDate);
    }

    /**
     * Get all rejected payments
     */
    public List<Payment> getRejectedPayments() {
        return paymentRepository.findByRejectedReasonIsNotNull();
    }
}
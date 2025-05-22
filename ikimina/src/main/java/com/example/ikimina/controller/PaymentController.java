package com.example.ikimina.controller;

import com.example.ikimina.entity.Membership;
import com.example.ikimina.entity.Payment;
import com.example.ikimina.service.MembershipService;
import com.example.ikimina.service.PaymentService;
import com.example.ikimina.util.FileUploadUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private MembershipService membershipService;

    // Directory where payment proof images will be stored
    private static final String UPLOAD_DIR = "payment-proofs";

    /**
     * Create a new payment
     */
    @PostMapping
    public ResponseEntity<?> createPayment(
            @RequestParam("membershipId") Long membershipId,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam("paymentDate") String paymentDateStr,
            @RequestParam("proofImage") MultipartFile proofImage) {
        try {
            // Validate request parameters
            if (membershipId == null || amount == null || paymentDateStr == null || proofImage == null) {
                return ResponseEntity.badRequest().body("Membership ID, amount, payment date, and proof image are required");
            }
            
            // Parse payment date
            LocalDateTime paymentDate;
            try {
                // Try to parse as LocalDateTime
                paymentDate = LocalDateTime.parse(paymentDateStr, DateTimeFormatter.ISO_DATE_TIME);
            } catch (DateTimeParseException e) {
                try {
                    // Try to parse as LocalDate and convert to LocalDateTime
                    LocalDate date = LocalDate.parse(paymentDateStr, DateTimeFormatter.ISO_DATE);
                    paymentDate = date.atStartOfDay();
                } catch (DateTimeParseException ex) {
                    return ResponseEntity.badRequest().body("Invalid payment date format. Use ISO format (yyyy-MM-ddTHH:mm:ss or yyyy-MM-dd)");
                }
            }
            
            // Get the membership
            Optional<Membership> membershipOpt = membershipService.getMembershipById(membershipId);
            if (!membershipOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Membership not found with ID: " + membershipId);
            }
            
            Membership membership = membershipOpt.get();
            
            // Check if the membership is confirmed
            if (!membership.isConfirmed()) {
                return ResponseEntity.badRequest().body("Cannot create payment for unconfirmed membership");
            }
            
            // Save the proof image
            String fileName = FileUploadUtil.generateUniqueFileName(proofImage.getOriginalFilename());
            String uploadPath = UPLOAD_DIR + "/" + membership.getGroup().getId() + "/" + membership.getUser().getId();
            FileUploadUtil.saveFile(uploadPath, fileName, proofImage);
            String proofImagePath = uploadPath + "/" + fileName;
            
            // Create the payment
            Payment payment = paymentService.createPayment(membership, amount, proofImagePath);
            
            // Set the payment date
            payment.setPaymentDate(paymentDate);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", payment.getId());
            response.put("membershipId", payment.getMembership().getId());
            response.put("paymentCode", payment.getPaymentCode());
            response.put("amount", payment.getAmount());
            response.put("paymentDate", payment.getPaymentDate());
            response.put("proofImagePath", payment.getProofImagePath());
            response.put("isConfirmed", payment.isConfirmed());
            response.put("message", "Payment created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving proof image: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Confirm a payment
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmPayment(@PathVariable Long id) {
        try {
            Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
            if (!paymentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Payment not found with ID: " + id);
            }
            
            Payment payment = paymentOpt.get();
            
            // Check if the payment is already confirmed
            if (payment.isConfirmed()) {
                return ResponseEntity.badRequest().body("Payment is already confirmed");
            }
            
            // Confirm the payment
            Payment confirmedPayment = paymentService.confirmPayment(payment);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", confirmedPayment.getId());
            response.put("membershipId", confirmedPayment.getMembership().getId());
            response.put("paymentCode", confirmedPayment.getPaymentCode());
            response.put("amount", confirmedPayment.getAmount());
            response.put("paymentDate", confirmedPayment.getPaymentDate());
            response.put("isConfirmed", confirmedPayment.isConfirmed());
            response.put("message", "Payment confirmed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Reject a payment
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectPayment(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String rejectedReason = request.get("rejectedReason");
            
            if (rejectedReason == null || rejectedReason.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Rejected reason is required");
            }
            
            Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
            if (!paymentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Payment not found with ID: " + id);
            }
            
            Payment payment = paymentOpt.get();
            
            // Check if the payment is already confirmed
            if (payment.isConfirmed()) {
                return ResponseEntity.badRequest().body("Cannot reject a confirmed payment");
            }
            
            // Reject the payment
            Payment rejectedPayment = paymentService.rejectPayment(payment, rejectedReason);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", rejectedPayment.getId());
            response.put("membershipId", rejectedPayment.getMembership().getId());
            response.put("paymentCode", rejectedPayment.getPaymentCode());
            response.put("amount", rejectedPayment.getAmount());
            response.put("paymentDate", rejectedPayment.getPaymentDate());
            response.put("isConfirmed", rejectedPayment.isConfirmed());
            response.put("rejectedReason", rejectedPayment.getRejectedReason());
            response.put("message", "Payment rejected successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get payment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        try {
            Optional<Payment> paymentOpt = paymentService.getPaymentById(id);
            
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                return ResponseEntity.ok(payment);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Payment not found with ID: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get payment by code
     */
    @GetMapping("/code/{paymentCode}")
    public ResponseEntity<?> getPaymentByCode(@PathVariable String paymentCode) {
        try {
            Payment payment = paymentService.getPaymentByCode(paymentCode);
            
            if (payment != null) {
                return ResponseEntity.ok(payment);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Payment not found with code: " + paymentCode);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get payments by membership
     */
    @GetMapping("/membership/{membershipId}")
    public ResponseEntity<?> getPaymentsByMembership(@PathVariable Long membershipId) {
        try {
            Optional<Membership> membershipOpt = membershipService.getMembershipById(membershipId);
            if (!membershipOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Membership not found with ID: " + membershipId);
            }
            
            List<Payment> payments = paymentService.getPaymentsByMembership(membershipOpt.get());
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get confirmed payments by membership
     */
    @GetMapping("/membership/{membershipId}/confirmed")
    public ResponseEntity<?> getConfirmedPaymentsByMembership(@PathVariable Long membershipId) {
        try {
            Optional<Membership> membershipOpt = membershipService.getMembershipById(membershipId);
            if (!membershipOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Membership not found with ID: " + membershipId);
            }
            
            List<Payment> payments = paymentService.getConfirmedPaymentsByMembership(membershipOpt.get());
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    /**
     * Get unconfirmed payments by membership
     */
    @GetMapping("/membership/{membershipId}/unconfirmed")
    public ResponseEntity<?> getUnconfirmedPaymentsByMembership(@PathVariable Long membershipId) {
        try {
            Optional<Membership> membershipOpt = membershipService.getMembershipById(membershipId);
            if (!membershipOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Membership not found with ID: " + membershipId);
            }
            
            List<Payment> payments = paymentService.getUnconfirmedPaymentsByMembership(membershipOpt.get());
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }
}
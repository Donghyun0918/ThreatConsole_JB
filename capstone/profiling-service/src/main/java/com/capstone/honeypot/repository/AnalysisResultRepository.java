package com.capstone.honeypot.repository;

import com.capstone.honeypot.domain.AnalysisResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {

    Optional<AnalysisResult> findByAttackLogId(Long attackLogId);
}
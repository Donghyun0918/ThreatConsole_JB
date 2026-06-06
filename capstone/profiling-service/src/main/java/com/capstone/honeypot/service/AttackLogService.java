package com.capstone.honeypot.service;

import com.capstone.honeypot.domain.AnalysisResult;
import com.capstone.honeypot.domain.AttackLog;
import com.capstone.honeypot.domain.Project;
import com.capstone.honeypot.dto.AttackLogRequest;
import com.capstone.honeypot.dto.AttackLogResponse;
import com.capstone.honeypot.dto.AttackLogWithAnalysisResponse;
import com.capstone.honeypot.repository.AnalysisResultRepository;
import com.capstone.honeypot.repository.AttackLogRepository;
import com.capstone.honeypot.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AttackLogService {

    private final AttackLogRepository attackLogRepository;
    private final ProjectRepository projectRepository;
    private final AnalysisService analysisService;
    private final AnalysisResultRepository analysisResultRepository;

    public AttackLogResponse save(AttackLogRequest request) {

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("프로젝트가 없습니다. id=" + request.getProjectId()));

        AttackLog log = new AttackLog();
        log.setAttackType(request.getAttackType());
        log.setPayload(request.getPayload());
        log.setIpAddress(request.getIpAddress());
        log.setCreatedAt(LocalDateTime.now());
        log.setProject(project);

        AttackLog savedLog = attackLogRepository.save(log);

        Map<String, Object> result = analysisService.analyze(
                savedLog.getAttackType(),
                savedLog.getPayload(),
                savedLog.getIpAddress()
        );

        AnalysisResult analysisResult = new AnalysisResult();
        analysisResult.setAttackLog(savedLog);
        analysisResult.setRiskScore((Integer) result.get("riskScore"));
        analysisResult.setSeverity((String) result.get("severity"));
        analysisResult.setSummary((String) result.get("summary"));
        analysisResult.setSolution((String) result.get("solution"));

        analysisResultRepository.save(analysisResult);

        return new AttackLogResponse(savedLog);
    }

    public List<AttackLogResponse> findByProject(Long projectId) {
        return attackLogRepository.findByProjectId(projectId)
                .stream()
                .map(AttackLogResponse::new)
                .toList();
    }

    public List<AttackLogWithAnalysisResponse> findLogsWithAnalysisByProject(Long projectId) {
        return attackLogRepository.findByProjectId(projectId)
                .stream()
                .map(log -> {
                    AnalysisResult analysisResult = analysisResultRepository.findByAttackLogId(log.getId())
                            .orElse(null);
                    return new AttackLogWithAnalysisResponse(log, analysisResult);
                })
                .toList();
    }
}
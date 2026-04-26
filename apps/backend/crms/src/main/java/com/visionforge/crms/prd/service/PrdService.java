package com.visionforge.crms.prd.service;

import com.visionforge.crms.changerequest.service.ChangeRequestService;
import com.visionforge.crms.email.EmailService;
import com.visionforge.crms.notification.model.NotificationType;
import com.visionforge.crms.notification.service.NotificationService;
import com.visionforge.crms.prd.dto.CreatePrdRequest;
import com.visionforge.crms.prd.dto.PrdResponse;
import com.visionforge.crms.prd.dto.UpdatePrdRequest;
import com.visionforge.crms.prd.model.Prd;
import com.visionforge.crms.prd.repository.PrdRepository;
import com.visionforge.crms.project.model.Project;
import com.visionforge.crms.project.repository.ProjectRepository;
import com.visionforge.crms.user.User;
import com.visionforge.crms.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PrdService {

    private static final Pattern PID_TRAILING_NUMBER = Pattern.compile("(\\d+)$");

    private final PrdRepository prdRepository;
    private final ChangeRequestService changeRequestService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<PrdResponse> getAllPrds() {
        return prdRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PrdResponse getPrdById(String id) {
        return toResponse(findPrd(id));
    }

    public PrdResponse createPrd(CreatePrdRequest request) {
        Prd prd = Prd.builder()
                .projectId(request.getProjectId())
                .pid(nextPid())
                .title(request.getProjectName())
                .status("In Review")
                .version("1.0")
                .createdDate(request.getDateSubmitted())
                .reviewedByChecker(false)
                .sentToClient(false)
                .projectName(request.getProjectName())
                .author(request.getAuthor())
                .dateSubmitted(request.getDateSubmitted())
                .reviewerName(null)
                .purpose(request.getPurpose())
                .problemToSolve(request.getProblemToSolve())
                .projectGoal(request.getProjectGoal())
                .stakeholders(toStakeholders(request.getStakeholders()))
                .inScope(request.getInScope())
                .outOfScope(request.getOutOfScope())
                .mainFeatures(request.getMainFeatures())
                .functionalRequirement(request.getFunctionalRequirement())
                .nonFunctionalRequirement(request.getNonFunctionalRequirement())
                .userRoles(request.getUserRoles())
                .risksDependencies(request.getRisksDependencies())
                .milestones(toMilestones(request.getMilestones()))
                .createdAt(Instant.now())
                .build();

        Prd savedPrd = prdRepository.save(prd);

        changeRequestService.markLatestAcceptedAsImplementedForPrdUpdate(
                savedPrd.getProjectId(),
                savedPrd.getId(),
                savedPrd.getVersion()
        );

        notifyClientPrdUploaded(savedPrd);

        return toResponse(savedPrd);
    }

    public PrdResponse updatePrd(String id, UpdatePrdRequest request) {
        Prd prd = findPrd(id);

        if (request.getProjectName() != null) {
            prd.setProjectName(request.getProjectName());
            prd.setTitle(request.getProjectName());
        }
        if (request.getAuthor() != null) {
            prd.setAuthor(request.getAuthor());
        }
        if (request.getDateSubmitted() != null) {
            prd.setDateSubmitted(request.getDateSubmitted());
            prd.setCreatedDate(request.getDateSubmitted());
        }
        if (request.getReviewerName() != null) {
            prd.setReviewerName(request.getReviewerName());
        }
        if (request.getPurpose() != null) {
            prd.setPurpose(request.getPurpose());
        }
        if (request.getProblemToSolve() != null) {
            prd.setProblemToSolve(request.getProblemToSolve());
        }
        if (request.getProjectGoal() != null) {
            prd.setProjectGoal(request.getProjectGoal());
        }
        if (request.getStakeholders() != null) {
            prd.setStakeholders(toStakeholders(request.getStakeholders()));
        }
        if (request.getInScope() != null) {
            prd.setInScope(request.getInScope());
        }
        if (request.getOutOfScope() != null) {
            prd.setOutOfScope(request.getOutOfScope());
        }
        if (request.getMainFeatures() != null) {
            prd.setMainFeatures(request.getMainFeatures());
        }
        if (request.getFunctionalRequirement() != null) {
            prd.setFunctionalRequirement(request.getFunctionalRequirement());
        }
        if (request.getNonFunctionalRequirement() != null) {
            prd.setNonFunctionalRequirement(request.getNonFunctionalRequirement());
        }
        if (request.getUserRoles() != null) {
            prd.setUserRoles(request.getUserRoles());
        }
        if (request.getRisksDependencies() != null) {
            prd.setRisksDependencies(request.getRisksDependencies());
        }
        if (request.getMilestones() != null) {
            prd.setMilestones(toMilestones(request.getMilestones()));
        }

        String action = request.getAction() == null ? "SAVE_CHANGES" : request.getAction().trim().toUpperCase();
        switch (action) {
            case "SAVE_DRAFT" -> {
                prd.setStatus("Drafted");
                prd.setReviewedByChecker(false);
                prd.setSentToClient(false);
            }
            case "APPROVE" -> {
                prd.setStatus("Approved");
                prd.setReviewedByChecker(true);
                prd.setSentToClient(true);
                prd.setVersion(incrementVersion(prd.getVersion()));
            }
            case "REJECTED" -> {
                prd.setStatus("Rejected");
                prd.setReviewedByChecker(false);
                prd.setSentToClient(false);
            }
            default -> {
                prd.setStatus("In Review");
                prd.setReviewedByChecker(false);
                prd.setSentToClient(false);
            }
        }

        Prd savedPrd = prdRepository.save(prd);

        // Optional: when PRD is approved / updated, notify client again
        if ("APPROVE".equals(action) || "SAVE_CHANGES".equals(action)) {
            notifyClientPrdUploaded(savedPrd);
        }

        return toResponse(savedPrd);
    }

    private void notifyClientPrdUploaded(Prd prd) {
        try {
            Project project = projectRepository.findById(prd.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            String clientId = project.getClientId();

            notificationService.createNotification(
                    clientId,
                    "New PRD Uploaded",
                    "A new PRD has been uploaded for your project.",
                    NotificationType.PRD_UPLOADED,
                    prd.getId(),
                    "PRD"
            );

            User client = userRepository.findById(clientId)
                    .orElseThrow(() -> new RuntimeException("Client not found"));

            emailService.sendEmail(
                    client.getEmail(),
                    "New PRD Uploaded",
                    "A new PRD is available for your project. Please log in to view it."
            );
        } catch (Exception e) {
            System.err.println("Failed to send PRD notification/email: " + e.getMessage());
        }
    }

    private Prd findPrd(String id) {
        return prdRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PRD not found"));
    }

    private String incrementVersion(String currentVersion) {
        if (currentVersion == null || currentVersion.isBlank()) {
            return "1.1";
        }

        String[] parts = currentVersion.split("\\.");
        int major;
        int minor = 0;

        try {
            major = Integer.parseInt(parts[0]);
            if (parts.length > 1) {
                minor = Integer.parseInt(parts[1]);
            }
        } catch (NumberFormatException ignored) {
            return "1.1";
        }

        minor += 1;
        return major + "." + minor;
    }

    private List<Prd.Stakeholder> toStakeholders(List<CreatePrdRequest.StakeholderDto> items) {
        if (items == null) {
            return Collections.emptyList();
        }

        return items.stream()
                .map(item -> new Prd.Stakeholder(item.getRole(), item.getName(), item.getResponsibility()))
                .toList();
    }

    private List<Prd.Milestone> toMilestones(List<CreatePrdRequest.MilestoneDto> items) {
        if (items == null) {
            return Collections.emptyList();
        }

        return items.stream()
                .map(item -> new Prd.Milestone(item.getPhase(), item.getTask(), item.getDuration(), item.getResponsibility()))
                .toList();
    }

    private PrdResponse toResponse(Prd prd) {
        return PrdResponse.builder()
                .id(prd.getId())
                .projectId(prd.getProjectId())
                .pid(prd.getPid())
                .title(prd.getTitle())
                .status(prd.getStatus())
                .version(prd.getVersion())
                .createdDate(prd.getCreatedDate())
                .reviewedByChecker(prd.isReviewedByChecker())
                .sentToClient(prd.isSentToClient())
                .projectName(prd.getProjectName())
                .author(prd.getAuthor())
                .dateSubmitted(prd.getDateSubmitted())
                .reviewerName(prd.getReviewerName())
                .purpose(prd.getPurpose())
                .problemToSolve(prd.getProblemToSolve())
                .projectGoal(prd.getProjectGoal())
                .stakeholders(prd.getStakeholders().stream()
                        .map(item -> PrdResponse.StakeholderDto.builder()
                                .role(item.getRole())
                                .name(item.getName())
                                .responsibility(item.getResponsibility())
                                .build())
                        .toList())
                .inScope(prd.getInScope())
                .outOfScope(prd.getOutOfScope())
                .mainFeatures(prd.getMainFeatures())
                .functionalRequirement(prd.getFunctionalRequirement())
                .nonFunctionalRequirement(prd.getNonFunctionalRequirement())
                .userRoles(prd.getUserRoles())
                .risksDependencies(prd.getRisksDependencies())
                .milestones(prd.getMilestones().stream()
                        .map(item -> PrdResponse.MilestoneDto.builder()
                                .phase(item.getPhase())
                                .task(item.getTask())
                                .duration(item.getDuration())
                                .responsibility(item.getResponsibility())
                                .build())
                        .toList())
                .build();
    }

    private String nextPid() {
        return prdRepository.findTopByOrderByCreatedAtDesc()
                .map(Prd::getPid)
                .map(this::extractTrailingNumber)
                .map(number -> String.format("PRD-%03d", number + 1))
                .orElse("PRD-001");
    }

    private int extractTrailingNumber(String pid) {
        if (pid == null) {
            return 0;
        }

        Matcher matcher = PID_TRAILING_NUMBER.matcher(pid.trim());
        if (!matcher.find()) {
            return 0;
        }

        try {
            return Integer.parseInt(matcher.group(1));
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    public PrdResponse getPrdByProjectId(String projectId) {
        return prdRepository.findByProjectId(projectId)
                .map(this::toResponse)
                .orElse(null);
    }

    public byte[] generatePrdDocument(String prdId) {
        Prd prd = findPrd(prdId);

        StringBuilder content = new StringBuilder();
        content.append("================================================================================\n");
        content.append("PRODUCT REQUIREMENTS DOCUMENT (PRD)\n");
        content.append("================================================================================\n\n");

        content.append("PROJECT INFORMATION\n");
        content.append("-------------------\n");
        content.append("Project Name: ").append(nvl(prd.getProjectName())).append("\n");
        content.append("Project ID: ").append(nvl(prd.getProjectId())).append("\n");
        content.append("Title: ").append(nvl(prd.getTitle())).append("\n");
        content.append("Version: ").append(nvl(prd.getVersion())).append("\n");
        content.append("Status: ").append(nvl(prd.getStatus())).append("\n");
        content.append("Author: ").append(nvl(prd.getAuthor())).append("\n");
        content.append("Date Submitted: ").append(nvl(prd.getDateSubmitted())).append("\n");
        content.append("Reviewer: ").append(nvl(prd.getReviewerName())).append("\n\n");

        content.append("PURPOSE & GOALS\n");
        content.append("---------------\n");
        content.append("Purpose: ").append(nvl(prd.getPurpose())).append("\n");
        content.append("Problem to Solve: ").append(nvl(prd.getProblemToSolve())).append("\n");
        content.append("Project Goal: ").append(nvl(prd.getProjectGoal())).append("\n\n");

        if (prd.getStakeholders() != null && !prd.getStakeholders().isEmpty()) {
            content.append("STAKEHOLDERS\n");
            content.append("------------\n");
            for (Prd.Stakeholder stakeholder : prd.getStakeholders()) {
                content.append("Role: ").append(nvl(stakeholder.getRole())).append("\n");
                content.append("Name: ").append(nvl(stakeholder.getName())).append("\n");
                content.append("Responsibility: ").append(nvl(stakeholder.getResponsibility())).append("\n");
                content.append("\n");
            }
        }

        content.append("SCOPE\n");
        content.append("-----\n");
        content.append("In Scope:\n").append(nvl(prd.getInScope())).append("\n\n");
        content.append("Out of Scope:\n").append(nvl(prd.getOutOfScope())).append("\n\n");

        content.append("FEATURES & REQUIREMENTS\n");
        content.append("----------------------\n");
        content.append("Main Features:\n").append(nvl(prd.getMainFeatures())).append("\n\n");
        content.append("Functional Requirements:\n").append(nvl(prd.getFunctionalRequirement())).append("\n\n");
        content.append("Non-Functional Requirements:\n").append(nvl(prd.getNonFunctionalRequirement())).append("\n\n");

        content.append("USER ROLES & RISKS\n");
        content.append("------------------\n");
        content.append("User Roles:\n").append(nvl(prd.getUserRoles())).append("\n\n");
        content.append("Risks & Dependencies:\n").append(nvl(prd.getRisksDependencies())).append("\n\n");

        if (prd.getMilestones() != null && !prd.getMilestones().isEmpty()) {
            content.append("MILESTONES\n");
            content.append("----------\n");
            for (Prd.Milestone milestone : prd.getMilestones()) {
                content.append("Phase: ").append(nvl(milestone.getPhase())).append("\n");
                content.append("Task: ").append(nvl(milestone.getTask())).append("\n");
                content.append("Duration: ").append(nvl(milestone.getDuration())).append("\n");
                content.append("Responsibility: ").append(nvl(milestone.getResponsibility())).append("\n");
                content.append("\n");
            }
        }

        content.append("================================================================================\n");
        content.append("Document Generated: ").append(java.time.Instant.now()).append("\n");
        content.append("================================================================================\n");

        return content.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String nvl(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
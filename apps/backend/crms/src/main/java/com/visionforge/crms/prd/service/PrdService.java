package com.visionforge.crms.prd.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.borders.Border;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

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

@Service
@RequiredArgsConstructor
public class PrdService {

    private static final Logger log = LoggerFactory.getLogger(PrdService.class);
    private static final Pattern PID_TRAILING_NUMBER = Pattern.compile("(\\d+)$");

    private final PrdRepository prdRepository;
    private final ChangeRequestService changeRequestService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<PrdResponse> getAllPrds() {
        // 🔥 Cleanup any empty PRDs before returning the list
        cleanupEmptyPrds();
        
        return prdRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PrdResponse getPrdById(String id) {
        return toResponse(findPrd(id));
    }

    public PrdResponse getPrdByProjectId(String projectId) {
        return prdRepository.findByProjectId(projectId)
                .map(this::toResponse)
                .orElse(null);
    }

    // Delete empty/incomplete PRDs (cleanup existing ones)
    public void deleteEmptyPrd(String prdId) {
        Prd prd = findPrd(prdId);
        if (isPrdEmpty(prd)) {
            prdRepository.deleteById(prdId);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete: PRD contains data");
        }
    }

    // Clean up ALL empty PRDs from database
    public int cleanupEmptyPrds() {
        List<Prd> allPrds = prdRepository.findAll();
        int deletedCount = 0;
        
        for (Prd prd : allPrds) {
            if (isPrdEmpty(prd)) {
                prdRepository.deleteById(prd.getId());
                deletedCount++;
            }
        }
        
        return deletedCount;
    }

    // Check if PRD is empty (minimal/placeholder data)
    private boolean isPrdEmpty(Prd prd) {
        if (prd == null) return true;
        return isBlank(prd.getAuthor()) ||
                isBlank(prd.getPurpose()) ||
                isBlank(prd.getProblemToSolve()) ||
                isBlank(prd.getProjectGoal()) ||
                (prd.getStakeholders() == null || prd.getStakeholders().isEmpty()) ||
                (prd.getMilestones() == null || prd.getMilestones().isEmpty());
    }

    public PrdResponse createPrd(CreatePrdRequest request) {
        validateCreateRequest(request);

        if (request.getProjectId() == null || request.getProjectId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project ID is required");
        }

        if (prdRepository.existsByProjectId(request.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A PRD already exists for this project");
        }

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

        try {
            changeRequestService.markLatestAcceptedAsImplementedForPrdUpdate(
                    savedPrd.getProjectId(),
                    savedPrd.getId(),
                    savedPrd.getVersion()
            );
        } catch (Exception e) {
            System.err.println("Failed to update change request after PRD create: " + e.getMessage());
        }

        notifyClientPrdUploaded(savedPrd);

        return toResponse(savedPrd);
    }

    private void validateCreateRequest(CreatePrdRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PRD request is required");
        }

        if (isBlank(request.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project ID is required");
        }
        if (isBlank(request.getProjectName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project name is required");
        }
        if (isBlank(request.getAuthor())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Author is required");
        }
        if (isBlank(request.getDateSubmitted())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date submitted is required");
        }
        if (isBlank(request.getPurpose())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Purpose is required");
        }
        if (isBlank(request.getProblemToSolve())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Problem to solve is required");
        }
        if (isBlank(request.getProjectGoal())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project goal is required");
        }
        if (isBlank(request.getInScope())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "In scope is required");
        }
        if (isBlank(request.getOutOfScope())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Out of scope is required");
        }
        if (isBlank(request.getMainFeatures())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Main features are required");
        }
        if (isBlank(request.getFunctionalRequirement())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Functional requirement is required");
        }
        if (isBlank(request.getNonFunctionalRequirement())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Non-functional requirement is required");
        }
        if (isBlank(request.getUserRoles())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User roles are required");
        }
        if (isBlank(request.getRisksDependencies())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Risks and dependencies are required");
        }

        if (request.getStakeholders() == null || request.getStakeholders().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one stakeholder is required");
        }
        if (request.getMilestones() == null || request.getMilestones().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one milestone is required");
        }

        request.getStakeholders().forEach(item -> {
            if (item == null || isBlank(item.getRole()) || isBlank(item.getName()) || isBlank(item.getResponsibility())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each stakeholder requires role, name, and responsibility");
            }
        });

        request.getMilestones().forEach(item -> {
            if (item == null || isBlank(item.getPhase()) || isBlank(item.getTask()) || isBlank(item.getDuration()) || isBlank(item.getResponsibility())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each milestone requires phase, task, duration, and responsibility");
            }
        });
    }

    public PrdResponse updatePrd(String id, UpdatePrdRequest request) {
        Prd prd = findPrd(id);
        String currentVersion = prd.getVersion();
        String requestedVersion = normalizeVersion(request.getVersion());
        boolean hasManualVersion = requestedVersion != null && !requestedVersion.equals(currentVersion);

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

        String action = request.getAction() == null
                ? "SAVE_CHANGES"
                : request.getAction().trim().toUpperCase();

        switch (action) {
            case "SAVE_DRAFT" -> {
                prd.setStatus("Drafted");
                prd.setReviewedByChecker(false);
                prd.setSentToClient(false);
                if (requestedVersion != null) {
                    prd.setVersion(requestedVersion);
                }
            }
            case "APPROVE" -> {
                prd.setStatus("Approved");
                prd.setReviewedByChecker(true);
                prd.setSentToClient(true);
                prd.setVersion(hasManualVersion ? requestedVersion : incrementVersion(currentVersion));
            }
            case "REJECTED", "REJECT" -> {
                prd.setStatus("Rejected");
                prd.setReviewedByChecker(false);
                prd.setSentToClient(false);
                if (requestedVersion != null) {
                    prd.setVersion(requestedVersion);
                }
            }
            default -> {
                prd.setStatus("In Review");
                prd.setReviewedByChecker(false);
                prd.setSentToClient(false);
                prd.setVersion(hasManualVersion ? requestedVersion : incrementVersion(currentVersion));
            }
        }

        Prd savedPrd = prdRepository.save(prd);

        if ("APPROVE".equals(action) || "SAVE_CHANGES".equals(action)) {
            notifyClientPrdUploaded(savedPrd);
        }

        return toResponse(savedPrd);
    }

    public byte[] generatePrdDocument(String prdId) {
        log.info("Starting PDF generation for PRD ID: {}", prdId);
        Prd prd = findPrd(prdId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            log.debug("Creating PdfWriter and PdfDocument");
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            log.debug("Creating fonts");
            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normal = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // Title
            log.debug("Adding title");
            Paragraph title = new Paragraph("PRODUCT REQUIREMENTS DOCUMENT (PRD)")
                    .setFont(bold)
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20);
            document.add(title);

            document.add(new LineSeparator(new SolidLine()));

            // Project Information
            log.debug("Adding project information");
            document.add(new Paragraph("PROJECT INFORMATION")
                    .setFont(bold)
                    .setFontSize(14)
                    .setMarginTop(20));

            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);

            addTableRow(infoTable, "PRD ID:", nvl(prd.getPid()), bold, normal);
            addTableRow(infoTable, "Project Name:", nvl(prd.getProjectName()), bold, normal);
            addTableRow(infoTable, "Project ID:", nvl(prd.getProjectId()), bold, normal);
            addTableRow(infoTable, "Title:", nvl(prd.getTitle()), bold, normal);
            addTableRow(infoTable, "Version:", nvl(prd.getVersion()), bold, normal);
            addTableRow(infoTable, "Status:", nvl(prd.getStatus()), bold, normal);
            addTableRow(infoTable, "Author:", nvl(prd.getAuthor()), bold, normal);
            addTableRow(infoTable, "Date Submitted:", nvl(prd.getDateSubmitted()), bold, normal);
            addTableRow(infoTable, "Reviewer:", nvl(prd.getReviewerName()), bold, normal);
            document.add(infoTable);

            // Purpose & Goals
            log.debug("Adding purpose and goals");
            document.add(new Paragraph("PURPOSE & GOALS")
                    .setFont(bold)
                    .setFontSize(14));
            document.add(new Paragraph("Purpose:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getPurpose())).setFont(normal).setMarginBottom(10));
            document.add(new Paragraph("Problem to Solve:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getProblemToSolve())).setFont(normal).setMarginBottom(10));
            document.add(new Paragraph("Project Goal:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getProjectGoal())).setFont(normal).setMarginBottom(20));

            // Stakeholders
            log.debug("Adding stakeholders");
            document.add(new Paragraph("STAKEHOLDERS")
                    .setFont(bold)
                    .setFontSize(14));
            if (prd.getStakeholders() == null || prd.getStakeholders().isEmpty()) {
                document.add(new Paragraph("-").setFont(normal).setMarginBottom(20));
            } else {
                Table stTable = new Table(UnitValue.createPercentArray(new float[]{30, 30, 40}))
                        .useAllAvailableWidth()
                        .setMarginBottom(20);
                stTable.addHeaderCell(new Cell().add(new Paragraph("Role").setFont(bold)));
                stTable.addHeaderCell(new Cell().add(new Paragraph("Name").setFont(bold)));
                stTable.addHeaderCell(new Cell().add(new Paragraph("Responsibility").setFont(bold)));

                for (Prd.Stakeholder stakeholder : prd.getStakeholders()) {
                    if (stakeholder == null) continue;
                    stTable.addCell(new Cell().add(new Paragraph(nvl(stakeholder.getRole())).setFont(normal)));
                    stTable.addCell(new Cell().add(new Paragraph(nvl(stakeholder.getName())).setFont(normal)));
                    stTable.addCell(new Cell().add(new Paragraph(nvl(stakeholder.getResponsibility())).setFont(normal)));
                }
                document.add(stTable);
            }

            // Scope
            log.debug("Adding scope");
            document.add(new Paragraph("SCOPE")
                    .setFont(bold)
                    .setFontSize(14));
            document.add(new Paragraph("In Scope:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getInScope())).setFont(normal).setMarginBottom(10));
            document.add(new Paragraph("Out of Scope:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getOutOfScope())).setFont(normal).setMarginBottom(20));

            // Features & Requirements
            log.debug("Adding features and requirements");
            document.add(new Paragraph("FEATURES & REQUIREMENTS")
                    .setFont(bold)
                    .setFontSize(14));
            document.add(new Paragraph("Main Features:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getMainFeatures())).setFont(normal).setMarginBottom(10));
            document.add(new Paragraph("Functional Requirements:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getFunctionalRequirement())).setFont(normal).setMarginBottom(10));
            document.add(new Paragraph("Non-Functional Requirements:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getNonFunctionalRequirement())).setFont(normal).setMarginBottom(20));

            // User Roles & Risks
            log.debug("Adding user roles and risks");
            document.add(new Paragraph("USER ROLES & RISKS")
                    .setFont(bold)
                    .setFontSize(14));
            document.add(new Paragraph("User Roles:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getUserRoles())).setFont(normal).setMarginBottom(10));
            document.add(new Paragraph("Risks & Dependencies:").setFont(bold));
            document.add(new Paragraph(nvl(prd.getRisksDependencies())).setFont(normal).setMarginBottom(20));

            // Milestones
            log.debug("Adding milestones");
            document.add(new Paragraph("MILESTONES")
                    .setFont(bold)
                    .setFontSize(14));
            if (prd.getMilestones() == null || prd.getMilestones().isEmpty()) {
                document.add(new Paragraph("-").setFont(normal).setMarginBottom(20));
            } else {
                Table msTable = new Table(UnitValue.createPercentArray(new float[]{20, 40, 20, 20}))
                        .useAllAvailableWidth()
                        .setMarginBottom(20);
                msTable.addHeaderCell(new Cell().add(new Paragraph("Phase").setFont(bold)));
                msTable.addHeaderCell(new Cell().add(new Paragraph("Task").setFont(bold)));
                msTable.addHeaderCell(new Cell().add(new Paragraph("Duration").setFont(bold)));
                msTable.addHeaderCell(new Cell().add(new Paragraph("Resp.").setFont(bold)));

                for (Prd.Milestone milestone : prd.getMilestones()) {
                    if (milestone == null) continue;
                    msTable.addCell(new Cell().add(new Paragraph(nvl(milestone.getPhase())).setFont(normal)));
                    msTable.addCell(new Cell().add(new Paragraph(nvl(milestone.getTask())).setFont(normal)));
                    msTable.addCell(new Cell().add(new Paragraph(nvl(milestone.getDuration())).setFont(normal)));
                    msTable.addCell(new Cell().add(new Paragraph(nvl(milestone.getResponsibility())).setFont(normal)));
                }
                document.add(msTable);
            }

            document.add(new LineSeparator(new SolidLine()));
            document.add(new Paragraph("Document Generated: " + Instant.now())
                    .setFont(normal)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginTop(10));

            log.debug("Closing document");
            document.close();
            log.info("PDF generation completed successfully for PRD ID: {}", prdId);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF for PRD ID: {}. Error: {}", prdId, e.getMessage(), e);
            if (e instanceof ResponseStatusException) throw (ResponseStatusException) e;
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate PDF document: " + e.getMessage());
        }
    }

    private void addTableRow(Table table, String label, String value, PdfFont labelFont, PdfFont valueFont) {
        table.addCell(new Cell().add(new Paragraph(label).setFont(labelFont)).setBorder(Border.NO_BORDER));
        table.addCell(new Cell().add(new Paragraph(value).setFont(valueFont)).setBorder(Border.NO_BORDER));
    }

    private Prd findPrd(String id) {
        return prdRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "PRD not found"));
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

    private PrdResponse toResponse(Prd prd) {
        List<PrdResponse.StakeholderDto> stakeholders =
                prd.getStakeholders() == null
                        ? Collections.emptyList()
                        : prd.getStakeholders().stream()
                        .map(item -> PrdResponse.StakeholderDto.builder()
                                .role(item.getRole())
                                .name(item.getName())
                                .responsibility(item.getResponsibility())
                                .build())
                        .toList();

        List<PrdResponse.MilestoneDto> milestones =
                prd.getMilestones() == null
                        ? Collections.emptyList()
                        : prd.getMilestones().stream()
                        .map(item -> PrdResponse.MilestoneDto.builder()
                                .phase(item.getPhase())
                                .task(item.getTask())
                                .duration(item.getDuration())
                                .responsibility(item.getResponsibility())
                                .build())
                        .toList();

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
                .stakeholders(stakeholders)
                .inScope(prd.getInScope())
                .outOfScope(prd.getOutOfScope())
                .mainFeatures(prd.getMainFeatures())
                .functionalRequirement(prd.getFunctionalRequirement())
                .nonFunctionalRequirement(prd.getNonFunctionalRequirement())
                .userRoles(prd.getUserRoles())
                .risksDependencies(prd.getRisksDependencies())
                .milestones(milestones)
                .build();
    }

    private List<Prd.Stakeholder> toStakeholders(List<CreatePrdRequest.StakeholderDto> items) {
        if (items == null) {
            return Collections.emptyList();
        }

        return items.stream()
                .map(item -> new Prd.Stakeholder(
                        item.getRole(),
                        item.getName(),
                        item.getResponsibility()
                ))
                .toList();
    }

    private List<Prd.Milestone> toMilestones(List<CreatePrdRequest.MilestoneDto> items) {
        if (items == null) {
            return Collections.emptyList();
        }

        return items.stream()
                .map(item -> new Prd.Milestone(
                        item.getPhase(),
                        item.getTask(),
                        item.getDuration(),
                        item.getResponsibility()
                ))
                .toList();
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

    private String normalizeVersion(String version) {
        if (version == null || version.isBlank()) {
            return null;
        }

        return version.trim();
    }

    private String nvl(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

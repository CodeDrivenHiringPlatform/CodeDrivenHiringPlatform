package com.codehire.document;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    private String id;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    @Field("user_id")
    private Long userId; // MySQL User ID reference

    private String bio;

    private String objective;

    private List<Skill> skills;

    private List<Education> education;

    private List<Experience> experience;

    private List<Project> projects;

    private List<Certificate> certificates;

    private Map<String, String> links;

    @Field("resume_url")
    private String resumeUrl;

    @Field("profile_completed")
    private Boolean profileCompleted;

    // --- Embedded Documents ---

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Skill {
        private String name;
        private String level;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Education {
        private String institution;
        private String degree;

        @Field("field_of_study")
        private String fieldOfStudy;

        @Field("start_year")
        private Integer startYear;

        @Field("end_year")
        private Integer endYear;

        private String grade; // ADDED: Matches React grade/CGPA field
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Experience {
        private String company;
        private String role;
        private String description;
        private String location;

        // CHANGED: Use String for flexible frontend dates (e.g. "2023-01", "Present")
        @Field("start_date")
        private String startDate;

        @Field("end_date")
        private String endDate;

        private Boolean current;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Project {
        private String title;
        private String description;

        @Field("tech_stack")
        private List<String> techStack;

        private String link;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Certificate {
        private String name;
        private String issuer;

        @Field("issue_date")
        private String issueDate;

        private String link;
    }
}
package com.ctrl.cbnu_archive.project.domain;

import com.ctrl.cbnu_archive.auth.domain.User;
import com.ctrl.cbnu_archive.global.domain.BaseTimeEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "projects")
public class Project extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    private String summary;

    @Lob
    private String description;

    @Lob
    private String readme;

    @ElementCollection
    @CollectionTable(name = "project_tech_stack", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "tech_stack")
    private List<String> techStacks = new ArrayList<>();

    @Column(name = "project_year")
    private Integer year;
    private String semester;
    private String difficulty;
    private String domain;
    @Column(name = "is_team")
    private Boolean isTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    protected Project() {
        // JPA requires a default constructor
    }

    private Project(String title,
                    String summary,
                    String description,
                    String readme,
                    List<String> techStacks,
                    Integer year,
                    String semester,
                    String difficulty,
                    String domain,
                    Boolean isTeam,
                    User author) {
        this.title = Objects.requireNonNull(title, "title must not be null");
        this.summary = summary;
        this.description = description;
        this.readme = readme;
        if (techStacks != null) {
            this.techStacks = new ArrayList<>(techStacks);
        }
        this.year = year;
        this.semester = semester;
        this.difficulty = difficulty;
        this.domain = domain;
        this.isTeam = isTeam;
        this.author = Objects.requireNonNull(author, "author must not be null");
    }

    public static Project create(String title,
                                 String summary,
                                 String description,
                                 String readme,
                                 List<String> techStacks,
                                 Integer year,
                                 String semester,
                                 String difficulty,
                                 String domain,
                                 Boolean isTeam,
                                 User author) {
        return new Project(title, summary, description, readme, techStacks, year, semester, difficulty, domain, isTeam, author);
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getDescription() {
        return description;
    }

    public String getReadme() {
        return readme;
    }

    public List<String> getTechStacks() {
        return List.copyOf(techStacks);
    }

    public Integer getYear() {
        return year;
    }

    public String getSemester() {
        return semester;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getDomain() {
        return domain;
    }

    public Boolean getIsTeam() {
        return isTeam;
    }

    public Long getAuthorId() {
        return author.getId();
    }

    public String getAuthorName() {
        return author.getName();
    }

    public boolean isAuthor(User user) {
        return user != null && author != null && user.getId().equals(author.getId());
    }

    public void updateSummary(String summary) {
        this.summary = summary;
    }

    public void updateDetails(String title,
                              String description,
                              String readme,
                              List<String> techStacks,
                              Integer year,
                              String semester,
                              String difficulty,
                              String domain) {
        this.title = Objects.requireNonNull(title, "title must not be null");
        this.description = description;
        this.readme = readme;
        this.techStacks = techStacks == null ? new ArrayList<>() : new ArrayList<>(techStacks);
        this.year = year;
        this.semester = semester;
        this.difficulty = difficulty;
        this.domain = domain;
    }

}

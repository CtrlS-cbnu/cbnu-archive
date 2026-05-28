package com.ctrl.cbnu_archive.project.repository;

import com.ctrl.cbnu_archive.project.domain.Project;
import com.ctrl.cbnu_archive.project.domain.ProjectStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    Page<Project> findByAuthorId(Long authorId, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.author.id = :authorId")
    List<Project> findAllByAuthorId(@Param("authorId") Long authorId);

    List<Project> findByStatus(ProjectStatus status);
    long countByStatus(ProjectStatus status);

    @Query(value = "SELECT DISTINCT ts.tech_stack FROM project_tech_stack ts ORDER BY ts.tech_stack", nativeQuery = true)
    List<String> findDistinctTechStacks();
}

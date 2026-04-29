package com.ctrl.cbnu_archive.file.repository;

import com.ctrl.cbnu_archive.file.domain.ProjectFile;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {
    List<ProjectFile> findByProject_Id(Long projectId);
}

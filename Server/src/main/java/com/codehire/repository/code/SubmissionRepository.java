package com.codehire.repository.code;

import com.codehire.entity.Submission;
import com.codehire.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    boolean existsByUserAndProblemId(User user, String problemId);

    Optional<Submission> findByUserAndProblemId(User user, String problemId);

    List<Submission> findByUser(User user);
    void deleteByUser(User user);
}
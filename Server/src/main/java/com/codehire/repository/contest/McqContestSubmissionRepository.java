package com.codehire.repository.contest;

import com.codehire.entity.McqContestSubmission;
import com.codehire.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface McqContestSubmissionRepository extends JpaRepository<McqContestSubmission, Long> {

    boolean existsByUserAndQuestionSetId(User user, String questionSetId);

    Optional<McqContestSubmission> findByUserAndQuestionSetId(User user, String questionSetId);

    @Query("SELECT s.questionSetId FROM McqContestSubmission s WHERE s.user = :user AND s.submittedAt IS NOT NULL")
    Set<String> findSubmittedQuestionSetIdsByUser(@Param("user") User user);


    List<McqContestSubmission> findByUser(User user);

    void deleteByUser(User user);
}
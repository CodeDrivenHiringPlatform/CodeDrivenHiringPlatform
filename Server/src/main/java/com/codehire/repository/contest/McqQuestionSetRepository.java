package com.codehire.repository.contest;

import com.codehire.document.McqQuestionSet;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface McqQuestionSetRepository extends MongoRepository<McqQuestionSet, String> {

    // Active contests: start_time <= now AND end_time >= now
    List<McqQuestionSet> findByStartTimeBeforeAndEndTimeAfter(LocalDateTime now1, LocalDateTime now2);

    // Upcoming contests: start_time > now (ordered by nearest start date)
    List<McqQuestionSet> findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime now);

    // Count Active contests
    long countByStartTimeBeforeAndEndTimeAfter(LocalDateTime now1, LocalDateTime now2);

    // Count Upcoming contests
    long countByStartTimeAfter(LocalDateTime now);

}
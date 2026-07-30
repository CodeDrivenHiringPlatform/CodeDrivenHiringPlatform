package com.codehire.repository.user;

import com.codehire.entity.User;
import com.codehire.entity.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {
    Optional<UserStats> findByUser(User user);

    @Query("SELECT us FROM UserStats us JOIN FETCH us.user u ORDER BY us.totalScore DESC")
    List<UserStats> findAllTopRankedUsers();
    void deleteByUser(User user);
}
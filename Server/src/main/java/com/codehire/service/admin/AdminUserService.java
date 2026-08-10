package com.codehire.service.admin;

import com.codehire.dto.user.UserDto;
import com.codehire.entity.Role;
import com.codehire.entity.User;
import com.codehire.repository.code.ProblemRepository;
import com.codehire.repository.code.SubmissionRepository;
import com.codehire.repository.contest.McqContestSubmissionRepository;
import com.codehire.repository.contest.McqQuestionSetRepository;
import com.codehire.repository.user.ProfileRepository;
import com.codehire.repository.user.UserRepository;
import com.codehire.repository.user.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final SubmissionRepository submissionRepository;
    private final UserStatsRepository userStatsRepository;
    private final McqContestSubmissionRepository mcqContestSubmissionRepository;
    private final McqQuestionSetRepository mcqQuestionSetRepository;
    private final ProblemRepository problemRepository;

    public Map<String, Long> getCounts() {
        LocalDateTime now = LocalDateTime.now();

        long candidateCount = userRepository.countByRole(Role.ROLE_CANDIDATE);
        long recruiterCount = userRepository.countByRole(Role.ROLE_RECRUITER);

        long activeContests = mcqQuestionSetRepository.countByStartTimeBeforeAndEndTimeAfter(now, now);
        long upcomingContests = mcqQuestionSetRepository.countByStartTimeAfter(now);
        long totalProblems = problemRepository.count();

        Map<String, Long> counts = new HashMap<>();
        counts.put("candidates", candidateCount);
        counts.put("recruiters", recruiterCount);
        counts.put("total", candidateCount + recruiterCount);
        counts.put("activeContests", activeContests);
        counts.put("upcomingContests", upcomingContests);
        counts.put("totalProblems", totalProblems);

        return counts;
    }

    public Page<UserDto> getUsersByRole(Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable).map(this::mapToDto);
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToDto);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // 1. Delete MongoDB profile
        profileRepository.deleteByUserId(userId);

        // 2. Delete related JPA child records
        submissionRepository.deleteByUser(user);
        userStatsRepository.deleteByUser(user);
        mcqContestSubmissionRepository.deleteByUser(user);

        // 3. Delete user record
        userRepository.delete(user);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
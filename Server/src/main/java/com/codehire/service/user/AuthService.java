package com.codehire.service.user;

import com.codehire.document.Profile;
import com.codehire.dto.user.AuthResponse;
import com.codehire.dto.user.RegisterRequest;
import com.codehire.dto.user.UserDto;
import com.codehire.entity.Role;
import com.codehire.entity.UserStats;
import com.codehire.repository.user.ProfileRepository;
import com.codehire.repository.user.UserStatsRepository;
import com.codehire.security.JwtUtils;
import com.codehire.dto.user.AuthRequest;
import com.codehire.entity.User;
import com.codehire.exception.UserException;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.codehire.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AuthService {
	
	 private final UserRepository userRepository;
     private final UserStatsRepository userStatsRepository;
     private final ProfileRepository profileRepository;
	 private final PasswordEncoder passwordEncoder;
     private final ModelMapper mapper;
     private final JwtUtils jwtUtils;
     private final FileStorageService fileStorageService;

    public AuthResponse login(AuthRequest authRequest) {
        User user = userRepository.findByEmail(authRequest.getEmail()).orElseThrow(() ->new UserException("User not found"));

        if(!passwordEncoder.matches(authRequest.getPassword(),user.getPassword() ))
        {
            throw new UserException("Invalid Credentials");
        }

        UserDto userDto = mapper.map(user, UserDto.class);
        return new AuthResponse(jwtUtils.generateToken(user), userDto);
    }

    @Transactional
    public void register(RegisterRequest request) throws IOException {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserException("Email already registered");
        }

        String fileName = null;
        if (request.getFile() != null && !request.getFile().isEmpty()) {
            fileName = fileStorageService.saveFile(request.getFile());
        }

        User user = mapper.map(request, User.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setProfilePic(fileName);
        User savedUser = userRepository.save(user);

        // Only create Profile and UserStats if the role is NOT ROLE_CANDIDATE
        if (savedUser.getRole() == Role.ROLE_CANDIDATE) {

            // 1. Create and save Profile
            Profile profile = Profile.builder()
                    .userId(savedUser.getId())
                    .profileCompleted(false)
                    .build();

            profileRepository.save(profile);

            // 2. Create and save initial UserStats
            UserStats userStats = UserStats.builder()
                    .user(savedUser)
                    .totalScore(0.0)
                    .codingScore(0.0)
                    .mcqScore(0.0)
                    .currentStreak(0)
                    .longestStreak(0)
                    .problemsSolved(0)
                    .totalSubmissions(0)
                    .mcqQuizzesTaken(0)
                    .mcqQuestionsCorrect(0)
                    .build();

            userStatsRepository.save(userStats);
        }
    }
}

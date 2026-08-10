package com.codehire.service.contest;

import com.codehire.entity.User;
import com.codehire.exception.UserException;
import com.codehire.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UserException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserException("User not found with this email: " + email));
        
        return user;
    }
}

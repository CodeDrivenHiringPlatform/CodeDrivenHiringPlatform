package com.codehire.repository.user;

import com.codehire.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.codehire.entity.User;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);
	boolean existsByEmail(String email);
    long countByRole(Role role);

    // Get paginated users filtered by role
    Page<User> findByRole(Role role, Pageable pageable);
}

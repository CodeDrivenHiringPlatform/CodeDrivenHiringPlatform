package com.codehire.controller;

import com.codehire.dto.ApiResponse;
import com.codehire.dto.user.UserDto;
import com.codehire.entity.Role;
import com.codehire.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {


    private final AdminUserService adminUserService;


    @GetMapping("/counts")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUserCounts() {
        Map<String, Long> counts = adminUserService.getCounts();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "counts retrieved successfully", counts)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto>>> getUsers(
            @RequestParam(required = false) Role role,
            Pageable pageable) {

        Page<UserDto> users = (role != null)
                ? adminUserService.getUsersByRole(role, pageable)
                : adminUserService.getAllUsers(pageable);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Users retrieved successfully", users)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "User deleted successfully", null)
        );
    }
}
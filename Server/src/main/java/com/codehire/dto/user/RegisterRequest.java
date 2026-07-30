package com.codehire.dto.user;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;


@Getter
@Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private MultipartFile file;
}

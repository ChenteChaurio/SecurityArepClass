package com.mycompany.springsecure;

import java.util.Collections;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Secureweb {
    public static void main(String[] args) {
    SpringApplication app = new SpringApplication(Secureweb.class);
    app.setDefaultProperties(Collections.singletonMap("server.port", "5000"));
    app.run(args);
    }
} 
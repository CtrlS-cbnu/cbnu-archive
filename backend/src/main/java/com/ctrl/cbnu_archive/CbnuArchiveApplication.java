package com.ctrl.cbnu_archive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CbnuArchiveApplication {

    public static void main(String[] args) {
        SpringApplication.run(CbnuArchiveApplication.class, args);
    }
}

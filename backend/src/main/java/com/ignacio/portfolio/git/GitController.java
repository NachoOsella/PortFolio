package com.ignacio.portfolio.git;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/git")
public class GitController {

    private final GitService gitService;

    public GitController(GitService gitService) {
        this.gitService = gitService;
    }

    @GetMapping("/status")
    public GitService.GitStatus status() {
        return gitService.status();
    }

    @GetMapping("/history")
    public List<GitService.GitCommit> history() {
        return gitService.history();
    }

    @PostMapping("/push")
    public GitService.GitPushResult push() {
        return gitService.push();
    }

    @PostMapping("/pull")
    public GitService.GitPullResult pull() {
        return gitService.pull();
    }
}

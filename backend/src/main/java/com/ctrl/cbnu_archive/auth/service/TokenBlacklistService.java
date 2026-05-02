package com.ctrl.cbnu_archive.auth.service;

import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {

    private final ConcurrentMap<String, Date> blacklist = new ConcurrentHashMap<>();

    public void add(String token, Date expiration) {
        if (token == null || expiration == null) {
            return;
        }
        Date now = new Date();
        if (expiration.before(now)) {
            return;
        }
        blacklist.put(token, expiration);
        removeExpiredTokens(now);
    }

    public boolean contains(String token) {
        if (token == null) {
            return false;
        }
        Date expiration = blacklist.get(token);
        if (expiration == null) {
            return false;
        }
        Date now = new Date();
        if (expiration.before(now)) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    private void removeExpiredTokens(Date now) {
        blacklist.entrySet().removeIf(entry -> entry.getValue().before(now));
    }
}

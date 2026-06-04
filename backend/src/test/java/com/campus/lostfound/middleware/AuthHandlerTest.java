package com.campus.lostfound.middleware;

import io.vertx.core.Future;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.User;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.RoutingContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class AuthHandlerTest {

    private JWTAuth jwtAuth;
    private RoutingContext ctx;
    private HttpServerResponse response;
    private AuthHandler authHandler;

    @BeforeEach
    public void setUp() {
        jwtAuth = mock(JWTAuth.class);
        ctx = mock(RoutingContext.class);
        response = mock(HttpServerResponse.class);
        authHandler = new AuthHandler(jwtAuth);

        // Mock basic RoutingContext request and response setups
        io.vertx.core.http.HttpServerRequest request = mock(io.vertx.core.http.HttpServerRequest.class);
        when(ctx.request()).thenReturn(request);
        when(request.getHeader("Authorization")).thenReturn("Bearer mocktoken123");
        when(ctx.response()).thenReturn(response);
        when(response.setStatusCode(anyInt())).thenReturn(response);
        when(response.putHeader(anyString(), anyString())).thenReturn(response);
    }

    @Test
    public void testAccessRouteWithAccessToken() {
        // Mock a user with a valid ACCESS token type claim
        User user = mock(User.class);
        JsonObject principal = new JsonObject()
                .put("sub", "user123")
                .put("email", "admin@campus.edu")
                .put("role", "ADMIN")
                .put("tokenType", "ACCESS");
        when(user.principal()).thenReturn(principal);
        when(jwtAuth.authenticate(any(JsonObject.class))).thenReturn(Future.succeededFuture(user));

        authHandler.handle(ctx);

        // Verify that authentication succeeded and handler passed to next()
        verify(ctx, times(1)).setUser(user);
        verify(ctx, times(1)).put("userId", "user123");
        verify(ctx, times(1)).put("userEmail", "admin@campus.edu");
        verify(ctx, times(1)).put("userRole", "ADMIN");
        verify(ctx, times(1)).next();
        verify(response, never()).setStatusCode(anyInt());
    }

    @Test
    public void testAccessRouteWithRefreshToken() {
        // Mock a user with a REFRESH token type claim
        User user = mock(User.class);
        JsonObject principal = new JsonObject()
                .put("sub", "user123")
                .put("email", "admin@campus.edu")
                .put("role", "ADMIN")
                .put("tokenType", "REFRESH"); // Swap attack
        when(user.principal()).thenReturn(principal);
        when(jwtAuth.authenticate(any(JsonObject.class))).thenReturn(Future.succeededFuture(user));

        authHandler.handle(ctx);

        // Verify that access was rejected with a 401 Unauthorized
        verify(response, times(1)).setStatusCode(401);
        verify(response, times(1)).end(anyString());
        verify(ctx, never()).next();
    }

    @Test
    public void testAccessRouteWithMissingTokenType() {
        // Mock a user with missing tokenType claim
        User user = mock(User.class);
        JsonObject principal = new JsonObject()
                .put("sub", "user123")
                .put("email", "admin@campus.edu")
                .put("role", "ADMIN"); // Missing tokenType
        when(user.principal()).thenReturn(principal);
        when(jwtAuth.authenticate(any(JsonObject.class))).thenReturn(Future.succeededFuture(user));

        authHandler.handle(ctx);

        // Verify that access was rejected
        verify(response, times(1)).setStatusCode(401);
        verify(response, times(1)).end(anyString());
        verify(ctx, never()).next();
    }

    @Test
    public void testAccessRouteWithInvalidTokenType() {
        // Mock a user with an invalid tokenType value
        User user = mock(User.class);
        JsonObject principal = new JsonObject()
                .put("sub", "user123")
                .put("email", "admin@campus.edu")
                .put("role", "ADMIN")
                .put("tokenType", "SOMETHING_ELSE");
        when(user.principal()).thenReturn(principal);
        when(jwtAuth.authenticate(any(JsonObject.class))).thenReturn(Future.succeededFuture(user));

        authHandler.handle(ctx);

        // Verify rejection
        verify(response, times(1)).setStatusCode(401);
        verify(response, times(1)).end(anyString());
        verify(ctx, never()).next();
    }

    @Test
    public void testAccessRouteWithFailedAuthentication() {
        // Mock signature or expiration failure (returns failed future)
        when(jwtAuth.authenticate(any(JsonObject.class)))
                .thenReturn(Future.failedFuture("Invalid signature or token expired"));

        authHandler.handle(ctx);

        // Verify rejection
        verify(response, times(1)).setStatusCode(401);
        verify(response, times(1)).end(anyString());
        verify(ctx, never()).next();
    }
}

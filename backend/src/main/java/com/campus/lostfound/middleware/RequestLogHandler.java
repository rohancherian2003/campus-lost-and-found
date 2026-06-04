package com.campus.lostfound.middleware;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Request logging middleware for structured access logs.
 */
public class RequestLogHandler implements Handler<RoutingContext> {

    private static final Logger logger = LoggerFactory.getLogger(RequestLogHandler.class);

    @Override
    public void handle(RoutingContext ctx) {
        long startTime = System.currentTimeMillis();

        ctx.addEndHandler(v -> {
            long duration = System.currentTimeMillis() - startTime;
            logger.info("{} {} {} - {}ms",
                    ctx.request().method(),
                    ctx.request().uri(),
                    ctx.response().getStatusCode(),
                    duration);
        });

        ctx.next();
    }
}

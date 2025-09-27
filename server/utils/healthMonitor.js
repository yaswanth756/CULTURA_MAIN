import fs from 'fs';
import path from 'path';
import os from 'os';
import mongoose from 'mongoose';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const getTimestamp = () => new Date().toISOString();
const getDate = () => new Date().toISOString().split('T')[0];

export class HealthMonitor {
  constructor(options = {}) {
    this.logDir = options.logDir || path.join(process.cwd(), 'logs');
    this.alertThresholds = {
      responseTime: options.slowApi || 300,    // ms
      memoryUsage: options.maxMemory || 80,   // %
      cpuUsage: options.maxCpu || 85,         // %
      errorRate: options.maxErrors || 5,      // %
      dbConnections: options.maxDbConn || 100
    };
    
    this.metrics = {
      requests: 0,
      errors: 0,
      slowRequests: 0,
      securityFlags: 0,
      startTime: Date.now()
    };
    
    ensureDir(this.logDir);
  }

  // 🚀 Main monitoring middleware
  monitor() {
    return (req, res, next) => {
      const startTime = process.hrtime.bigint();
      const timestamp = getTimestamp();
      
      // Security checks
      const securityIssues = this.checkSecurity(req);
      
      // Track request
      this.metrics.requests++;
      if (securityIssues.length > 0) {
        this.metrics.securityFlags++;
      }

      // Override res.end to capture response
      const originalEnd = res.end;
      res.end = (...args) => {
        const duration = Number(process.hrtime.bigint() - startTime) / 1e6; // ms
        
        // Track metrics
        if (res.statusCode >= 400) this.metrics.errors++;
        if (duration > this.alertThresholds.responseTime) this.metrics.slowRequests++;
        
        // Log request with performance and security data
        this.logRequest({
          timestamp,
          method: req.method,
          path: req.originalUrl,
          status: res.statusCode,
          duration: Math.round(duration * 10) / 10,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          securityIssues,
          systemHealth: this.getSystemHealth()
        });
        
        return originalEnd.apply(res, args);
      };
      
      next();
    };
  }

  // 🔒 Security checks
  checkSecurity(req) {
    const issues = [];
    
    // Suspicious patterns in URL
    if (/(\.\.\/|\/\.\.|<script|javascript:|data:)/i.test(req.originalUrl)) {
      issues.push('SUSPICIOUS_URL');
    }
    
    // SQL injection patterns
    if (/(union|select|insert|delete|drop|exec)/i.test(req.originalUrl)) {
      issues.push('SQL_INJECTION_ATTEMPT');
    }
    
    // XSS patterns in query params
    const queryStr = JSON.stringify(req.query);
    if (/<script|javascript:|onload|onerror/i.test(queryStr)) {
      issues.push('XSS_ATTEMPT');
    }
    
    // Large request body (potential DoS)
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB
      issues.push('LARGE_PAYLOAD');
    }
    
    // Missing User-Agent (bot behavior)
    if (!req.headers['user-agent']) {
      issues.push('NO_USER_AGENT');
    }
    
    // Too many requests from same IP (rate limiting check)
    if (this.isRateLimited(req.ip)) {
      issues.push('RATE_LIMIT_EXCEEDED');
    }
    
    return issues;
  }

  // 📊 System health check
  getSystemHealth() {
    const memUsage = process.memoryUsage();
    const cpuUsage = os.loadavg()[0]; // 1-minute load average
    
    return {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      cpu: Math.round(cpuUsage * 100) / 100,
      uptime: Math.round((Date.now() - this.metrics.startTime) / 1000), // seconds
      dbConnections: mongoose.connection.readyState === 1 ? 
        mongoose.connections.length : 0
    };
  }

  // 📝 Log request data
  logRequest(data) {
    try {
      // Performance log
      const perfLogFile = path.join(this.logDir, `performance-${getDate()}.log`);
      const perfEntry = {
        timestamp: data.timestamp,
        method: data.method,
        path: data.path,
        status: data.status,
        duration: data.duration,
        memory: data.systemHealth.memory.percentage,
        cpu: data.systemHealth.cpu
      };
      
      fs.appendFileSync(perfLogFile, JSON.stringify(perfEntry) + '\n');
      
      // Security log (only if issues found)
      if (data.securityIssues.length > 0) {
        const secLogFile = path.join(this.logDir, `security-${getDate()}.log`);
        const secEntry = {
          timestamp: data.timestamp,
          method: data.method,
          path: data.path,
          ip: data.ip,
          userAgent: data.userAgent,
          issues: data.securityIssues,
          severity: this.getSeverity(data.securityIssues)
        };
        
        fs.appendFileSync(secLogFile, JSON.stringify(secEntry) + '\n');
        
        // Console alert for high severity
        if (secEntry.severity === 'HIGH') {
          console.warn('🚨 SECURITY ALERT:', secEntry);
        }
      }
      
      // Alert log (performance issues)
      if (this.shouldAlert(data)) {
        const alertFile = path.join(this.logDir, `alerts-${getDate()}.log`);
        fs.appendFileSync(alertFile, JSON.stringify({
          timestamp: data.timestamp,
          type: 'PERFORMANCE',
          details: this.getAlertDetails(data)
        }) + '\n');
        
        console.warn('⚠️  PERFORMANCE ALERT:', this.getAlertDetails(data));
      }
      
    } catch (error) {
      console.error('Health monitor logging error:', error);
    }
  }

  // 🔔 Alert conditions
  shouldAlert(data) {
    return (
      data.duration > this.alertThresholds.responseTime ||
      data.systemHealth.memory.percentage > this.alertThresholds.memoryUsage ||
      data.systemHealth.cpu > this.alertThresholds.cpuUsage ||
      data.status >= 500
    );
  }

  getAlertDetails(data) {
    const alerts = [];
    if (data.duration > this.alertThresholds.responseTime) {
      alerts.push(`Slow API: ${data.duration}ms`);
    }
    if (data.systemHealth.memory.percentage > this.alertThresholds.memoryUsage) {
      alerts.push(`High Memory: ${data.systemHealth.memory.percentage}%`);
    }
    if (data.systemHealth.cpu > this.alertThresholds.cpuUsage) {
      alerts.push(`High CPU: ${data.systemHealth.cpu}`);
    }
    if (data.status >= 500) {
      alerts.push(`Server Error: ${data.status}`);
    }
    return alerts;
  }

  getSeverity(issues) {
    const highSeverity = ['SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT', 'LARGE_PAYLOAD'];
    return issues.some(issue => highSeverity.includes(issue)) ? 'HIGH' : 'MEDIUM';
  }

  // Simple rate limiting check
  rateLimitCache = new Map();
  
  isRateLimited(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100;
    
    if (!this.rateLimitCache.has(ip)) {
      this.rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    const record = this.rateLimitCache.get(ip);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return false;
    }
    
    record.count++;
    return record.count > maxRequests;
  }

  // 📈 Get health summary
  getHealthSummary() {
    const uptime = Math.round((Date.now() - this.metrics.startTime) / 1000);
    const errorRate = this.metrics.requests > 0 ? 
      Math.round((this.metrics.errors / this.metrics.requests) * 100) : 0;
    const slowRate = this.metrics.requests > 0 ? 
      Math.round((this.metrics.slowRequests / this.metrics.requests) * 100) : 0;
    
    return {
      uptime,
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate,
      slowRequests: this.metrics.slowRequests,
      slowRate,
      securityFlags: this.metrics.securityFlags,
      system: this.getSystemHealth()
    };
  }

  // 🏥 Health check endpoint data
  healthCheck() {
    const summary = this.getHealthSummary();
    const status = this.determineHealthStatus(summary);
    
    return {
      status,
      timestamp: getTimestamp(),
      ...summary
    };
  }

  determineHealthStatus(summary) {
    if (summary.errorRate > 10 || summary.system.memory.percentage > 90) return 'CRITICAL';
    if (summary.errorRate > 5 || summary.slowRate > 20 || summary.system.memory.percentage > 80) return 'WARNING';
    return 'HEALTHY';
  }
}

// 🎯 Easy setup function
export const setupHealthMonitor = (app, options = {}) => {
  const monitor = new HealthMonitor(options);
  
  // Add monitoring middleware
  app.use(monitor.monitor());
  
  // Add health check endpoint
  app.get('/health-detailed', (req, res) => {
    res.json(monitor.healthCheck());
  });
  
  // Add metrics endpoint
  app.get('/metrics', (req, res) => {
    res.json(monitor.getHealthSummary());
  });
  
  return monitor;
};

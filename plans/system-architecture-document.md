# System Architecture Document
## Bookmark Management System

### 1. Architecture Overview

**System Type**: Distributed, Multi-Component Architecture  
**Deployment Model**: Self-Hosted with VPN Access  
**Architecture Pattern**: Microservices with API Gateway  

### 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Browser Extension  │  Web Dashboard  │  Mobile Apps (iOS/Android)│
│  (Chrome, Firefox,  │  (React/Vue.js) │  (React Native/Flutter)  │
│   Safari, Edge)     │                 │                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/WSS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                             │
│                     (NGINX/Traefik)                           │
├─────────────────────────────────────────────────────────────────┤
│  • Load Balancing     • Rate Limiting    • SSL Termination    │
│  • Request Routing    • Authentication   • VPN Integration    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Services                          │
├─────────────────────────────────────────────────────────────────┤
│  Auth Service  │  Bookmark API  │  Search Service  │  Sync Service│
│  (JWT/OAuth)   │  (CRUD Ops)    │  (Elasticsearch) │  (WebSocket) │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Primary DB    │  Search Index  │  Cache Layer    │  File Storage│
│  (PostgreSQL)  │  (Elasticsearch)│  (Redis)       │  (MinIO/S3)  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Component Architecture

#### 3.1 Frontend Components

**Browser Extension Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Extension                           │
├─────────────────────────────────────────────────────────────────┤
│  Content Script  │  Background Script  │  Popup Interface      │
│  • Page Analysis │  • API Communication│  • Quick Access      │
│  • DOM Interaction│  • Bookmark Sync   │  • Search & Filter   │
│  • Metadata Extract│ • Offline Storage │  • Tag Management    │
└─────────────────────────────────────────────────────────────────┘
```

**Web Dashboard Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                     Web Dashboard                              │
├─────────────────────────────────────────────────────────────────┤
│  Components      │  State Management  │  Services             │
│  • Bookmark Grid │  • Vuex/Redux     │  • API Client        │
│  • Search Interface│ • Local Cache   │  • Authentication    │
│  • Organization  │  • Offline Store  │  • WebSocket Handler │
│  • Analytics     │                   │  • Export/Import     │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile App Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                     Mobile Applications                        │
├─────────────────────────────────────────────────────────────────┤
│  UI Components   │  Business Logic   │  Data Layer           │
│  • Navigation    │  • Bookmark Mgmt  │  • Local SQLite      │
│  • List/Grid View│  • Search Logic   │  • Sync Manager      │
│  • Share Extension│ • Offline Logic  │  • Cache Manager     │
│  • Settings      │                   │  • API Client        │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2 Backend Services Architecture

**Core API Service**:
```
┌─────────────────────────────────────────────────────────────────┐
│                      Bookmark API Service                      │
├─────────────────────────────────────────────────────────────────┤
│  Controllers     │  Business Logic   │  Data Access Layer    │
│  • Bookmark CRUD │  • Validation     │  • Repository Pattern│
│  • Tag Management│  • Business Rules │  • ORM/Query Builder │
│  • Collections  │  • Metadata Proc. │  • Transaction Mgmt  │
│  • Import/Export │  • Duplicate Det. │  • Connection Pool   │
└─────────────────────────────────────────────────────────────────┘
```

**Authentication Service**:
```
┌─────────────────────────────────────────────────────────────────┐
│                   Authentication Service                       │
├─────────────────────────────────────────────────────────────────┤
│  Auth Controllers│  Security Logic   │  Session Management   │
│  • Login/Register│  • Password Hash  │  • JWT Token Manager │
│  • Password Reset│  • 2FA Handling   │  • Refresh Tokens    │
│  • Profile Mgmt  │  • Rate Limiting  │  • Session Store     │
│  • Permissions  │  • Audit Logging  │  • User Context      │
└─────────────────────────────────────────────────────────────────┘
```

**Search Service**:
```
┌─────────────────────────────────────────────────────────────────┐
│                       Search Service                           │
├─────────────────────────────────────────────────────────────────┤
│  Search API      │  Index Management │  Query Processing     │
│  • Full-text     │  • Document Index │  • Query Parsing     │
│  • Faceted Search│  • Incremental Upd│  • Result Ranking    │
│  • Autocomplete  │  • Schema Mapping │  • Aggregations      │
│  • Suggestions   │  • Backup/Restore │  • Performance Opt.  │
└─────────────────────────────────────────────────────────────────┘
```

**Sync Service**:
```
┌─────────────────────────────────────────────────────────────────┐
│                      Sync Service                              │
├─────────────────────────────────────────────────────────────────┤
│  WebSocket Server│  Sync Logic       │  Conflict Resolution  │
│  • Real-time Conn│  • Change Tracking│  • Merge Strategies  │
│  • Event Broadcast│ • Delta Sync     │  • Version Control   │
│  • Connection Mgmt│ • Batch Updates  │  • Rollback Support  │
│  • Heartbeat     │  • Queue Management│ • Consistency Check │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Data Architecture

#### 4.1 Database Schema Design

**Primary Database (PostgreSQL)**:
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'
);

-- Bookmarks table
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    favicon_url TEXT,
    thumbnail_url TEXT,
    content_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#0066cc',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Bookmark tags junction table
CREATE TABLE bookmark_tags (
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (bookmark_id, tag_id)
);

-- Collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collection bookmarks junction table
CREATE TABLE collection_bookmarks (
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, bookmark_id)
);
```

**Search Index Schema (Elasticsearch)**:
```json
{
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "user_id": {"type": "keyword"},
      "url": {"type": "text", "analyzer": "url_analyzer"},
      "title": {"type": "text", "analyzer": "standard"},
      "description": {"type": "text", "analyzer": "standard"},
      "content": {"type": "text", "analyzer": "standard"},
      "tags": {"type": "keyword"},
      "domain": {"type": "keyword"},
      "created_at": {"type": "date"},
      "updated_at": {"type": "date"},
      "accessed_at": {"type": "date"}
    }
  }
}
```

#### 4.2 Caching Strategy

**Redis Cache Layers**:
```
┌─────────────────────────────────────────────────────────────────┐
│                        Cache Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│  Session Cache   │  Query Cache     │  Object Cache           │
│  • User sessions │  • Search results│  • Bookmark metadata   │
│  • JWT tokens    │  • Tag lists     │  • User preferences     │
│  • Rate limiting │  • Popular items │  • Computed aggregates  │
│  TTL: 24 hours   │  TTL: 1 hour     │  TTL: 6 hours          │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Security Architecture

#### 5.1 Authentication & Authorization

**Security Flow**:
```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│  Client Auth     │  API Gateway     │  Service Auth           │
│  • JWT Tokens    │  • Rate Limiting │  • Service-to-Service  │
│  • Refresh Token │  • VPN Validation│  • Internal API Keys   │
│  • 2FA Support   │  • SSL/TLS      │  • Resource Permissions │
│  • Biometric    │  • CORS Policy   │  • Audit Logging       │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.2 Data Protection

**Encryption Strategy**:
- **In Transit**: TLS 1.3 for all communications
- **At Rest**: AES-256 for sensitive data fields
- **Database**: PostgreSQL native encryption
- **Backups**: Encrypted backup storage

### 6. Deployment Architecture

#### 6.1 Self-Hosted Deployment

**Docker Compose Architecture**:
```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    
  api-gateway:
    build: ./api-gateway
    depends_on: [auth-service, bookmark-service]
    
  auth-service:
    build: ./auth-service
    environment:
      - DB_HOST=postgres
      - REDIS_HOST=redis
      
  bookmark-service:
    build: ./bookmark-service
    depends_on: [postgres, elasticsearch]
    
  search-service:
    build: ./search-service
    depends_on: [elasticsearch]
    
  sync-service:
    build: ./sync-service
    depends_on: [redis, postgres]
    
  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=bookmarks
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      
  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=${MINIO_PASSWORD}
```

#### 6.2 VPN Integration

**Network Security**:
```
┌─────────────────────────────────────────────────────────────────┐
│                       VPN Architecture                         │
├─────────────────────────────────────────────────────────────────┤
│  VPN Server      │  Network Isolation│  Access Control        │
│  • WireGuard     │  • Private Subnet │  • IP Whitelisting     │
│  • OpenVPN       │  • Firewall Rules │  • Certificate Auth    │
│  • Client Configs│  • Network Policies│ • Connection Logging  │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Performance & Scalability

#### 7.1 Performance Optimization

**Performance Targets**:
- API Response Time: < 200ms (95th percentile)
- Search Response Time: < 500ms (95th percentile)
- Database Query Time: < 100ms (95th percentile)
- Real-time Sync Latency: < 50ms

**Optimization Strategies**:
- Database indexing on frequently queried fields
- Connection pooling for database connections
- Async processing for non-critical operations
- CDN for static assets and thumbnails
- Lazy loading for large bookmark collections

#### 7.2 Scalability Planning

**Horizontal Scaling**:
- Load balancing across multiple API instances
- Database read replicas for query distribution
- Elasticsearch cluster for search scalability
- Redis cluster for distributed caching

**Vertical Scaling**:
- Resource monitoring and auto-scaling
- Database performance tuning
- Memory optimization for large datasets
- CPU optimization for search operations

### 8. Monitoring & Observability

#### 8.1 Monitoring Stack

**Monitoring Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                    Monitoring & Observability                  │
├─────────────────────────────────────────────────────────────────┤
│  Metrics         │  Logging         │  Tracing              │
│  • Prometheus    │  • ELK Stack     │  • Jaeger/Zipkin      │
│  • Grafana       │  • Structured    │  • Request Tracing    │
│  • AlertManager  │  • Centralized   │  • Performance Trace  │
│  • Custom Metrics│  • Log Rotation  │  • Error Tracking     │
└─────────────────────────────────────────────────────────────────┘
```

#### 8.2 Health Checks

**System Health Monitoring**:
- Service health endpoints
- Database connection monitoring
- Search index health checks
- Cache performance metrics
- VPN connection status

### 9. Backup & Disaster Recovery

#### 9.1 Backup Strategy

**Backup Architecture**:
- **Database**: Daily automated backups with 30-day retention
- **Search Index**: Weekly full backups with incremental updates
- **File Storage**: Continuous replication to secondary storage
- **Configuration**: Version-controlled infrastructure as code

#### 9.2 Disaster Recovery

**Recovery Planning**:
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour
- **Backup Restoration**: Automated restoration scripts
- **Failover Strategy**: Manual failover to backup infrastructure

### 10. Development & Testing Architecture

#### 10.1 Environment Strategy

**Environment Pipeline**:
```
Development → Testing → Staging → Production
     ↓           ↓        ↓          ↓
   Local DB   → Test DB → Stage DB → Prod DB
   Mock APIs  → Test APIs→ Stage APIs→ Prod APIs
```

#### 10.2 Testing Strategy

**Testing Pyramid**:
- **Unit Tests**: Component-level testing (70%)
- **Integration Tests**: API and database testing (20%)
- **End-to-End Tests**: User journey testing (10%)
- **Performance Tests**: Load and stress testing
- **Security Tests**: Penetration and vulnerability testing
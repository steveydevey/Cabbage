# Technical Specifications
## Bookmark Management System

### 1. API Specifications

#### 1.1 REST API Design

**Base URL**: `https://your-domain.com/api/v1`

**Authentication**: Bearer JWT tokens in Authorization header

#### 1.2 Core API Endpoints

**Authentication Endpoints**:
```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/profile
PUT  /auth/profile
POST /auth/2fa/enable
POST /auth/2fa/verify
```

**Bookmark Management Endpoints**:
```
GET    /bookmarks                    # List user's bookmarks
POST   /bookmarks                    # Create new bookmark
GET    /bookmarks/{id}               # Get specific bookmark
PUT    /bookmarks/{id}               # Update bookmark
DELETE /bookmarks/{id}               # Delete bookmark
POST   /bookmarks/bulk               # Bulk operations
GET    /bookmarks/search             # Search bookmarks
POST   /bookmarks/import             # Import bookmarks
GET    /bookmarks/export             # Export bookmarks
```

**Tag Management Endpoints**:
```
GET    /tags                         # List user's tags
POST   /tags                         # Create new tag
GET    /tags/{id}                    # Get specific tag
PUT    /tags/{id}                    # Update tag
DELETE /tags/{id}                    # Delete tag
GET    /tags/suggestions             # Get tag suggestions
```

**Collection Management Endpoints**:
```
GET    /collections                  # List user's collections
POST   /collections                  # Create new collection
GET    /collections/{id}             # Get specific collection
PUT    /collections/{id}             # Update collection
DELETE /collections/{id}             # Delete collection
POST   /collections/{id}/bookmarks   # Add bookmark to collection
DELETE /collections/{id}/bookmarks/{bookmarkId} # Remove bookmark
```

#### 1.3 API Request/Response Formats

**Create Bookmark Request**:
```json
{
  "url": "https://example.com/article",
  "title": "Example Article",
  "description": "An interesting article about...",
  "tags": ["tech", "programming"],
  "collection_id": "uuid",
  "notes": "Personal notes about this bookmark"
}
```

**Bookmark Response**:
```json
{
  "id": "uuid",
  "url": "https://example.com/article",
  "title": "Example Article",
  "description": "An interesting article about...",
  "favicon_url": "https://example.com/favicon.ico",
  "thumbnail_url": "https://cdn.example.com/thumbnail.jpg",
  "tags": [
    {"id": "uuid", "name": "tech", "color": "#0066cc"},
    {"id": "uuid", "name": "programming", "color": "#ff6600"}
  ],
  "collections": [
    {"id": "uuid", "name": "Work Resources"}
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "accessed_at": "2024-01-01T00:00:00Z",
  "is_archived": false,
  "metadata": {
    "content_type": "text/html",
    "language": "en",
    "word_count": 1200,
    "reading_time": 5
  }
}
```

**Search Request**:
```json
{
  "query": "javascript frameworks",
  "filters": {
    "tags": ["tech", "programming"],
    "collections": ["uuid"],
    "date_range": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-12-31T23:59:59Z"
    },
    "domain": "example.com"
  },
  "sort": "created_at",
  "order": "desc",
  "page": 1,
  "limit": 20
}
```

**Search Response**:
```json
{
  "results": [
    {
      "id": "uuid",
      "url": "https://example.com/article",
      "title": "Example Article",
      "description": "An interesting article about...",
      "tags": [...],
      "collections": [...],
      "created_at": "2024-01-01T00:00:00Z",
      "score": 0.95,
      "highlights": {
        "title": ["Example <em>Article</em>"],
        "description": ["An interesting article about <em>javascript</em>..."]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  },
  "facets": {
    "tags": [
      {"name": "tech", "count": 45},
      {"name": "programming", "count": 32}
    ],
    "domains": [
      {"name": "example.com", "count": 23},
      {"name": "github.com", "count": 18}
    ]
  }
}
```

#### 1.4 WebSocket API for Real-time Sync

**Connection**: `wss://your-domain.com/ws`

**Authentication**: JWT token in connection params

**Message Types**:
```json
{
  "type": "bookmark_created",
  "data": {
    "bookmark": {...},
    "user_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}

{
  "type": "bookmark_updated",
  "data": {
    "bookmark": {...},
    "changes": ["title", "tags"],
    "user_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}

{
  "type": "bookmark_deleted",
  "data": {
    "bookmark_id": "uuid",
    "user_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Database Specifications

#### 2.1 PostgreSQL Schema Details

**Complete Database Schema**:
```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with additional fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    avatar_url TEXT,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    two_factor_secret VARCHAR(32),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{
        "theme": "light",
        "notifications": {
            "email": true,
            "push": true
        },
        "privacy": {
            "profile_public": false,
            "activity_public": false
        }
    }'::jsonb
);

-- Bookmarks table with full metadata
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    notes TEXT,
    favicon_url TEXT,
    thumbnail_url TEXT,
    content_hash VARCHAR(64),
    content_type VARCHAR(100),
    language VARCHAR(10),
    word_count INTEGER,
    reading_time INTEGER,
    is_archived BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Indexes for performance
    CONSTRAINT bookmarks_user_url_unique UNIQUE(user_id, url)
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#0066cc',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT tags_user_name_unique UNIQUE(user_id, name)
);

-- Bookmark-Tag junction table
CREATE TABLE bookmark_tags (
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (bookmark_id, tag_id)
);

-- Collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0066cc',
    icon VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT collections_user_name_unique UNIQUE(user_id, name)
);

-- Collection-Bookmark junction table
CREATE TABLE collection_bookmarks (
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    bookmark_id UUID NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sort_order INTEGER DEFAULT 0,
    
    PRIMARY KEY (collection_id, bookmark_id)
);

-- Sharing table for collaborative features
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(20) NOT NULL, -- 'bookmark' or 'collection'
    resource_id UUID NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with_id UUID REFERENCES users(id) ON DELETE CASCADE,
    share_token VARCHAR(64) UNIQUE,
    permissions JSONB DEFAULT '{"read": true, "write": false}'::jsonb,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
CREATE INDEX idx_bookmarks_url_hash ON bookmarks USING hash(url);
CREATE INDEX idx_bookmarks_content_hash ON bookmarks(content_hash);
CREATE INDEX idx_bookmarks_archived ON bookmarks(user_id, is_archived) WHERE is_archived = false;
CREATE INDEX idx_bookmarks_favorite ON bookmarks(user_id, is_favorite) WHERE is_favorite = true;

CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_tags_name ON tags(user_id, name);

CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_public ON collections(is_public) WHERE is_public = true;

CREATE INDEX idx_bookmark_tags_bookmark_id ON bookmark_tags(bookmark_id);
CREATE INDEX idx_bookmark_tags_tag_id ON bookmark_tags(tag_id);

CREATE INDEX idx_collection_bookmarks_collection_id ON collection_bookmarks(collection_id);
CREATE INDEX idx_collection_bookmarks_bookmark_id ON collection_bookmarks(bookmark_id);

CREATE INDEX idx_shares_resource ON shares(resource_type, resource_id);
CREATE INDEX idx_shares_token ON shares(share_token);
CREATE INDEX idx_shares_expires ON shares(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

#### 2.2 Database Triggers and Functions

**Auto-update timestamp function**:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Audit logging trigger**:
```sql
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, changes)
        VALUES (OLD.user_id, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, changes)
        VALUES (NEW.user_id, 'UPDATE', TG_TABLE_NAME, NEW.id, 
                json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, changes)
        VALUES (NEW.user_id, 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit logging to key tables
CREATE TRIGGER audit_bookmarks AFTER INSERT OR UPDATE OR DELETE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    
CREATE TRIGGER audit_collections AFTER INSERT OR UPDATE OR DELETE ON collections
    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
```

#### 2.3 Elasticsearch Index Configuration

**Bookmark Index Mapping**:
```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "url_analyzer": {
          "type": "custom",
          "tokenizer": "keyword",
          "filter": ["lowercase", "url_parts"]
        },
        "content_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "stop", "snowball"]
        }
      },
      "filter": {
        "url_parts": {
          "type": "pattern_replace",
          "pattern": "https?://([^/]+)/?.*",
          "replacement": "$1"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": {
        "type": "keyword"
      },
      "user_id": {
        "type": "keyword"
      },
      "url": {
        "type": "text",
        "analyzer": "url_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "title": {
        "type": "text",
        "analyzer": "content_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword"
          }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "content_analyzer"
      },
      "content": {
        "type": "text",
        "analyzer": "content_analyzer"
      },
      "tags": {
        "type": "keyword"
      },
      "collections": {
        "type": "keyword"
      },
      "domain": {
        "type": "keyword"
      },
      "language": {
        "type": "keyword"
      },
      "content_type": {
        "type": "keyword"
      },
      "is_archived": {
        "type": "boolean"
      },
      "is_favorite": {
        "type": "boolean"
      },
      "created_at": {
        "type": "date"
      },
      "updated_at": {
        "type": "date"
      },
      "accessed_at": {
        "type": "date"
      },
      "word_count": {
        "type": "integer"
      },
      "reading_time": {
        "type": "integer"
      }
    }
  }
}
```

### 3. Security Specifications

#### 3.1 Authentication Flow

**JWT Token Structure**:
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "permissions": ["read", "write"],
    "iat": 1640995200,
    "exp": 1640998800,
    "jti": "uuid"
  }
}
```

**Token Refresh Flow**:
1. Client sends refresh token to `/auth/refresh`
2. Server validates refresh token and checks expiration
3. Server generates new access token and refresh token
4. Server invalidates old refresh token
5. Client receives new token pair

#### 3.2 Rate Limiting

**Rate Limit Configuration**:
```yaml
rate_limits:
  auth:
    login: 5/minute
    register: 3/minute
    forgot_password: 3/minute
  api:
    general: 100/minute
    search: 50/minute
    bulk_operations: 10/minute
  websocket:
    connections: 10/minute
    messages: 1000/minute
```

#### 3.3 Input Validation

**Validation Rules**:
```typescript
interface BookmarkValidation {
  url: {
    required: true;
    type: 'url';
    maxLength: 2048;
  };
  title: {
    required: true;
    type: 'string';
    maxLength: 500;
    minLength: 1;
  };
  description: {
    type: 'string';
    maxLength: 5000;
  };
  tags: {
    type: 'array';
    maxItems: 20;
    items: {
      type: 'string';
      maxLength: 100;
      pattern: '^[a-zA-Z0-9-_]+$';
    };
  };
  notes: {
    type: 'string';
    maxLength: 10000;
  };
}
```

### 4. Performance Specifications

#### 4.1 Caching Strategy

**Cache Configuration**:
```yaml
redis:
  sessions:
    ttl: 86400  # 24 hours
    prefix: "sess:"
  
  api_cache:
    ttl: 3600   # 1 hour
    prefix: "api:"
    
  search_cache:
    ttl: 1800   # 30 minutes
    prefix: "search:"
    
  user_data:
    ttl: 21600  # 6 hours
    prefix: "user:"
```

#### 4.2 Database Optimization

**Connection Pool Configuration**:
```yaml
postgres:
  pool:
    min: 10
    max: 100
    idle_timeout: 10s
    max_lifetime: 1h
    
  query_optimization:
    statement_timeout: 30s
    lock_timeout: 5s
    work_mem: 256MB
    shared_buffers: 1GB
```

#### 4.3 Search Performance

**Elasticsearch Configuration**:
```yaml
elasticsearch:
  index:
    refresh_interval: 30s
    number_of_shards: 3
    number_of_replicas: 1
    
  search:
    timeout: 5s
    max_result_window: 10000
    highlight:
      max_analyzed_offset: 1000000
```

### 5. Browser Extension Specifications

#### 5.1 Manifest V3 Configuration

**manifest.json**:
```json
{
  "manifest_version": 3,
  "name": "Bookmark Manager",
  "version": "1.0.0",
  "description": "Personal bookmark management system",
  "permissions": [
    "activeTab",
    "bookmarks",
    "storage",
    "contextMenus",
    "notifications"
  ],
  "host_permissions": [
    "https://your-domain.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Bookmark Manager"
  },
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  "web_accessible_resources": [
    {
      "resources": ["assets/*"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

#### 5.2 Extension API Integration

**Background Script Functions**:
```javascript
// API client configuration
const API_BASE = 'https://your-domain.com/api/v1';

class BookmarkAPI {
  constructor() {
    this.token = null;
    this.refreshToken = null;
  }

  async authenticate(username, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      await chrome.storage.local.set({
        token: this.token,
        refreshToken: this.refreshToken
      });
      return true;
    }
    return false;
  }

  async saveBookmark(bookmarkData) {
    return await this.apiCall('/bookmarks', 'POST', bookmarkData);
  }

  async searchBookmarks(query) {
    return await this.apiCall(`/bookmarks/search?q=${encodeURIComponent(query)}`);
  }

  async apiCall(endpoint, method = 'GET', body = null) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (response.status === 401) {
      await this.refreshTokens();
      return this.apiCall(endpoint, method, body);
    }

    return response.json();
  }

  async refreshTokens() {
    // Token refresh logic
  }
}
```

### 6. Mobile App Specifications

#### 6.1 React Native Configuration

**package.json dependencies**:
```json
{
  "dependencies": {
    "react-native": "^0.72.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "react-native-vector-icons": "^10.0.0",
    "react-native-share": "^9.4.0",
    "react-native-webview": "^13.6.0",
    "react-native-fast-image": "^8.6.0",
    "react-native-sqlite-storage": "^6.0.0",
    "react-native-keychain": "^8.1.0",
    "react-native-push-notification": "^8.1.0",
    "@react-native-async-storage/async-storage": "^1.19.0"
  }
}
```

#### 6.2 Offline Storage Schema

**SQLite Schema for Mobile**:
```sql
CREATE TABLE bookmarks_offline (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT, -- JSON array as string
    created_at INTEGER,
    updated_at INTEGER,
    sync_status INTEGER DEFAULT 0, -- 0: synced, 1: pending, 2: conflict
    is_deleted INTEGER DEFAULT 0
);

CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    data TEXT, -- JSON data
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    retry_count INTEGER DEFAULT 0,
    status INTEGER DEFAULT 0 -- 0: pending, 1: success, 2: failed
);
```

### 7. Monitoring and Analytics

#### 7.1 Metrics Collection

**Application Metrics**:
```yaml
metrics:
  business:
    - bookmarks_created_total
    - bookmarks_deleted_total
    - searches_performed_total
    - user_registrations_total
    - user_logins_total
    
  technical:
    - api_request_duration_seconds
    - api_request_total
    - database_query_duration_seconds
    - search_query_duration_seconds
    - websocket_connections_total
    
  system:
    - memory_usage_bytes
    - cpu_usage_percent
    - disk_usage_bytes
    - network_bytes_total
```

#### 7.2 Logging Configuration

**Structured Logging Format**:
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "INFO",
  "service": "bookmark-api",
  "message": "Bookmark created successfully",
  "user_id": "uuid",
  "resource_id": "uuid",
  "action": "create_bookmark",
  "duration_ms": 150,
  "metadata": {
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "request_id": "uuid"
  }
}
```

### 8. Deployment Specifications

#### 8.1 Environment Variables

**Required Environment Variables**:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookmarks
DB_USER=app
DB_PASSWORD=secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Elasticsearch
ES_HOST=localhost
ES_PORT=9200
ES_USERNAME=elastic
ES_PASSWORD=es_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# External Services
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password

# VPN
VPN_ENABLED=true
VPN_ALLOWED_IPS=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
```

#### 8.2 Health Check Endpoints

**Health Check Responses**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "response_time_ms": 5,
      "details": "Connection pool: 25/100 active"
    },
    "redis": {
      "status": "healthy",
      "response_time_ms": 2,
      "details": "Memory usage: 45MB"
    },
    "elasticsearch": {
      "status": "healthy",
      "response_time_ms": 15,
      "details": "Cluster status: green"
    }
  }
}
```

This technical specification provides the detailed implementation guidelines needed to build each component of the bookmark management system. Each section includes specific configurations, schemas, and code examples that development teams can directly use for implementation.
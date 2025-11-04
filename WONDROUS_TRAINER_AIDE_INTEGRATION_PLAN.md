# Wondrous Trainer Aide Integration Plan

**Version:** 1.0
**Date:** October 29, 2025
**Status:** Planning Phase

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current System Analysis](#current-system-analysis)
3. [Integration Architecture](#integration-architecture)
4. [Authentication & SSO Strategy](#authentication--sso-strategy)
5. [Data Migration Strategy](#data-migration-strategy)
6. [Implementation Phases](#implementation-phases)
7. [Technical Specifications](#technical-specifications)
8. [Security Considerations](#security-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Plan](#deployment-plan)
11. [Maintenance & Monitoring](#maintenance--monitoring)

---

## Executive Summary

### Goal
Integrate the standalone **trainer-aide-demo** application with the **wondrous-store-platform** to create a unified system where users (instructors, clients, and studio owners) can seamlessly access Trainer Aide functionality using their existing authentication credentials.

### Key Objectives
- ✅ **Single Sign-On (SSO)**: Users authenticated in wondrous-store-platform automatically gain access to trainer-aide
- ✅ **Unified Navigation**: "Trainer Aide" tab appears in all relevant dashboards
- ✅ **Real Data Integration**: Replace mock data with live Supabase data
- ✅ **Seamless UX**: Application feels like one integrated system, not two separate apps
- ✅ **Role-Based Access**: Instructors, clients, and studio owners see appropriate features

### Success Metrics
- Users can access Trainer Aide without additional login
- < 2 second transition time between platforms
- 100% data synchronization accuracy
- Zero authentication errors in production

---

## Current System Analysis

### Wondrous Store Platform

**Technology Stack:**
- **Framework**: Next.js 15 (App Router)
- **Authentication**: Supabase SSR with cookie-based sessions
- **Database**: PostgreSQL via Supabase
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **API Layer**: Next.js API Routes + Supabase REST

**Key Files:**
```
wondrous-store-platform/
├── src/
│   ├── middleware.ts                 # Auth middleware with session handling
│   ├── lib/
│   │   ├── get-supabase.ts          # Client-side Supabase client
│   │   └── get-supabase-server.ts   # Server-side Supabase client
│   ├── types/
│   │   └── trainer-aide.ts          # Already defined trainer-aide types!
│   └── app/
│       ├── instructor-dashboard/     # Instructor interface
│       ├── client-dashboard/         # Client interface
│       └── dashboard/                # Studio owner interface
```

**Authentication Flow:**
1. User logs in via Supabase Auth (email/password, OAuth)
2. Session cookie is set via middleware
3. Server-side session validation on every request
4. Role-based routing to appropriate dashboard

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

**User Roles:**
- `instructor` → `/instructor-dashboard`
- `fc_client` → `/client-dashboard`
- `studio_owner` → `/dashboard`

---

### Trainer Aide Demo

**Technology Stack:**
- **Framework**: Next.js 15 (App Router)
- **Authentication**: Mock (Zustand store with localStorage)
- **Database**: None (mock data in memory)
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS (matching wondrous-store design system)

**Key Files:**
```
trainer-aide-demo/
├── lib/
│   ├── stores/
│   │   ├── user-store.ts         # Mock auth - NEEDS REPLACEMENT
│   │   ├── session-store.ts      # Mock sessions
│   │   ├── template-store.ts     # Mock templates
│   │   └── calendar-store.ts     # Mock calendar
│   ├── mock-data/
│   │   ├── users.ts
│   │   ├── clients.ts
│   │   └── sessions.ts
│   └── types/
│       └── index.ts              # Needs alignment with wondrous types
└── app/
    ├── trainer/                  # Trainer dashboard
    ├── client/                   # Client view
    └── studio-owner/             # Studio owner view
```

**Current Limitations:**
- ❌ No real authentication
- ❌ No database persistence
- ❌ Data resets on page refresh (unless in localStorage)
- ❌ No multi-user support
- ❌ No real-time updates

---

## Integration Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WONDROUS STORE PLATFORM                   │
│                   (wondrous.com)                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Instructor   │  │    Client    │  │ Studio Owner │    │
│  │ Dashboard    │  │  Dashboard   │  │  Dashboard   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                     [Trainer Aide Tab]                      │
│                            │                                │
│                            ↓                                │
│         ┌──────────────────────────────────┐               │
│         │   Generate Secure Auth Token     │               │
│         │   (JWT with session info)         │               │
│         └──────────────────┬───────────────┘               │
└────────────────────────────┼────────────────────────────────┘
                             │
                    Secure Token Handoff
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                     TRAINER AIDE APP                         │
│               (trainer-aide.wondrous.com)                    │
│                                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  1. Receive & Validate Token                   │         │
│  │  2. Extract User Info (ID, Role, Email)        │         │
│  │  3. Create Supabase Session                    │         │
│  │  4. Load User-Specific Data                    │         │
│  │  5. Redirect to Appropriate Dashboard          │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Sessions   │  │  Templates   │  │   Calendar   │    │
│  │  Management  │  │   Builder    │  │    View      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (SHARED)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   profiles   │  │   sessions   │  │  templates   │    │
│  │   table      │  │    table     │  │    table     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   clients    │  │   exercises  │  │   calendar   │    │
│  │   table      │  │    table     │  │    table     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Domain Structure

**Option 1: Subdomain (Recommended)**
```
Main Platform:    https://wondrous.com
Trainer Aide:     https://trainer-aide.wondrous.com
```

**Option 2: Subdirectory**
```
Main Platform:    https://wondrous.com
Trainer Aide:     https://wondrous.com/trainer-aide
```

**Recommendation**: Use subdomain approach for:
- ✅ Easier deployment management
- ✅ Independent scaling
- ✅ Clearer separation of concerns
- ✅ Better SSL certificate management

---

## Authentication & SSO Strategy

### Token-Based SSO Flow

#### Step 1: Token Generation (Wondrous Store Platform)

**Location**: `/app/api/trainer-aide/generate-token/route.ts`

```typescript
// NEW FILE: wondrous-store-platform/src/app/api/trainer-aide/generate-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();

  // Get current session
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user profile with role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // Generate secure token (expires in 5 minutes)
  const token = jwt.sign(
    {
      userId: session.user.id,
      email: session.user.email,
      role: profile?.user_type || 'instructor',
      sessionToken: session.access_token,
      exp: Math.floor(Date.now() / 1000) + (5 * 60), // 5 minutes
    },
    process.env.TRAINER_AIDE_JWT_SECRET!
  );

  // Return redirect URL with token
  const trainerAideUrl = process.env.NEXT_PUBLIC_TRAINER_AIDE_URL;
  const redirectUrl = `${trainerAideUrl}/auth/sso?token=${token}`;

  return NextResponse.json({ redirectUrl });
}
```

#### Step 2: Navigation Link (Dashboard Components)

**Update**: `/src/components/instructor-side-menu.tsx`

```typescript
// Add to navigation items
const navItems = [
  // ... existing items
  {
    name: 'Trainer Aide',
    href: '/trainer-aide',
    icon: Dumbbell,
    isExternal: true,
    onClick: async (e) => {
      e.preventDefault();
      const response = await fetch('/api/trainer-aide/generate-token');
      const { redirectUrl } = await response.json();
      window.location.href = redirectUrl;
    }
  }
];
```

#### Step 3: Token Validation (Trainer Aide)

**Location**: `/app/auth/sso/route.ts`

```typescript
// NEW FILE: trainer-aide-demo/app/auth/sso/route.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.TRAINER_AIDE_JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
      sessionToken: string;
    };

    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Set session using the access token from main platform
    const { error } = await supabase.auth.setSession({
      access_token: decoded.sessionToken,
      refresh_token: '', // Not needed for SSO
    });

    if (error) {
      console.error('Session creation error:', error);
      return NextResponse.redirect(new URL('/auth/error', request.url));
    }

    // Redirect to appropriate dashboard based on role
    const dashboardRoutes = {
      instructor: '/trainer',
      fc_client: '/client',
      studio_owner: '/studio-owner',
    };

    const redirectPath = dashboardRoutes[decoded.role as keyof typeof dashboardRoutes] || '/trainer';

    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}
```

### Session Management

**Shared Session Storage:**
- Both apps use Supabase for session management
- Sessions stored in cookies (httpOnly, secure)
- Same session ID across both platforms
- Automatic session refresh on both apps

**Session Lifetime:**
- Access token: 1 hour (Supabase default)
- Refresh token: 30 days
- SSO token: 5 minutes (one-time use)

---

## Data Migration Strategy

### Current Mock Data → Supabase Tables

#### Phase 1: User Store Migration

**Before (Mock):**
```typescript
// lib/stores/user-store.ts
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: DEFAULT_USER,
      isAuthenticated: false,
      // ...
    }),
    { name: 'trainer-aide-user' }
  )
);
```

**After (Supabase):**
```typescript
// lib/stores/user-store.ts
import { createClient } from '@supabase/supabase-js';

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,

  // Load user from Supabase session
  loadUser: async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      set({
        currentUser: {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          role: profile.user_type,
        },
        isAuthenticated: true,
      });
    }
  },

  logout: async () => {
    const supabase = createClient(/* ... */);
    await supabase.auth.signOut();
    set({ currentUser: null, isAuthenticated: false });
  }
}));
```

#### Phase 2: Sessions Store Migration

**Supabase Table Structure:**
```sql
-- Already exists in wondrous-store-platform
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES profiles(id),
  client_id UUID REFERENCES profiles(id),
  template_id UUID REFERENCES workout_templates(id),
  session_name TEXT NOT NULL,
  json_definition JSONB NOT NULL,
  overall_rpe INTEGER,
  notes TEXT,
  trainer_declaration BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**New Store Implementation:**
```typescript
// lib/stores/session-store.ts
import { createClient } from '@supabase/supabase-js';

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  loading: false,

  // Fetch sessions for current user
  fetchSessions: async (trainerId: string) => {
    set({ loading: true });
    const supabase = createClient(/* ... */);

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        client:profiles!client_id (id, first_name, last_name, email),
        template:workout_templates (id, name)
      `)
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      set({ sessions: data, loading: false });
    }
  },

  // Create new session
  createSession: async (session: CreateSessionRequest) => {
    const supabase = createClient(/* ... */);

    const { data, error } = await supabase
      .from('sessions')
      .insert([session])
      .select()
      .single();

    if (!error && data) {
      set(state => ({ sessions: [data, ...state.sessions] }));
      return data;
    }
  },

  // Real-time subscription for updates
  subscribeToSessions: (trainerId: string) => {
    const supabase = createClient(/* ... */);

    const subscription = supabase
      .channel('sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `trainer_id=eq.${trainerId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          set(state => ({ sessions: [payload.new, ...state.sessions] }));
        } else if (payload.eventType === 'UPDATE') {
          set(state => ({
            sessions: state.sessions.map(s =>
              s.id === payload.new.id ? payload.new : s
            )
          }));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}));
```

#### Phase 3: Templates Store Migration

Similar pattern for templates, calendar events, and other entities.

### Database Schema Alignment

**Existing wondrous-store-platform Tables:**
- ✅ `profiles` - User information
- ✅ `sessions` - Training sessions
- ✅ `workout_templates` - Template definitions
- ✅ `exercise_library` - Exercise database
- ✅ `custom_exercises` - User-created exercises

**New Tables Needed:**
```sql
-- Calendar/availability system
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL, -- 'session', 'availability', 'soft-hold'
  session_id UUID REFERENCES sessions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service types (30min PT, 45min PT, etc.)
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  studio_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- minutes
  service_type TEXT NOT NULL, -- '1-2-1', 'duet', 'group'
  max_capacity INTEGER DEFAULT 1,
  credits_required NUMERIC(10,2) DEFAULT 1,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Implementation Phases

### Phase 1: Infrastructure Setup (Week 1-2)

**Tasks:**
1. ✅ Set up trainer-aide subdomain DNS
2. ✅ Configure deployment pipeline (Vercel/Railway)
3. ✅ Add Supabase environment variables to trainer-aide
4. ✅ Create JWT secret for SSO tokens
5. ✅ Test CORS configuration
6. ✅ Set up SSL certificates

**Deliverables:**
- `trainer-aide.wondrous.com` accessible
- Environment variables configured
- Health check endpoint working

### Phase 2: Authentication Implementation (Week 3-4)

**Tasks:**
1. ✅ Create token generation API in wondrous-store
2. ✅ Implement SSO route in trainer-aide
3. ✅ Add Supabase client setup
4. ✅ Replace mock auth with real auth
5. ✅ Test login flow end-to-end
6. ✅ Add error handling and logging

**Deliverables:**
- Working SSO from main platform to trainer-aide
- Users automatically logged in
- Session persistence working

### Phase 3: Navigation Integration (Week 5)

**Tasks:**
1. ✅ Add "Trainer Aide" link to InstructorSideMenu
2. ✅ Add "Trainer Aide" link to ClientDashboard
3. ✅ Add "Trainer Aide" link to StudioOwnerDashboard
4. ✅ Implement token generation on click
5. ✅ Add loading states
6. ✅ Test navigation from all user types

**Deliverables:**
- Trainer Aide accessible from all dashboards
- Smooth transition with loading indicator
- No authentication errors

### Phase 4: Data Migration - Sessions (Week 6-7)

**Tasks:**
1. ✅ Update session-store to use Supabase
2. ✅ Implement session CRUD operations
3. ✅ Add real-time subscriptions
4. ✅ Test session creation flow
5. ✅ Test session completion flow
6. ✅ Migrate existing mock sessions (if any)

**Deliverables:**
- Sessions persist to database
- Real-time updates working
- Full session lifecycle functional

### Phase 5: Data Migration - Templates (Week 8-9)

**Tasks:**
1. ✅ Update template-store to use Supabase
2. ✅ Implement template CRUD operations
3. ✅ Test template builder
4. ✅ Test template assignment to sessions
5. ✅ Add exercise library integration

**Deliverables:**
- Templates saved to database
- Template builder fully functional
- Exercise library integrated

### Phase 6: Data Migration - Calendar (Week 10-11)

**Tasks:**
1. ✅ Create calendar_events table
2. ✅ Update calendar-store to use Supabase
3. ✅ Implement availability system
4. ✅ Implement soft-hold system
5. ✅ Test calendar booking flow
6. ✅ Add conflict detection

**Deliverables:**
- Calendar events persist
- Availability system working
- No scheduling conflicts

### Phase 7: Services & Studio Owner Features (Week 12-13)

**Tasks:**
1. ✅ Create services table
2. ✅ Implement service CRUD
3. ✅ Test service creation/editing
4. ✅ Integrate services with calendar
5. ✅ Test studio owner workflows

**Deliverables:**
- Services system fully functional
- Studio owners can manage services
- Services integrate with scheduling

### Phase 8: Testing & QA (Week 14-15)

**Tasks:**
1. ✅ End-to-end testing of all user flows
2. ✅ Security audit
3. ✅ Performance testing
4. ✅ Cross-browser testing
5. ✅ Mobile responsiveness testing
6. ✅ Load testing
7. ✅ Bug fixing

**Deliverables:**
- All critical bugs fixed
- Performance metrics met
- Security vulnerabilities addressed

### Phase 9: Production Deployment (Week 16)

**Tasks:**
1. ✅ Deploy to production
2. ✅ Monitor for errors
3. ✅ Gradual rollout to users
4. ✅ Gather user feedback
5. ✅ Make iterative improvements

**Deliverables:**
- Trainer Aide live in production
- Zero critical errors
- Positive user feedback

---

## Technical Specifications

### Environment Variables

**Wondrous Store Platform (.env.local):**
```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# New for Trainer Aide integration
NEXT_PUBLIC_TRAINER_AIDE_URL=https://trainer-aide.wondrous.com
TRAINER_AIDE_JWT_SECRET=[generate-secure-secret-256-bit]
```

**Trainer Aide App (.env.local):**
```env
# Supabase (same as main platform)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# SSO Configuration
TRAINER_AIDE_JWT_SECRET=[same-as-main-platform]
NEXT_PUBLIC_MAIN_PLATFORM_URL=https://wondrous.com

# Application
NEXT_PUBLIC_APP_NAME=Trainer Aide
NEXT_PUBLIC_APP_ENV=production
```

### Package Dependencies

**Trainer Aide - Add to package.json:**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.5"
  }
}
```

### API Endpoints

**Wondrous Store Platform:**
```
POST   /api/trainer-aide/generate-token     # Generate SSO token
GET    /api/trainer-aide/verify-access      # Verify user has access
```

**Trainer Aide:**
```
GET    /auth/sso                            # Handle SSO login
GET    /api/auth/session                    # Get current session
POST   /api/auth/logout                     # Logout user
GET    /api/health                          # Health check
```

### Middleware Configuration

**Trainer Aide - middleware.ts:**
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/auth/sso', '/auth/error', '/api/health'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Cookie setting logic
        },
        remove(name: string, options: any) {
          // Cookie removal logic
        },
      },
    }
  );

  // Check session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Redirect to main platform login
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_MAIN_PLATFORM_URL!));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Security Considerations

### 1. Token Security

**JWT Token Specifications:**
- Algorithm: HS256 (HMAC-SHA256)
- Secret: 256-bit random string (stored in env vars only)
- Expiration: 5 minutes (short-lived, one-time use)
- Payload: Minimal data (user ID, role, session token)

**Token Validation:**
- ✅ Verify signature
- ✅ Check expiration
- ✅ Validate issuer
- ✅ One-time use (optional: store used tokens in Redis)

### 2. Session Security

**Cookie Configuration:**
```typescript
{
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'lax',
  maxAge: 3600, // 1 hour
  domain: '.wondrous.com' // Shared across subdomains
}
```

### 3. CORS Configuration

**Allowed Origins:**
```typescript
const allowedOrigins = [
  'https://wondrous.com',
  'https://trainer-aide.wondrous.com',
  'http://localhost:3000', // Development only
];
```

### 4. Rate Limiting

**Token Generation Endpoint:**
- Max 10 requests per minute per user
- IP-based rate limiting
- Cloudflare/Vercel built-in protection

### 5. Data Access Control

**Row Level Security (RLS):**
```sql
-- Example: Sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (
    auth.uid() = trainer_id
    OR auth.uid() = client_id
  );

CREATE POLICY "Trainers can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    auth.uid() = trainer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND user_type = 'instructor'
    )
  );
```

### 6. Audit Logging

**Log Critical Actions:**
```typescript
// Log to Supabase or external service
await logAudit({
  userId: user.id,
  action: 'SSO_LOGIN',
  resource: 'trainer-aide',
  timestamp: new Date(),
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
});
```

---

## Testing Strategy

### Unit Tests

**Authentication Flow:**
```typescript
describe('SSO Token Generation', () => {
  it('should generate valid JWT token', async () => {
    const token = await generateSSOToken(mockUser);
    expect(jwt.verify(token, JWT_SECRET)).toBeTruthy();
  });

  it('should include user ID and role', async () => {
    const token = await generateSSOToken(mockUser);
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.userId).toBe(mockUser.id);
    expect(decoded.role).toBe(mockUser.role);
  });

  it('should expire in 5 minutes', async () => {
    const token = await generateSSOToken(mockUser);
    const decoded = jwt.verify(token, JWT_SECRET);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    expect(expiresIn).toBeLessThanOrEqual(300);
  });
});

describe('SSO Token Validation', () => {
  it('should reject expired tokens', async () => {
    const expiredToken = jwt.sign({ userId: '123' }, JWT_SECRET, { expiresIn: '-1s' });
    await expect(validateSSOToken(expiredToken)).rejects.toThrow();
  });

  it('should reject invalid signatures', async () => {
    const invalidToken = jwt.sign({ userId: '123' }, 'wrong-secret');
    await expect(validateSSOToken(invalidToken)).rejects.toThrow();
  });
});
```

### Integration Tests

**End-to-End User Flow:**
```typescript
describe('Trainer Aide SSO Flow', () => {
  it('should allow logged-in user to access trainer aide', async () => {
    // 1. Login to main platform
    await loginToMainPlatform('instructor@example.com', 'password');

    // 2. Click Trainer Aide link
    const trainerAideLink = await page.$('[href="/trainer-aide"]');
    await trainerAideLink.click();

    // 3. Should be redirected and logged in automatically
    await page.waitForNavigation();
    expect(page.url()).toContain('trainer-aide.wondrous.com/trainer');

    // 4. Should see user's sessions
    const sessions = await page.$$('.session-card');
    expect(sessions.length).toBeGreaterThan(0);
  });
});
```

### Manual Testing Checklist

#### Authentication
- [ ] User can log in to main platform
- [ ] User can click Trainer Aide link
- [ ] User is automatically logged in to Trainer Aide
- [ ] Session persists across page refreshes
- [ ] User can log out from Trainer Aide
- [ ] Logout from main platform logs out of Trainer Aide

#### User Roles
- [ ] Instructor sees trainer dashboard
- [ ] Client sees client dashboard
- [ ] Studio owner sees studio owner dashboard
- [ ] Unauthorized roles are blocked

#### Data Operations
- [ ] Create new session
- [ ] Edit existing session
- [ ] Complete session
- [ ] Create template
- [ ] Edit template
- [ ] Schedule calendar event
- [ ] Create service (studio owner)

#### Real-time Features
- [ ] New session appears without refresh
- [ ] Updated session reflects changes
- [ ] Calendar updates in real-time
- [ ] Multiple tabs stay synced

#### Error Handling
- [ ] Expired token shows error message
- [ ] Invalid token redirects to login
- [ ] Network errors are handled gracefully
- [ ] Database errors don't crash app

---

## Deployment Plan

### Pre-Deployment Checklist

#### Infrastructure
- [ ] Domain DNS configured (trainer-aide.wondrous.com)
- [ ] SSL certificate installed
- [ ] CDN configured (if using Cloudflare)
- [ ] Environment variables set in production
- [ ] Database migrations run
- [ ] Health check endpoint working

#### Security
- [ ] JWT secret generated (256-bit)
- [ ] Supabase RLS policies enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured

#### Code
- [ ] All tests passing
- [ ] No console errors
- [ ] Build succeeds
- [ ] Bundle size optimized
- [ ] Lighthouse score > 90

### Deployment Steps

#### Step 1: Database Setup
```bash
# Run migrations on production Supabase
cd wondrous-store-platform
supabase db push --project-ref [production-project-id]

# Verify tables created
supabase db inspect
```

#### Step 2: Deploy Trainer Aide
```bash
# Option A: Vercel
cd trainer-aide-demo
vercel --prod

# Option B: Railway
railway up --service trainer-aide

# Option C: Docker
docker build -t trainer-aide .
docker push registry.wondrous.com/trainer-aide:latest
```

#### Step 3: Deploy Main Platform Updates
```bash
cd wondrous-store-platform
# Deploy token generation API and navigation updates
vercel --prod
```

#### Step 4: DNS Configuration
```
Type: CNAME
Name: trainer-aide
Value: [deployment-url].vercel-dns.com
TTL: 300
```

#### Step 5: Smoke Tests
```bash
# Test SSO flow
curl -X GET https://wondrous.com/api/trainer-aide/generate-token \
  -H "Cookie: sb-access-token=..."

# Test health endpoint
curl https://trainer-aide.wondrous.com/api/health
```

### Rollback Plan

**If Issues Detected:**
1. Remove "Trainer Aide" links from main platform navigation
2. Display maintenance message on trainer-aide.wondrous.com
3. Investigate and fix issues in staging
4. Re-deploy after verification

**Rollback Commands:**
```bash
# Vercel
vercel rollback

# Railway
railway rollback

# DNS (temporary disable)
# Point CNAME to maintenance page
```

---

## Maintenance & Monitoring

### Monitoring Setup

**Application Performance:**
- Response time < 200ms (p95)
- Error rate < 0.1%
- Uptime > 99.9%

**Key Metrics to Track:**
```typescript
// Log to monitoring service (Datadog, Sentry, etc.)
{
  metric: 'sso.token_generation',
  value: 1,
  tags: ['user_role:instructor', 'success:true'],
  timestamp: Date.now()
}

{
  metric: 'sso.token_validation',
  value: 1,
  tags: ['success:true', 'duration_ms:45'],
  timestamp: Date.now()
}

{
  metric: 'database.query',
  value: 1,
  tags: ['table:sessions', 'operation:select', 'duration_ms:120'],
  timestamp: Date.now()
}
```

### Error Tracking

**Sentry Configuration:**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Scrub sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  }
});
```

### Logging Strategy

**Structured Logging:**
```typescript
import { logger } from '@/lib/logger';

logger.info('SSO token generated', {
  userId: user.id,
  role: user.role,
  timestamp: Date.now(),
  requestId: generateRequestId(),
});

logger.error('SSO token validation failed', {
  error: error.message,
  token: token.substring(0, 10) + '...',
  timestamp: Date.now(),
  requestId: generateRequestId(),
});
```

### Database Backups

**Supabase Automatic Backups:**
- Daily automated backups (retained for 7 days)
- Point-in-time recovery available
- Manual backups before major changes

**Backup Verification:**
```bash
# Weekly backup verification
supabase db dump --project-ref [prod-project-id] > backup.sql
# Test restore on staging
supabase db restore --project-ref [staging-project-id] < backup.sql
```

### Performance Optimization

**Database Indexing:**
```sql
-- Optimize common queries
CREATE INDEX idx_sessions_trainer_id ON sessions(trainer_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_calendar_user_time ON calendar_events(user_id, start_time);
```

**Caching Strategy:**
```typescript
// Cache user profile for 5 minutes
const cachedProfile = await redis.get(`profile:${userId}`);
if (cachedProfile) {
  return JSON.parse(cachedProfile);
}

const profile = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

await redis.setex(`profile:${userId}`, 300, JSON.stringify(profile));
```

---

## Appendix

### A. Database Schema Reference

**Complete table definitions, relationships, and indexes**
*(See separate DATABASE_SCHEMA.md file)*

### B. API Documentation

**Complete API endpoint documentation**
*(See separate API_DOCUMENTATION.md file)*

### C. Troubleshooting Guide

**Common Issues and Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid token" error | Token expired or invalid signature | Generate new token, check JWT_SECRET matches |
| User not redirected | CORS issue | Verify CORS configuration |
| Session not found | Cookie not set properly | Check cookie domain and sameSite settings |
| Data not loading | RLS policy blocking access | Review Supabase RLS policies |
| Real-time not working | Subscription not established | Check Supabase realtime configuration |

### D. Glossary

- **SSO**: Single Sign-On - Authentication method allowing one login for multiple systems
- **JWT**: JSON Web Token - Secure token format for transmitting authentication data
- **RLS**: Row Level Security - Database-level security controlling data access
- **Supabase SSR**: Supabase Server-Side Rendering package for Next.js
- **Mock Data**: Fake data used for development/testing
- **Zustand**: Lightweight state management library
- **Middleware**: Server-side code that runs before request processing

---

## Conclusion

This integration plan provides a comprehensive roadmap for connecting the Trainer Aide system with the Wondrous Store Platform. The phased approach ensures minimal disruption to existing users while delivering a seamless, unified experience.

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1 (Infrastructure Setup)
4. Regular check-ins and progress updates

**Success Criteria:**
- ✅ Zero authentication errors
- ✅ < 2 second transition time
- ✅ 100% data accuracy
- ✅ Positive user feedback

---

**Document Version:** 1.0
**Last Updated:** October 29, 2025
**Prepared By:** Claude (Anthropic)
**Status:** Ready for Review

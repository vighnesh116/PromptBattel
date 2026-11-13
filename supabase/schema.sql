-- ==============================================================================
-- RESQ-AI: Rural Alternative Transportation & Student Safety Platform
-- Supabase PostgreSQL Database Schema & Security Policies (RLS)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- ------------------------------------------------------------------------------
-- 1. students TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    student_id TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    college_name TEXT NOT NULL,
    college_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. emergency_contacts TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    college_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. transport_agents TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transport_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    service_area TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. vehicles TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES public.transport_agents(id) ON DELETE CASCADE UNIQUE,
    vehicle_type TEXT NOT NULL 
        CHECK (vehicle_type IN ('auto-rickshaw', 'car', 'van', 'minibus', 'other')),
    registration_number TEXT NOT NULL UNIQUE,
    vehicle_description TEXT,
    availability_status TEXT NOT NULL DEFAULT 'unavailable' 
        CHECK (availability_status IN ('available', 'unavailable')),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_accuracy DOUBLE PRECISION,
    location_updated_at TIMESTAMPTZ,
    location_sharing_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. transport_requests TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transport_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.transport_agents(id) ON DELETE SET NULL,
    pickup_latitude DOUBLE PRECISION NOT NULL,
    pickup_longitude DOUBLE PRECISION NOT NULL,
    pickup_address TEXT,
    request_radius_km INTEGER NOT NULL DEFAULT 10 CHECK (request_radius_km BETWEEN 1 AND 20),
    bus_presence TEXT CHECK (bus_presence IN ('present', 'absent')),
    bus_location TEXT,
    bus_eta_minutes INTEGER CHECK (bus_eta_minutes IS NULL OR bus_eta_minutes >= 0),
    max_wait_minutes INTEGER CHECK (max_wait_minutes IS NULL OR max_wait_minutes >= 0),
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. emergency_alerts TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_accuracy DOUBLE PRECISION,
    location_address TEXT,
    reason TEXT NOT NULL,
    alert_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (alert_status IN ('pending', 'sent', 'partially_sent', 'failed')),
    parent_email_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (parent_email_status IN ('pending', 'sent', 'failed')),
    college_email_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (college_email_status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. notification_logs TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    related_alert_id UUID REFERENCES public.emergency_alerts(id) ON DELETE SET NULL,
    delivery_status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (delivery_status IN ('pending', 'sent', 'failed')),
    provider_message_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_vehicles_lat_lon ON public.vehicles (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_vehicles_availability ON public.vehicles (availability_status);
CREATE INDEX IF NOT EXISTS idx_requests_student ON public.transport_requests (student_id);
CREATE INDEX IF NOT EXISTS idx_requests_agent ON public.transport_requests (agent_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.transport_requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_open_pickup
    ON public.transport_requests (status, pickup_latitude, pickup_longitude)
    WHERE agent_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_student ON public.emergency_alerts (student_id);

-- ------------------------------------------------------------------------------
-- GEOSPATIAL SEARCH FUNCTION: calculate distance in kilometers (Haversine)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_haversine_km(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    r DOUBLE PRECISION := 6371; -- Earth radius in km
    dlat DOUBLE PRECISION;
    dlon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
    c := 2 * atan2(sqrt(a), sqrt(1 - a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Students RLS: Read/Write own record
CREATE POLICY "Students can view their own profile"
    ON public.students FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Students can insert their own profile"
    ON public.students FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Students can update their own profile"
    ON public.students FOR UPDATE
    USING (auth.uid() = auth_user_id);

-- Emergency Contacts RLS: Stored securely
CREATE POLICY "Students can view their own emergency contacts"
    ON public.emergency_contacts FOR SELECT
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Students can insert/update their emergency contacts"
    ON public.emergency_contacts FOR ALL
    USING (
        student_id IN (
            SELECT id FROM public.students WHERE auth_user_id = auth.uid()
        )
    );

-- Transport Agents RLS
CREATE POLICY "Public verified agents are viewable by authenticated users"
    ON public.transport_agents FOR SELECT
    TO authenticated
    USING (verification_status = 'verified' OR auth.uid() = auth_user_id);

CREATE POLICY "Agents can manage their own profile"
    ON public.transport_agents FOR ALL
    USING (auth.uid() = auth_user_id);

-- Vehicles RLS: Authenticated students can search available vehicles
CREATE POLICY "Available vehicles of verified agents are viewable"
    ON public.vehicles FOR SELECT
    TO authenticated
    USING (
        (availability_status = 'available' AND location_sharing_enabled = TRUE)
        OR agent_id IN (SELECT id FROM public.transport_agents WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Agents can update their vehicle details and location"
    ON public.vehicles FOR ALL
    USING (
        agent_id IN (SELECT id FROM public.transport_agents WHERE auth_user_id = auth.uid())
    );

-- Transport Requests RLS
CREATE POLICY "Students can create transport requests"
    ON public.transport_requests FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid())
        AND agent_id IS NULL
        AND status = 'pending'
    );

CREATE POLICY "Students can view their own requests"
    ON public.transport_requests FOR SELECT
    TO authenticated
    USING (
        student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid())
        OR agent_id IN (SELECT id FROM public.transport_agents WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Agents can update requests assigned to them"
    ON public.transport_requests FOR UPDATE
    TO authenticated
    USING (
        agent_id IN (SELECT id FROM public.transport_agents WHERE auth_user_id = auth.uid())
    )
    WITH CHECK (
        agent_id IN (SELECT id FROM public.transport_agents WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Students can cancel their pending transport requests"
    ON public.transport_requests FOR UPDATE
    TO authenticated
    USING (
        student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid())
        AND agent_id IS NULL
        AND status = 'pending'
    )
    WITH CHECK (
        student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid())
        AND agent_id IS NULL
        AND status IN ('pending', 'cancelled')
    );

CREATE POLICY "Verified agents can view open broadcast requests"
    ON public.transport_requests FOR SELECT
    TO authenticated
    USING (
        agent_id IS NULL
        AND status = 'pending'
        AND EXISTS (
            SELECT 1 FROM public.transport_agents
            WHERE auth_user_id = auth.uid() AND verification_status = 'verified'
        )
    );

CREATE POLICY "Verified agents can claim open broadcast requests"
    ON public.transport_requests FOR UPDATE
    TO authenticated
    USING (
        agent_id IS NULL
        AND status = 'pending'
        AND EXISTS (
            SELECT 1 FROM public.transport_agents
            WHERE auth_user_id = auth.uid() AND verification_status = 'verified'
        )
    )
    WITH CHECK (
        status = 'accepted'
        AND agent_id IN (
            SELECT id FROM public.transport_agents
            WHERE auth_user_id = auth.uid() AND verification_status = 'verified'
        )
    );

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
       AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables
           WHERE pubname = 'supabase_realtime'
             AND schemaname = 'public'
             AND tablename = 'transport_requests'
       ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transport_requests;
    END IF;
END;
$$;

-- Emergency Alerts RLS
CREATE POLICY "Students can create their own emergency alerts"
    ON public.emergency_alerts FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Students can view their own emergency alerts"
    ON public.emergency_alerts FOR SELECT
    TO authenticated
    USING (
        student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid())
    );

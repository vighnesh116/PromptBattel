ALTER TABLE public.transport_requests
    ALTER COLUMN agent_id DROP NOT NULL;

ALTER TABLE public.transport_requests
    ADD COLUMN IF NOT EXISTS bus_presence TEXT
        CHECK (bus_presence IN ('present', 'absent')),
    ADD COLUMN IF NOT EXISTS bus_location TEXT,
    ADD COLUMN IF NOT EXISTS bus_eta_minutes INTEGER
        CHECK (bus_eta_minutes IS NULL OR bus_eta_minutes >= 0),
    ADD COLUMN IF NOT EXISTS max_wait_minutes INTEGER
        CHECK (max_wait_minutes IS NULL OR max_wait_minutes >= 0),
    ADD COLUMN IF NOT EXISTS request_radius_km INTEGER NOT NULL DEFAULT 10
        CHECK (request_radius_km BETWEEN 1 AND 20);

CREATE INDEX IF NOT EXISTS idx_requests_open_pickup
    ON public.transport_requests (status, pickup_latitude, pickup_longitude)
    WHERE agent_id IS NULL;

DROP POLICY IF EXISTS "Students can create transport requests"
    ON public.transport_requests;
CREATE POLICY "Students can create transport requests"
    ON public.transport_requests FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid())
        AND agent_id IS NULL
        AND status = 'pending'
    );

DROP POLICY IF EXISTS "Agents can update requests assigned to them"
    ON public.transport_requests;
CREATE POLICY "Agents can update requests assigned to them"
    ON public.transport_requests FOR UPDATE
    TO authenticated
    USING (
        agent_id IN (SELECT id FROM public.transport_agents WHERE auth_user_id = auth.uid())
    )
    WITH CHECK (
        agent_id IN (SELECT id FROM public.transport_agents WHERE auth_user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Students can cancel their pending transport requests"
    ON public.transport_requests;
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

DROP POLICY IF EXISTS "Verified agents can view open broadcast requests"
    ON public.transport_requests;
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

DROP POLICY IF EXISTS "Verified agents can claim open broadcast requests"
    ON public.transport_requests;
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

// Core database types matching the Supabase schema

export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type VehicleType = 'auto-rickshaw' | 'car' | 'van' | 'minibus' | 'other';
export type AvailabilityStatus = 'available' | 'unavailable';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
export type AlertStatus = 'pending' | 'sent' | 'partially_sent' | 'failed';
export type EmailDeliveryStatus = 'pending' | 'sent' | 'failed';
export type UserRole = 'student' | 'agent';

export interface Student {
  id: string;
  auth_user_id: string;
  full_name: string;
  student_id: string;
  phone: string;
  email: string;
  college_name: string;
  college_email: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  student_id: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  college_email: string;
  created_at: string;
  updated_at: string;
}

export interface TransportAgent {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string;
  email: string;
  service_area: string;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  agent_id: string;
  vehicle_type: VehicleType;
  registration_number: string;
  vehicle_description: string;
  availability_status: AvailabilityStatus;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
  location_updated_at: string | null;
  location_sharing_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransportRequest {
  id: string;
  student_id: string;
  agent_id: string | null;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_address: string | null;
  request_radius_km?: number | null;
  bus_presence?: 'present' | 'absent' | null;
  bus_location?: string | null;
  bus_eta_minutes?: number | null;
  max_wait_minutes?: number | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface EmergencyAlert {
  id: string;
  student_id: string;
  latitude: number;
  longitude: number;
  location_accuracy: number | null;
  location_address: string | null;
  reason: string;
  alert_status: AlertStatus;
  parent_email_status: EmailDeliveryStatus;
  college_email_status: EmailDeliveryStatus;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  recipient_type: string;
  recipient_email: string;
  notification_type: string;
  related_alert_id: string | null;
  delivery_status: EmailDeliveryStatus;
  provider_message_id: string | null;
  error_message: string | null;
  created_at: string;
}

// Extended types with joins
export interface AgentWithVehicle extends TransportAgent {
  vehicles: Vehicle[];
}

export interface NearbyAgent {
  agent: TransportAgent;
  vehicle: Vehicle;
  distance_km: number;
}

export interface TransportRequestWithDetails extends TransportRequest {
  student?: Student;
  agent?: TransportAgent;
  vehicle?: Vehicle;
}

// Location types
export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  isManual?: boolean;
}

export interface LocationState {
  location: GPSLocation | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

// Auth context types
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface StudentProfile extends Student {
  emergencyContact?: EmergencyContact;
}

export interface AgentProfile extends TransportAgent {
  vehicles: Vehicle[];
}

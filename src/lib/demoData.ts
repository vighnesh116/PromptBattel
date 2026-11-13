/**
 * RESQ-AI Demo Data
 * Clearly labelled as fictional data for demonstration purposes.
 * These are NOT real people or vehicles.
 */

import type { Student, EmergencyContact, TransportAgent, Vehicle, TransportRequest, EmergencyAlert } from '../types';

// Demo rural town: Ratnagiri district, Maharashtra (approximate coordinates)
const BASE_LAT = 16.9902;
const BASE_LON = 73.3120;

function offsetCoord(lat: number, lon: number, dlat: number, dlon: number) {
  return { latitude: lat + dlat, longitude: lon + dlon };
}

export const DEMO_AGENTS: TransportAgent[] = [
  {
    id: 'demo-agent-1',
    auth_user_id: 'demo-auth-1',
    full_name: 'Ramesh Patil',
    phone: '9876543210',
    email: 'ramesh.patil@demo.resqai',
    service_area: 'Ratnagiri – Khed Route',
    verification_status: 'verified',
    created_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-agent-2',
    auth_user_id: 'demo-auth-2',
    full_name: 'Suresh Kumar',
    phone: '9765432109',
    email: 'suresh.kumar@demo.resqai',
    service_area: 'Ratnagiri – Sangameshwar Route',
    verification_status: 'verified',
    created_at: new Date(Date.now() - 45 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-agent-3',
    auth_user_id: 'demo-auth-3',
    full_name: 'Vijay Desai',
    phone: '9654321098',
    email: 'vijay.desai@demo.resqai',
    service_area: 'Chiplun – Ratnagiri Route',
    verification_status: 'verified',
    created_at: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-agent-4',
    auth_user_id: 'demo-auth-4',
    full_name: 'Priya Sawant',
    phone: '9543210987',
    email: 'priya.sawant@demo.resqai',
    service_area: 'Dapoli – Ratnagiri Route',
    verification_status: 'verified',
    created_at: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-agent-5',
    auth_user_id: 'demo-auth-5',
    full_name: 'Mohan Gawde',
    phone: '9432109876',
    email: 'mohan.gawde@demo.resqai',
    service_area: 'Ratnagiri Local',
    verification_status: 'pending',
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'demo-vehicle-1',
    agent_id: 'demo-agent-1',
    vehicle_type: 'auto-rickshaw',
    registration_number: 'MH-08-AB-1234',
    vehicle_description: 'Yellow auto-rickshaw, comfortable for 3 passengers',
    availability_status: 'available',
    ...offsetCoord(BASE_LAT, BASE_LON, 0.012, 0.015),
    location_accuracy: 10,
    location_updated_at: new Date(Date.now() - 5 * 60000).toISOString(),
    location_sharing_enabled: true,
    created_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-vehicle-2',
    agent_id: 'demo-agent-2',
    vehicle_type: 'van',
    registration_number: 'MH-08-CD-5678',
    vehicle_description: 'White Tempo Traveller, seats up to 7 passengers',
    availability_status: 'available',
    ...offsetCoord(BASE_LAT, BASE_LON, -0.018, 0.022),
    location_accuracy: 15,
    location_updated_at: new Date(Date.now() - 8 * 60000).toISOString(),
    location_sharing_enabled: true,
    created_at: new Date(Date.now() - 45 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-vehicle-3',
    agent_id: 'demo-agent-3',
    vehicle_type: 'car',
    registration_number: 'MH-08-EF-9012',
    vehicle_description: 'Silver Maruti Swift Dzire, AC, up to 4 passengers',
    availability_status: 'available',
    ...offsetCoord(BASE_LAT, BASE_LON, 0.025, -0.030),
    location_accuracy: 8,
    location_updated_at: new Date(Date.now() - 3 * 60000).toISOString(),
    location_sharing_enabled: true,
    created_at: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-vehicle-4',
    agent_id: 'demo-agent-4',
    vehicle_type: 'minibus',
    registration_number: 'MH-08-GH-3456',
    vehicle_description: 'Blue mini-bus, seats 12 passengers, rural routes',
    availability_status: 'unavailable',
    ...offsetCoord(BASE_LAT, BASE_LON, -0.010, -0.018),
    location_accuracy: 20,
    location_updated_at: new Date(Date.now() - 45 * 60000).toISOString(),
    location_sharing_enabled: false,
    created_at: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-vehicle-5',
    agent_id: 'demo-agent-5',
    vehicle_type: 'auto-rickshaw',
    registration_number: 'MH-08-IJ-7890',
    vehicle_description: 'Green auto-rickshaw (pending verification)',
    availability_status: 'available',
    ...offsetCoord(BASE_LAT, BASE_LON, 0.005, 0.040),
    location_accuracy: 12,
    location_updated_at: new Date(Date.now() - 10 * 60000).toISOString(),
    location_sharing_enabled: true,
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_STUDENTS: Student[] = [
  {
    id: 'demo-student-1',
    auth_user_id: 'demo-student-auth-1',
    full_name: 'Ananya Joshi',
    student_id: 'STU-2024-001',
    phone: '9321098765',
    email: 'ananya.joshi@demo.resqai',
    college_name: 'Ratnagiri Government Polytechnic',
    college_email: 'principal@rgnp.edu.in',
    created_at: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-student-2',
    auth_user_id: 'demo-student-auth-2',
    full_name: 'Rahul Naik',
    student_id: 'STU-2024-002',
    phone: '9210987654',
    email: 'rahul.naik@demo.resqai',
    college_name: 'Chiplun College of Commerce',
    college_email: 'admin@chiplunscc.edu.in',
    created_at: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'demo-ec-1',
    student_id: 'demo-student-1',
    parent_name: 'Meera Joshi',
    parent_phone: '9100987654',
    parent_email: 'meera.joshi@demo.resqai',
    college_email: 'principal@rgnp.edu.in',
    created_at: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEMO_LOCATION = {
  latitude: BASE_LAT,
  longitude: BASE_LON,
  accuracy: 15,
  timestamp: Date.now(),
  isManual: false,
};

export const DEMO_TOWN = 'Ratnagiri, Maharashtra (Demo Area)';


/**
 * TypeScript interfaces for ReVil 2026 Backend API
 * Profile Picture & User Data
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  phoneNumber?: string;
  college?: string;
  department?: string;
  checkedIn: boolean;
  checkInTime: Date | null;
  role: "user" | "admin" | "registration-team" | "event-team";
  lastLogin: Date;
  createdAt: Date;
}

export interface UserBasic {
  id: string;
  name: string;
  email: string;
  picture: string;
  checkedIn: boolean;
  checkInTime: Date | null;
  role: "user" | "admin" | "registration-team" | "event-team";
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: number;
  eventType: "workshop" | "talk" | "panel" | "networking";
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  speakers?: string[];
  registeredCount: number;
  isTeamEvent?: boolean;
  teamSize?: {
    min: number;
    max: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  name: string;
  email: string;
  phoneNumber: string;
  college: string;
  department?: string;
  year?: string;
  isLeader: boolean;
}

export interface RegistrationData {
  eventId: string;
  isTeamRegistration: boolean;
  teamName?: string;
  teamMembers?: TeamMember[];
  phoneNumber?: string;
  college?: string;
  department?: string;
  year?: string;
}

export interface Registration {
  _id: string;
  user: string;
  event: Event;
  isTeamRegistration: boolean;
  teamName?: string;
  teamMembers?: TeamMember[];
  phoneNumber?: string;
  college?: string;
  department?: string;
  year?: string;
  qrCode: string;
  qrCodeImage: string;
  registrationStatus: "registered" | "confirmed" | "attended" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  _id: string;
  event: {
    _id: string;
    title: string;
    date: string;
    startTime: string;
    venue: string;
  };
  registrationStatus: "registered" | "confirmed" | "attended" | "cancelled";
  createdAt: Date;
}

export interface UserWithRegistrations {
  user: UserBasic;
  registrations: EventRegistration[];
}

export interface AuthSuccessMessage {
  type: "AUTH_SUCCESS";
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    picture: string;
    role: "user" | "admin" | "registration-team" | "event-team";
    checkedIn: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export type ApiResponse<T> = { success: true; data: T } | ApiErrorResponse;

export type UserRole = 'STUDENT' | 'STAFF' | 'HOD' | 'VICE_PRINCIPAL' | 'PRINCIPAL' | 'ADMIN' | 'ELECTION_COUNCIL';

export type IDStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'EXPIRED';

export type FineStatus = 'PENDING' | 'PAID' | 'WAIVED' | 'CANCELLED';

export type DepartmentCode = 
  | 'CSE' 
  | 'IT' 
  | 'AIDS' 
  | 'ECE' 
  | 'EEE' 
  | 'MECH' 
  | 'CIVIL' 
  | 'BME' 
  | 'CHEM' 
  | 'AERO' 
  | 'CSBS' 
  | 'MBA' 
  | 'MCA' 
  | string;

export interface DepartmentInfo {
  code: string;
  name: string;
  shortName: string;
  iconName?: string;
}

export type PhotoTransmissionRoute = 
  | 'HOD_TO_ALL_STAFF'          // Rule: HOD sends photo -> goes to all staff sections
  | 'VP_TO_HOD_ONLY'            // Rule: VP sends photo -> goes only to HOD section
  | 'STAFF_TO_STAFF_THEN_HOD'   // Rule: Staff sends photo -> goes to all other staff & then to HOD section
  | 'GENERAL_BROADCAST';

export interface CampusCircular {
  id: string;
  circularNumber: string;
  issuerRole: 'HOD' | 'VICE_PRINCIPAL' | 'PRINCIPAL';
  issuerName: string;
  issuerDesignation: string;
  issuerAvatarUrl?: string;
  departmentCode?: DepartmentCode;
  departmentName?: string;
  title: string;
  summary: string;
  content: string;
  issuanceDate: string;
  effectiveDate: string;
  category: 'ACADEMIC' | 'DISCIPLINARY' | 'EXAMINATION' | 'GATE_SECURITY' | 'FACILITY' | 'POLICY' | 'EVENT';
  targetAudience: 'ALL_STUDENTS' | 'ALL_FACULTY' | 'ALL_STAFF' | 'DEPT_SPECIFIC' | 'HODS_ONLY';
  urgency: 'NORMAL' | 'URGENT' | 'HIGH_PRIORITY' | 'MANDATORY';
  attachmentUrl?: string;
  attachmentName?: string;
  isAcknowledged?: boolean;
  acknowledgementCount?: number;
}

export interface StaffHodMessage {
  id: string;
  senderStaffId: string;
  senderStaffName: string;
  senderRole: string;
  targetDepartmentCode: DepartmentCode;
  subject: string;
  message: string;
  studentRegisterNo?: string;
  studentName?: string;
  incidentType: 'GATE_ENTRY_FLAG' | 'UNAUTHORIZED_ABSENCE' | 'DISCIPLINE_ISSUE' | 'GATE_PASS_VERIFICATION' | 'GENERAL_INQUIRY';
  timestamp: string;
  status: 'PENDING_HOD_REVIEW' | 'REVIEWED' | 'ACTION_TAKEN';
  hodReply?: string;
  hodRepliedAt?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  studentId?: string;
  avatarUrl?: string;
  departmentId?: string;
  departmentName?: string;
  designation?: string;
  councilMemberId?: string;
  councilRole?: ElectionCouncilRole;
}

export interface Student {
  id: string;
  registerNumber: string;
  studentIdNumber: string;
  name: string;
  photoUrl: string;
  physicalIdCardUrl?: string;
  departmentId?: string;
  departmentName: string;
  department?: string;
  departmentCode?: string;
  course: string;
  year: number;
  collegeEmail: string;
  phoneNumber: string;
  status: IDStatus;
  validUntil: string;
  validityYear?: string;
  issuedAt?: string;
  qrSecureToken?: string;
  address?: string;
  guardianPhone?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  fines?: Fine[];
}

export interface IDCard {
  id: string;
  studentId: string;
  secureToken: string;
  issuedAt: string;
  expiresAt: string;
  status: IDStatus;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: DepartmentCode;
  hodName: string;
  hodEmail: string;
  hodPhone: string;
  hodPhotoUrl: string;
  studentCount: number;
  description: string;
}

export interface Fine {
  id: string;
  fineNumber: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  amount: number;
  reason: string;
  dueDate: string;
  status: FineStatus;
  createdAt: string;
  paidAt?: string;
  paymentRef?: string;
}

export interface Payment {
  id: string;
  fineId: string;
  studentId: string;
  studentName: string;
  amount: number;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  paymentMethod: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
  paidAt: string;
}

export type ScanResultType = 'SUCCESS' | 'DENIED' | 'LATE' | 'EXPIRED' | 'SUSPENDED' | 'BANNED' | 'INVALID_TOKEN' | 'INACTIVE';

export interface VerificationLog {
  id: string;
  studentId: string;
  registerNumber: string;
  studentName: string;
  departmentName: string;
  photoUrl: string;
  capturedThumbnailUrl?: string;
  verifiedBy: string;
  verifierName: string;
  result: IDStatus | 'INVALID_TOKEN' | 'LATE' | 'SUCCESS' | 'DENIED' | string;
  scanStatus?: ScanResultType;
  scanEvent?: string;
  location: string;
  timestamp: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'STUDENT' | 'ID_CARD' | 'FINE' | 'PAYMENT' | 'DEPARTMENT' | 'SYSTEM' | 'ACCOUNT_CREATE' | 'PHOTO_SHARE';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress: string;
  createdAt: string;
}

export type PhotoAudience = 'ALL' | 'FACULTY_ONLY' | 'DEPT_ONLY' | 'HOD_VP_CONFIDENTIAL';

export interface HodVpPost {
  id: string;
  authorName: string;
  authorRole: 'VICE_PRINCIPAL' | 'HOD' | 'STAFF' | 'ADMIN';
  department?: string;
  departmentCode?: DepartmentCode;
  authorPhotoUrl: string;
  title: string;
  content: string;
  photoUrl?: string;
  attachmentName?: string;
  visibility: PhotoAudience;
  transmissionRoute?: PhotoTransmissionRoute;
  routedToSummary?: string;
  isConfidential?: boolean;
  likesCount: number;
  createdAt: string;
}

export interface StudentOnboardingPayload {
  name: string;
  registerNumber: string;
  departmentCode: DepartmentCode;
  course: string;
  year: number;
  collegeEmail: string;
  phoneNumber: string;
  passportPhotoUrl: string;
  physicalIdCardUrl: string;
  bloodGroup: string;
  guardianPhone: string;
  address?: string;
}

export interface StaffAccountPayload {
  name: string;
  email: string;
  phoneNumber: string;
  role: 'STAFF' | 'HOD' | 'VICE_PRINCIPAL';
  departmentCode?: DepartmentCode;
  designation: string;
  avatarUrl?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  department?: DepartmentCode | 'ALL';
  topic?: string;
  codeSnippet?: string;
  imageUrl?: string;
  groundingChunks?: Array<{ title?: string; uri?: string }>;
  model?: string;
  liked?: boolean;
  disliked?: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  department: DepartmentCode;
  subject: string;
  type: 'REVISION_NOTES' | 'QUESTION_BANK' | 'LAB_MANUAL' | 'CHEAT_SHEET' | 'VIVA_PREP';
  content: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type IdeaCategory = 
  | 'FINAL_YEAR_PROJECT' 
  | 'DATA_SCIENCE_PIPELINE' 
  | 'RESEARCH_PAPER' 
  | 'HACKATHON_MVP' 
  | 'PATENT_INNOVATION' 
  | 'INDUSTRY_CASE_STUDY';

export interface GeneratedIdea {
  id: string;
  title: string;
  domain: string;
  department: DepartmentCode;
  category: IdeaCategory;
  problemStatement: string;
  technicalArchitecture: string;
  techStack: string[];
  datasetSources: string[];
  algorithmPipeline: string;
  expectedOutcome: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Industry-Grade';
  estimatedTimeline: string;
  vivaDiscussionPoints: string[];
  markdownReport?: string;
  createdAt: string;
}

export interface IdeaGenerateRequest {
  department: DepartmentCode;
  domain: string;
  category: IdeaCategory;
  complexity?: string;
  teamSize?: number;
  customKeywords?: string;
}

export type AuthorityTarget = 'HOD' | 'VICE_PRINCIPAL' | 'PRINCIPAL' | 'STUDENT_COUNCIL';

export type ElectionCouncilRole = 
  | 'CHAIRPERSON' 
  | 'VICE_CHAIRPERSON' 
  | 'PRESIDENT' 
  | 'VICE_PRESIDENT' 
  | 'SECRETARY_1' 
  | 'SECRETARY_2';

export interface ElectionMember {
  id: string;
  roleNumber: number;
  role: ElectionCouncilRole;
  designationTitle: string; // e.g., "1 - Chairperson", "2 - Vice Chairperson", etc.
  name: string;
  registerNumber: string;
  department: DepartmentCode;
  year: number;
  photoUrl: string;
  email: string;
  phone: string;
  manifesto: string;
  officeHours: string;
  status: 'ONLINE' | 'IN_SESSION' | 'OFFLINE';
  activeInquiriesCount: number;
  resolvedInquiriesCount: number;
  badges: string[];
}

export type InquiryCategory = 
  | 'ACADEMIC' 
  | 'FINE_APPEAL' 
  | 'CAMPUS_FACILITIES' 
  | 'ELECTION_COUNCIL' 
  | 'EXAMINATION' 
  | 'DISCIPLINE' 
  | 'HOSTEL_MESS' 
  | 'GENERAL';

export type InquiryStatus = 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface InquiryChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'STUDENT' | 'HOD' | 'VICE_PRINCIPAL' | 'COUNCIL_MEMBER' | 'ADMIN';
  message: string;
  photoUrl?: string;
  timestamp: string;
}

export interface StudentInquiry {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: DepartmentCode;
  targetAuthority: AuthorityTarget;
  targetDepartmentCode?: DepartmentCode;
  targetCouncilMemberId?: string;
  targetCouncilRole?: ElectionCouncilRole;
  category: InquiryCategory;
  subject: string;
  message: string;
  capturedPhotoUrl?: string;
  status: InquiryStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  adminResponse?: string;
  responderName?: string;
  responderRole?: string;
  createdAt: string;
  updatedAt: string;
  chatThread?: InquiryChatMessage[];
}

export type PropertyType = 
  | 'Apartment' 
  | 'Studio' 
  | 'Shared PG / Hostel' 
  | 'Villa' 
  | 'Independent House' 
  | 'Study Room';

export interface Property {
  id: string;
  userId: string; // Lister's Supabase Auth user ID
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  title: string;
  description: string;
  price: number;
  pricePeriod?: 'month' | 'semester' | 'year' | 'total';
  location: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  likesCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SavedProperty {
  id: string;
  userId: string; // Supabase user ID who saved it
  propertyId: string;
  createdAt: string;
  property?: Property;
}



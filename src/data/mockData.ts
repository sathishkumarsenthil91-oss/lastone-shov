import { Student, Department, Fine, Payment, VerificationLog, AuditLog, HodVpPost, User, StudyMaterial, ElectionMember, StudentInquiry, Property, StaffHodMessage } from '../types';

export const rohitKumarPhoto = '/images/rohit_kumar_id_photo_1787039178779.jpg';
export const avsCampusPhoto = '/images/avs_college_campus.jpg';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-it',
    name: 'Information Technology',
    code: 'IT',
    hodName: 'Dr. Sarah Jenkins',
    hodEmail: 'hod.it@avsct.edu.in',
    hodPhone: '+91 98765 11001',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    studentCount: 360,
    description: 'Enterprise Cloud Architecture, Full-Stack Web Technologies, Cybersecurity, Distributed Systems & DevOps.'
  },
  {
    id: 'dept-cse',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    hodName: 'Dr. Aris Thorne',
    hodEmail: 'hod.cse@avsct.edu.in',
    hodPhone: '+91 98765 11002',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    studentCount: 420,
    description: 'Algorithms & Data Structures, Systems Architecture, Computer Networks, Operating Systems, Compilers & Cryptography.'
  },
  {
    id: 'dept-aids',
    name: 'Artificial Intelligence & Data Science',
    code: 'AIDS',
    hodName: 'Dr. Vikramaditya Sen',
    hodEmail: 'hod.aids@avsct.edu.in',
    hodPhone: '+91 98765 11003',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    studentCount: 320,
    description: 'Deep Learning, Neural Networks, Computer Vision, Natural Language Processing, Big Data Analytics & Generative AI.'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-principal-1',
    username: 'principal',
    name: 'Dr. J. Davis',
    email: 'principal@avsct.edu.in',
    phoneNumber: '+91 98765 00001',
    role: 'PRINCIPAL',
    designation: 'Principal & Head of Institution',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-vp-1',
    username: 'vice_principal',
    name: 'Dr. Elizabeth Montgomery',
    email: 'vp.academic@avsct.edu.in',
    phoneNumber: '+91 98765 00010',
    role: 'VICE_PRINCIPAL',
    designation: 'Vice Principal & Academic Dean',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-hod-cse',
    username: 'hod_cse',
    name: 'Dr. Aris Thorne',
    email: 'hod.cse@avsct.edu.in',
    phoneNumber: '+91 98765 11002',
    role: 'HOD',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    designation: 'Head of Department (CSE)',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-hod-it',
    username: 'hod_it',
    name: 'Dr. Sarah Jenkins',
    email: 'hod.it@avsct.edu.in',
    phoneNumber: '+91 98765 11001',
    role: 'HOD',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    designation: 'Head of Department (IT)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-hod-aids',
    username: 'hod_aids',
    name: 'Dr. Vikramaditya Sen',
    email: 'hod.aids@avsct.edu.in',
    phoneNumber: '+91 98765 11003',
    role: 'HOD',
    departmentId: 'dept-aids',
    departmentName: 'Artificial Intelligence & Data Science',
    designation: 'Head of Department (AIDS)',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-staff-1',
    username: 'security_lead',
    name: 'Officer Marcus Vance',
    email: 'm.vance@security.avsct.edu.in',
    phoneNumber: '+91 98765 99001',
    role: 'STAFF',
    designation: 'Chief Security Officer & Proctor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-student-1',
    username: '23cs001',
    name: 'Rohit Kumar',
    email: 'rohit.kumar@avsct.edu.in',
    phoneNumber: '+91 98765 43210',
    role: 'STUDENT',
    studentId: 'STU-10001',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    designation: 'B.E. Computer Science - 3rd Year',
    avatarUrl: rohitKumarPhoto,
  },
  {
    id: 'u-student-it',
    username: '23it015',
    name: 'Rohan Mehra',
    email: 'rohan.23it015@student.avsct.edu.in',
    phoneNumber: '+91 98765 00015',
    role: 'STUDENT',
    studentId: 'STU-10003',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    designation: 'B.Tech IT - 3rd Year',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-student-aids',
    username: '24ad007',
    name: 'Kavya Reddy',
    email: 'kavya.24ad007@student.avsct.edu.in',
    phoneNumber: '+91 98765 00045',
    role: 'STUDENT',
    studentId: 'STU-10004',
    departmentId: 'dept-aids',
    departmentName: 'Artificial Intelligence & Data Science',
    designation: 'B.Tech AIDS - 2nd Year',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-admin-1',
    username: 'admin',
    name: 'Robert Harrison',
    email: 'admin@avsct.edu.in',
    phoneNumber: '+91 98765 00000',
    role: 'ADMIN',
    designation: 'System Administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-council-1',
    username: '22cs004',
    name: 'Aaradhya Saxena',
    email: 'chairperson.council@student.avsct.edu.in',
    phoneNumber: '+91 98765 44001',
    role: 'ELECTION_COUNCIL',
    studentId: 'st-008',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    designation: '1 - Chairperson (Student Council)',
    councilMemberId: 'em-1',
    councilRole: 'CHAIRPERSON',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-council-2',
    username: '22it018',
    name: 'Devendra Nair',
    email: 'vicechair.council@student.shov.college.edu',
    phoneNumber: '+91 98765 44002',
    role: 'ELECTION_COUNCIL',
    studentId: 'st-009',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    designation: '2 - Vice Chairperson (Student Council)',
    councilMemberId: 'em-2',
    councilRole: 'VICE_CHAIRPERSON',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-council-3',
    username: '22ad009',
    name: 'Karthik Subramanian',
    email: 'president.council@student.shov.college.edu',
    phoneNumber: '+91 98765 44003',
    role: 'ELECTION_COUNCIL',
    studentId: 'st-010',
    departmentId: 'dept-aids',
    departmentName: 'Artificial Intelligence & Data Science',
    designation: '3 - President (Student Council)',
    councilMemberId: 'em-3',
    councilRole: 'PRESIDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-council-4',
    username: '23cs022',
    name: 'Pooja Vishwanathan',
    email: 'vicepres.council@student.shov.college.edu',
    phoneNumber: '+91 98765 44004',
    role: 'ELECTION_COUNCIL',
    studentId: 'st-011',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    designation: '4 - Vice President (Student Council)',
    councilMemberId: 'em-4',
    councilRole: 'VICE_PRESIDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-council-5',
    username: '23it041',
    name: 'Tanmay Kulkarni',
    email: 'sec1.council@student.shov.college.edu',
    phoneNumber: '+91 98765 44005',
    role: 'ELECTION_COUNCIL',
    studentId: 'st-012',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    designation: '5 - Secretary 1 (Student Council)',
    councilMemberId: 'em-5',
    councilRole: 'SECRETARY_1',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'u-council-6',
    username: '23ad031',
    name: 'Sneha Roy',
    email: 'sec2.council@student.shov.college.edu',
    phoneNumber: '+91 98765 44006',
    role: 'ELECTION_COUNCIL',
    studentId: 'st-013',
    departmentId: 'dept-aids',
    departmentName: 'Artificial Intelligence & Data Science',
    designation: '6 - Secretary 2 (Student Council)',
    councilMemberId: 'em-6',
    councilRole: 'SECRETARY_2',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'st-001',
    registerNumber: '23CS001',
    studentIdNumber: 'STU-10001',
    name: 'Rohit Kumar',
    photoUrl: rohitKumarPhoto,
    physicalIdCardUrl: avsCampusPhoto,
    departmentId: 'dept-cse',
    departmentName: 'Computer Science',
    course: 'B.E. Computer Science',
    year: 3,
    collegeEmail: 'rohit.kumar@avsct.edu.in',
    phoneNumber: '98765 43210',
    status: 'ACTIVE',
    validUntil: '31-05-2027',
    issuedAt: '01-08-2023',
    qrSecureToken: 'SHOV-SEC-TOK-9843-23CS001',
    dateOfBirth: '15-06-2004',
    address: 'AVS College Hostel Block A, Room 204, Salem',
    guardianPhone: '+91 98765 12345',
    bloodGroup: 'O+'
  },
  {
    id: 'st-002',
    registerNumber: '23CS020',
    studentIdNumber: 'STU-10020',
    name: 'Priya Patel',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    physicalIdCardUrl: avsCampusPhoto,
    departmentId: 'dept-cse',
    departmentName: 'Computer Science',
    course: 'B.E. Computer Science',
    year: 3,
    collegeEmail: 'priya.23cs020@avsct.edu.in',
    phoneNumber: '98765 00020',
    status: 'ACTIVE',
    validUntil: '31-05-2027',
    issuedAt: '01-08-2023',
    qrSecureToken: 'SHOV-SEC-TOK-4412-23CS020',
    dateOfBirth: '22-11-2004',
    address: '15 Harmony Enclave, Green Park, Salem',
    guardianPhone: '+91 98222 33445',
    bloodGroup: 'A+'
  },
  {
    id: 'st-003',
    registerNumber: '23IT015',
    studentIdNumber: 'STU-10015',
    name: 'Rohan Mehra',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    physicalIdCardUrl: avsCampusPhoto,
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    course: 'B.Tech IT',
    year: 3,
    collegeEmail: 'rohan.23it015@avsct.edu.in',
    phoneNumber: '98765 00015',
    status: 'ACTIVE',
    validUntil: '31-05-2027',
    issuedAt: '01-08-2023',
    qrSecureToken: 'SHOV-SEC-TOK-7721-23IT015',
    dateOfBirth: '10-03-2004',
    address: '78 Cloud Heights, Salem',
    guardianPhone: '+91 98333 44556',
    bloodGroup: 'B+'
  },
  {
    id: 'st-004',
    registerNumber: '24AD007',
    studentIdNumber: 'STU-10045',
    name: 'Kavya Reddy',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    physicalIdCardUrl: avsCampusPhoto,
    departmentId: 'dept-aids',
    departmentName: 'Artificial Intelligence & Data Science',
    course: 'B.Tech AI & Data Science',
    year: 2,
    collegeEmail: 'kavya.24ad007@avsct.edu.in',
    phoneNumber: '98765 00045',
    status: 'ACTIVE',
    validUntil: '31-05-2028',
    issuedAt: '01-08-2024',
    qrSecureToken: 'SHOV-SEC-TOK-5588-24AD007',
    dateOfBirth: '05-08-2005',
    address: '56 Neural Way, Salem',
    guardianPhone: '+91 98666 77889',
    bloodGroup: 'B+'
  },
  {
    id: 'st-005',
    registerNumber: '23IT044',
    studentIdNumber: 'STU-10044',
    name: 'Vikram Joshi',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
    physicalIdCardUrl: avsCampusPhoto,
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    course: 'B.Tech IT',
    year: 3,
    collegeEmail: 'vikram.23it044@avsct.edu.in',
    phoneNumber: '98765 00044',
    status: 'SUSPENDED',
    validUntil: '31-05-2027',
    issuedAt: '01-08-2023',
    qrSecureToken: 'SHOV-SEC-TOK-3309-23IT044',
    dateOfBirth: '18-09-2004',
    address: '88 Executive Campus Towers, Salem',
    guardianPhone: '+91 98555 66778',
    bloodGroup: 'AB+'
  },
  {
    id: 'st-006',
    registerNumber: '23CS099',
    studentIdNumber: 'STU-10099',
    name: 'Banned Test Record',
    photoUrl: rohitKumarPhoto,
    physicalIdCardUrl: avsCampusPhoto,
    departmentId: 'dept-cse',
    departmentName: 'Computer Science',
    course: 'B.E. Computer Science',
    year: 3,
    collegeEmail: 'test.banned@avsct.edu.in',
    phoneNumber: '98765 00012',
    status: 'BANNED',
    validUntil: '31-05-2027',
    issuedAt: '01-08-2023',
    qrSecureToken: 'SHOV-SEC-TOK-1190-22AD012',
    dateOfBirth: '15-06-2004',
    address: 'Block C-12, Salem',
    guardianPhone: '+91 98444 55667',
    bloodGroup: 'AB+'
  }
];

export const INITIAL_FINES: Fine[] = [
  {
    id: 'fn-001',
    fineNumber: 'FN-2026-0811',
    studentId: 'st-001',
    studentName: 'Aarav Sharma',
    registerNumber: '23CS001',
    amount: 150,
    reason: 'Library book return delay (Advanced Data Structures in C++)',
    dueDate: '2026-08-20',
    status: 'PENDING',
    createdAt: '2026-08-05'
  },
  {
    id: 'fn-002',
    fineNumber: 'FN-2026-0812',
    studentId: 'st-001',
    studentName: 'Aarav Sharma',
    registerNumber: '23CS001',
    amount: 350,
    reason: 'Computing Lab hardware station cable accidental damage',
    dueDate: '2026-08-25',
    status: 'PENDING',
    createdAt: '2026-08-08'
  },
  {
    id: 'fn-003',
    fineNumber: 'FN-2026-0790',
    studentId: 'st-002',
    studentName: 'Priya Patel',
    registerNumber: '23CS020',
    amount: 500,
    reason: 'Late campus gate curfew entry check-in fine',
    dueDate: '2026-08-10',
    status: 'PAID',
    createdAt: '2026-07-28',
    paidAt: '2026-08-01',
    paymentRef: 'PAY-ORD-98231-SUCCESS'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    fineId: 'fn-003',
    studentId: 'st-002',
    studentName: 'Priya Patel',
    amount: 500,
    gatewayOrderId: 'ORD-RAZOR-99120',
    gatewayPaymentId: 'pay_M89aXzL029kQ',
    paymentMethod: 'UPI (priya@okicici)',
    status: 'SUCCESS',
    createdAt: '2026-08-01 14:22:10',
    paidAt: '2026-08-01 14:22:15'
  }
];

export const INITIAL_VERIFICATION_LOGS: VerificationLog[] = [
  {
    id: 'ver-101',
    studentId: 'st-001',
    registerNumber: '23CS001',
    studentName: 'Aarav Sharma',
    departmentName: 'Computer Science & Engineering',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    verifiedBy: 'u-staff-1',
    verifierName: 'Officer Marcus Vance',
    result: 'ACTIVE',
    scanStatus: 'SUCCESS',
    scanEvent: 'Morning Gate Entrance',
    location: 'Main Gate Gatehouse #1',
    timestamp: '2026-08-14 08:30:12',
    notes: 'Access Granted - Active Digital ID Verified'
  },
  {
    id: 'ver-102',
    studentId: 'st-003',
    registerNumber: '23IT015',
    studentName: 'Rohan Mehra',
    departmentName: 'Information Technology',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    verifiedBy: 'u-staff-1',
    verifierName: 'Officer Marcus Vance',
    result: 'ACTIVE',
    scanStatus: 'SUCCESS',
    scanEvent: 'Cloud Lab Access',
    location: 'IT Tower Gate #3',
    timestamp: '2026-08-14 09:10:00',
    notes: 'Access Granted - Valid High Security Token'
  },
  {
    id: 'ver-103',
    studentId: 'st-004',
    registerNumber: '24AD007',
    studentName: 'Kavya Reddy',
    departmentName: 'Artificial Intelligence & Data Science',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    verifiedBy: 'u-staff-1',
    verifierName: 'Officer Marcus Vance',
    result: 'ACTIVE',
    scanStatus: 'SUCCESS',
    scanEvent: 'AI Supercomputing Lab Scan',
    location: 'Neural Systems Lab',
    timestamp: '2026-08-14 09:45:00',
    notes: 'Access Granted - Verified Biometric Token'
  },
  {
    id: 'ver-104',
    studentId: 'st-005',
    registerNumber: '23IT044',
    studentName: 'Vikram Joshi',
    departmentName: 'Information Technology',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    verifiedBy: 'u-staff-1',
    verifierName: 'Officer Marcus Vance',
    result: 'SUSPENDED',
    scanStatus: 'DENIED',
    scanEvent: 'Library Entry Check',
    location: 'Central Library Entrance',
    timestamp: '2026-08-14 10:15:40',
    notes: 'Access Denied - Disciplinary Suspension Active'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    userId: 'u-vp-1',
    userName: 'Dr. Elizabeth Montgomery (VP)',
    userRole: 'VICE_PRINCIPAL',
    action: 'POLICY_UPDATE',
    entityType: 'SYSTEM',
    entityId: 'sec-policy-2026',
    newValue: 'Mandatory Digital ID Gate Check for IT, CSE, AIDS',
    reason: 'Academic Year 2026-27 Security Compliance',
    ipAddress: '192.168.1.10',
    createdAt: '2026-08-14 08:00:00'
  },
  {
    id: 'aud-002',
    userId: 'u-hod-cse',
    userName: 'Dr. Aris Thorne (HOD CSE)',
    userRole: 'HOD',
    action: 'PHOTO_SHARE',
    entityType: 'PHOTO_SHARE',
    entityId: 'post-1',
    newValue: 'New GPU Cluster Assembly Photo Shared',
    reason: 'Department facility update for students & faculty',
    ipAddress: '192.168.1.22',
    createdAt: '2026-08-14 09:30:00'
  }
];

export const INITIAL_HOD_VP_POSTS: HodVpPost[] = [
  {
    id: 'post-1',
    authorName: 'Dr. Elizabeth Montgomery',
    authorRole: 'VICE_PRINCIPAL',
    department: 'Campus Governance & Academic Affairs',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    title: 'Semester Mid-Term Guidelines & Digital ID Gate Compliance',
    content: 'All faculty, security teams, and students across IT, CSE, and AIDS departments: Please ensure dynamic QR codes are ready when entering through the Main North & South gatehouses.',
    photoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    attachmentName: 'SHOV_Campus_Security_Circular_2026.pdf',
    visibility: 'ALL',
    isConfidential: false,
    likesCount: 38,
    createdAt: '2026-08-14 08:30:00'
  },
  {
    id: 'post-2',
    authorName: 'Dr. Vikramaditya Sen',
    authorRole: 'HOD',
    department: 'Artificial Intelligence & Data Science',
    departmentCode: 'AIDS',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    title: 'Inauguration of the SHOV NVIDIA Generative AI Supercomputing Cluster',
    content: 'We are thrilled to share glimpses from this morning\'s ribbon-cutting for the new AIDS GPU Computing Farm with Vice Principal Dr. Montgomery and faculty leads.',
    photoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    attachmentName: 'AIDS_GPU_Allocation_Matrix.pdf',
    visibility: 'ALL',
    isConfidential: false,
    likesCount: 52,
    createdAt: '2026-08-13 14:15:00'
  },
  {
    id: 'post-3',
    authorName: 'Dr. Sarah Jenkins',
    authorRole: 'HOD',
    department: 'Information Technology',
    departmentCode: 'IT',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    title: 'Confidential: IT Department Faculty Performance & Infrastructure Review',
    content: 'Minutes of meeting and audit reports shared directly with the Vice Principal and IT professors. Action items include AWS Cloud sandbox upgrades.',
    photoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800',
    visibility: 'HOD_VP_CONFIDENTIAL',
    isConfidential: true,
    likesCount: 14,
    createdAt: '2026-08-12 11:00:00'
  },
  {
    id: 'post-4',
    authorName: 'Dr. Aris Thorne',
    authorRole: 'HOD',
    department: 'Computer Science & Engineering',
    departmentCode: 'CSE',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    title: 'CSE Hackathon 2026 Project Showcase & Winning Prototypes',
    content: 'Heartiest congratulations to the 3rd year CSE winners! Their decentralized campus identity security architecture demonstrated exceptional cryptography skills.',
    photoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
    visibility: 'ALL',
    isConfidential: false,
    likesCount: 64,
    createdAt: '2026-08-11 16:45:00'
  }
];

export const INITIAL_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'sm-it-1',
    title: 'Cloud Infrastructure & Microservices Architecture',
    department: 'IT',
    subject: 'Cloud Computing & Distributed Systems',
    type: 'REVISION_NOTES',
    content: `### Unit 1: Cloud Service Models & Containerization
1. **IaaS vs PaaS vs SaaS**:
   - **IaaS**: Provision fundamental computing resources (AWS EC2, Google Compute Engine). Full OS control.
   - **PaaS**: Execution environment for applications without OS management (AWS Elastic Beanstalk, Google App Engine).
   - **SaaS**: End-user accessible software (Google Workspace, Office 365).

2. **Docker & Kubernetes Essentials**:
   - **Container**: Lightweight, standalone package containing code + dependencies sharing OS kernel.
   - **Kubernetes Pod**: The smallest deployable computing unit consisting of 1 or more tightly coupled containers.
   - **Service Discovery & Ingress**: Routing external traffic via Layer 7 load balancers to internal cluster ClusterIPs.`,
    createdAt: '2026-08-10'
  },
  {
    id: 'sm-cse-1',
    title: 'Advanced Graph Algorithms & Time Complexity Sheet',
    department: 'CSE',
    subject: 'Data Structures & Algorithms',
    type: 'CHEAT_SHEET',
    content: `### Core Graph Traversal & Shortest Path Matrix
| Algorithm | Time Complexity | Space Complexity | Graph Type | Primary Use Case |
|---|---|---|---|---|
| **Dijkstra** | $O((V + E) \\log V)$ | $O(V)$ | Directed/Undirected (No negative weights) | Single-source shortest path |
| **Bellman-Ford** | $O(V \\cdot E)$ | $O(V)$ | Any (Detects negative cycles) | Currency arbitrage, routing protocols |
| **Floyd-Warshall** | $O(V^3)$ | $O(V^2)$ | All pairs (No negative cycles) | Dense network routing matrix |
| **Kruskal's MST** | $O(E \\log E)$ | $O(V)$ | Undirected weighted graph | Minimum Spanning Tree via Union-Find |
| **Prim's MST** | $O(E \\log V)$ | $O(V)$ | Undirected weighted graph | Dense graph spanning tree via Min-Heap |`,
    createdAt: '2026-08-09'
  },
  {
    id: 'sm-aids-1',
    title: 'Deep Learning Architectures: Transformers vs CNNs vs RNNs',
    department: 'AIDS',
    subject: 'Deep Learning & Neural Networks',
    type: 'QUESTION_BANK',
    content: `### University Model Exam Questions (16-Marks)
**Q1: Detail the Self-Attention Mechanism in the Transformer Architecture with Mathematical Proof.**
*Answer Outline:*
1. **Query, Key, Value Projections**:
   $$Q = XW^Q, \\quad K = XW^K, \\quad V = XW^V$$
2. **Scaled Dot-Product Attention Formula**:
   $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$
   *Explanation of scaling factor $\\sqrt{d_k}$ to prevent gradient vanishing in large dimensions.*
3. **Multi-Head Attention**:
   Allows the model to jointly attend to information at different positions from distinct representation subspaces.`,
    createdAt: '2026-08-08'
  }
];

export const INITIAL_ELECTION_MEMBERS: ElectionMember[] = [
  {
    id: 'em-1',
    roleNumber: 1,
    role: 'CHAIRPERSON',
    designationTitle: '1 - Chairperson',
    name: 'Aaradhya Saxena',
    registerNumber: '22CS004',
    department: 'CSE',
    year: 4,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    email: 'chairperson.council@student.shov.college.edu',
    phone: '+91 98765 44001',
    manifesto: 'Empowering students through transparent academic policies, 24/7 library & lab access, and direct grievance escalation to Vice Principal & HODs.',
    officeHours: 'Mon - Fri: 4:00 PM - 6:00 PM (Council Chamber 201)',
    status: 'ONLINE',
    activeInquiriesCount: 3,
    resolvedInquiriesCount: 48,
    badges: ['Elected Council Head', 'Academic Committee', 'Hostel Board Lead']
  },
  {
    id: 'em-2',
    roleNumber: 2,
    role: 'VICE_CHAIRPERSON',
    designationTitle: '2 - Vice Chairperson',
    name: 'Devendra Nair',
    registerNumber: '22IT018',
    department: 'IT',
    year: 4,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    email: 'vicechair.council@student.shov.college.edu',
    phone: '+91 98765 44002',
    manifesto: 'High-speed campus Wi-Fi infrastructure, cloud lab credits for all departments, and swift fine appeal mediation.',
    officeHours: 'Tue - Thu: 3:30 PM - 5:30 PM (IT Block Lounge)',
    status: 'ONLINE',
    activeInquiriesCount: 2,
    resolvedInquiriesCount: 36,
    badges: ['Infrastructure Lead', 'Fine Appeals Advocate', 'Tech Liaison']
  },
  {
    id: 'em-3',
    roleNumber: 3,
    role: 'PRESIDENT',
    designationTitle: '3 - President',
    name: 'Karthik Subramanian',
    registerNumber: '22AD009',
    department: 'AIDS',
    year: 4,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    email: 'president.council@student.shov.college.edu',
    phone: '+91 98765 44003',
    manifesto: 'Unifying student body voice across IT, CSE, and AIDS. Championing hackathons, industry internships, and sports facility enhancements.',
    officeHours: 'Daily: 4:30 PM - 6:30 PM (Student Center 102)',
    status: 'IN_SESSION',
    activeInquiriesCount: 4,
    resolvedInquiriesCount: 62,
    badges: ['Student Body President', 'Hackathon Lead', 'Executive Senate']
  },
  {
    id: 'em-4',
    roleNumber: 4,
    role: 'VICE_PRESIDENT',
    designationTitle: '4 - Vice President',
    name: 'Pooja Vishwanathan',
    registerNumber: '23CS022',
    department: 'CSE',
    year: 3,
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300',
    email: 'vicepres.council@student.shov.college.edu',
    phone: '+91 98765 44004',
    manifesto: 'Dedicated to women in tech initiatives, mental health support programs, cafeteria hygiene audits, and peer mentorship.',
    officeHours: 'Mon, Wed, Fri: 2:00 PM - 4:00 PM (CSE Seminar Hall)',
    status: 'ONLINE',
    activeInquiriesCount: 1,
    resolvedInquiriesCount: 29,
    badges: ['Campus Welfare Lead', 'Women in Tech', 'Discipline Committee']
  },
  {
    id: 'em-5',
    roleNumber: 5,
    role: 'SECRETARY_1',
    designationTitle: '5 - Secretary 1',
    name: 'Tanmay Kulkarni',
    registerNumber: '23IT041',
    department: 'IT',
    year: 3,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    email: 'sec1.council@student.shov.college.edu',
    phone: '+91 98765 44005',
    manifesto: 'Streamlining formal event approvals, budget allocations, and inter-department sports & cultural festival coordination.',
    officeHours: 'Mon - Thu: 1:30 PM - 3:30 PM (Council Media Room)',
    status: 'ONLINE',
    activeInquiriesCount: 2,
    resolvedInquiriesCount: 41,
    badges: ['General Affairs Secretary', 'Event Operations', 'Sports Board']
  },
  {
    id: 'em-6',
    roleNumber: 6,
    role: 'SECRETARY_2',
    designationTitle: '6 - Secretary 2',
    name: 'Ananya Deshmukh',
    registerNumber: '24AD015',
    department: 'AIDS',
    year: 2,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    email: 'sec2.council@student.shov.college.edu',
    phone: '+91 98765 44006',
    manifesto: 'Ensuring 1st & 2nd-year student representation, lab equipment maintenance ticketing, and real-time photo-documented campus feedback.',
    officeHours: 'Tue & Fri: 3:00 PM - 5:00 PM (AIDS Lab 3)',
    status: 'ONLINE',
    activeInquiriesCount: 1,
    resolvedInquiriesCount: 24,
    badges: ['Junior Affairs Secretary', 'Lab Logistics', 'Digital Communications']
  }
];

export const INITIAL_STUDENT_INQUIRIES: StudentInquiry[] = [
  {
    id: 'inq-101',
    studentId: 'st-001',
    studentName: 'Aarav Sharma',
    registerNumber: '23CS001',
    department: 'CSE',
    targetAuthority: 'VICE_PRINCIPAL',
    category: 'FINE_APPEAL',
    subject: 'Fine Appeal — Late Gate Entry due to College Bus Mechanical Delay',
    message: 'Respected Vice Principal Madam, on August 14th the Route 7 college bus had a tire puncture at Ring Road junction. Gate security issued a ₹200 late entry fine. Attached is the live photo evidence of the bus ticket and gate clock.',
    capturedPhotoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    adminResponse: 'Under review by Dean Office. Transport supervisor log has been requested.',
    responderName: 'Dr. Elizabeth Montgomery',
    responderRole: 'Vice Principal & Academic Dean',
    createdAt: '2026-08-14 09:30',
    updatedAt: '2026-08-14 14:15',
    chatThread: [
      {
        id: 'msg-1',
        senderId: 'st-001',
        senderName: 'Aarav Sharma',
        senderRole: 'STUDENT',
        message: 'Respected Vice Principal, I have submitted the bus delay proof taken directly via the live camera at gate entry.',
        timestamp: '2026-08-14 09:30'
      },
      {
        id: 'msg-2',
        senderId: 'u-vp-1',
        senderName: 'Dr. Elizabeth Montgomery',
        senderRole: 'VICE_PRINCIPAL',
        message: 'Acknowledged Aarav. We are cross-referencing the transport GPS log. We will waive this fine once verified.',
        timestamp: '2026-08-14 14:15'
      }
    ]
  },
  {
    id: 'inq-102',
    studentId: 'st-001',
    studentName: 'Aarav Sharma',
    registerNumber: '23CS001',
    department: 'CSE',
    targetAuthority: 'HOD',
    targetDepartmentCode: 'CSE',
    category: 'ACADEMIC',
    subject: 'Request for NVIDIA GPU Server Access for Final Year AI Vision Model',
    message: 'Respected Dr. Aris Thorne, our project team requires CUDA compute allocation on the Department DGX cluster for training our Swin Transformer model. We have submitted the model parameter specifications.',
    capturedPhotoUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    adminResponse: 'Approved. Access granted on Cluster Node-4 with 40GB VRAM allocation for 14 days.',
    responderName: 'Dr. Aris Thorne',
    responderRole: 'Head of Department (CSE)',
    createdAt: '2026-08-13 11:20',
    updatedAt: '2026-08-13 16:40',
    chatThread: [
      {
        id: 'msg-3',
        senderId: 'st-001',
        senderName: 'Aarav Sharma',
        senderRole: 'STUDENT',
        message: 'Attached screenshot of our training loss requiring higher batch size memory.',
        timestamp: '2026-08-13 11:20'
      },
      {
        id: 'msg-4',
        senderId: 'u-hod-cse',
        senderName: 'Dr. Aris Thorne',
        senderRole: 'HOD',
        message: 'Credentials sent to your student email. Ensure batch scripts use SLURM scheduler.',
        timestamp: '2026-08-13 16:40'
      }
    ]
  },
  {
    id: 'inq-103',
    studentId: 'st-003',
    studentName: 'Rohan Mehra',
    registerNumber: '23IT015',
    department: 'IT',
    targetAuthority: 'STUDENT_COUNCIL',
    targetCouncilMemberId: 'em-1',
    targetCouncilRole: 'CHAIRPERSON',
    category: 'ELECTION_COUNCIL',
    subject: 'Inquiry to Chairperson — Proposal for Overnight Hackathon in Central Library',
    message: 'Hi Aaradhya, the coding club would like to host a 24-hour inter-college AI hackathon next month. Can the Student Council take this up in the next Senate meeting with the Principal?',
    capturedPhotoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    adminResponse: 'Proposal drafted and placed on the Senate Agenda for Friday.',
    responderName: 'Aaradhya Saxena (1 - Chairperson)',
    responderRole: 'COUNCIL_MEMBER',
    createdAt: '2026-08-15 14:00',
    updatedAt: '2026-08-15 18:30',
    chatThread: [
      {
        id: 'msg-5',
        senderId: 'st-003',
        senderName: 'Rohan Mehra',
        senderRole: 'STUDENT',
        message: 'Hi Aaradhya, we have 45 student teams registered already.',
        timestamp: '2026-08-15 14:00'
      },
      {
        id: 'msg-6',
        senderId: 'em-1',
        senderName: 'Aaradhya Saxena (1 - Chairperson)',
        senderRole: 'COUNCIL_MEMBER',
        message: 'Fantastic! I have already discussed the security and night-pass provisions with Officer Marcus. Bringing it to the VP meeting tomorrow!',
        timestamp: '2026-08-15 18:30'
      }
    ]
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-101',
    userId: 'u-student-1', // Listed by default demo student Aarav Sharma
    ownerName: 'Aarav Sharma',
    ownerEmail: 'aarav.23cs001@student.shov.college.edu',
    ownerPhone: '+91 98765 43210',
    title: 'Sunny 2BHK Near Campus Tech Hub & Gate 2',
    description: 'Fully furnished 2-bedroom apartment with high-speed fiber optic Wi-Fi, study desks in both rooms, power backup, and modern kitchen. Only a 5-minute walk to SHOV Main Engineering Block and Gate 2.',
    price: 14500,
    pricePeriod: 'month',
    location: 'Campus West Avenue, Green Valley Enclave, Block B-4',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 950,
    amenities: ['High-Speed WiFi', '24/7 Power Backup', 'Furnished Study Desks', 'AC in Bedrooms', 'Water Purifier', 'Bike Parking', 'CCTV Security'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'
    ],
    isAvailable: true,
    likesCount: 12,
    createdAt: '2026-08-10 10:30'
  },
  {
    id: 'prop-102',
    userId: 'usr-landlord-01',
    ownerName: 'Dr. Vikramaditya Sen',
    ownerEmail: 'hod.aids@shov.college.edu',
    ownerPhone: '+91 98765 11003',
    title: 'Quiet Studio Loft for AI & CS Research Scholars',
    description: 'Peaceful, air-conditioned studio loft with ergonomic Herman Miller chair, dual-monitor setup desk, modular kitchenette, and balcony facing campus botanical gardens. Ideal for focused thesis prep and coding.',
    price: 11000,
    pricePeriod: 'month',
    location: 'Scholar Heights, 3rd Floor, University Circle',
    propertyType: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 520,
    amenities: ['Gigabit Internet', 'Ergonomic Desk', 'Kitchenette', 'Quiet Study Zone', 'Balcony Garden', 'Smart Lock'],
    images: [
      'https://images.unsplash.com/photo-1502005229762-ee1b2b814639?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800'
    ],
    isAvailable: true,
    likesCount: 24,
    createdAt: '2026-08-12 15:45'
  },
  {
    id: 'prop-103',
    userId: 'usr-student-02',
    ownerName: 'Pooja Vishwanathan',
    ownerEmail: 'pooja.23cs022@student.shov.college.edu',
    ownerPhone: '+91 98765 88900',
    title: 'Premium Triple-Sharing PG with Mess & Laundry Included',
    description: 'Clean, spacious PG room for students with 3 single beds, individual wardrobes, attached washroom, daily housekeeping, 3-time nutritious meals included, and night security guard.',
    price: 6500,
    pricePeriod: 'month',
    location: 'Shree Krishna Student Residency, Opp. North Gate Bus Terminal',
    propertyType: 'Shared PG / Hostel',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 380,
    amenities: ['3-Time Mess Included', 'Daily Housekeeping', 'Laundry Machine', 'Attached Bath', 'Geyser', 'Security Guard', 'RO Drinking Water'],
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'
    ],
    isAvailable: true,
    likesCount: 8,
    createdAt: '2026-08-13 09:15'
  },
  {
    id: 'prop-104',
    userId: 'usr-landlord-02',
    ownerName: 'Heritage Campus Living',
    ownerEmail: 'living@heritagecampus.com',
    ownerPhone: '+91 98765 33221',
    title: 'Spacious 3BHK Independent Villa for Student Project Groups',
    description: 'Large 3BHK independent villa with dedicated collaborative lounge, terrace recreation area, covered car & 4 bike parking, inverter power, and high-speed broadband. Great for project teams or small cohorts.',
    price: 26000,
    pricePeriod: 'month',
    location: 'Silver Oak Enclave, Near Sports Complex',
    propertyType: 'Villa',
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 1800,
    amenities: ['Private Terrace', 'Covered Parking', 'Team Work Room', 'Modular Kitchen', '3 Bathrooms', 'Pet Friendly', 'Inverter'],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
    ],
    isAvailable: true,
    likesCount: 19,
    createdAt: '2026-08-14 11:20'
  },
  {
    id: 'prop-105',
    userId: 'u-student-1', // Listed by default demo student Aarav Sharma
    ownerName: 'Aarav Sharma',
    ownerEmail: 'aarav.23cs001@student.shov.college.edu',
    ownerPhone: '+91 98765 43210',
    title: 'Single Occupancy Study Room with Attached Balcony',
    description: 'Compact and budget-friendly private study room with single bed, large bookshelf, study table, ceiling fan, and balcony view. Shared kitchen and washing machine access.',
    price: 5200,
    pricePeriod: 'month',
    location: 'Metro Nagar, 2nd Cross, 10 mins from Main Campus',
    propertyType: 'Study Room',
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: 220,
    amenities: ['High-Speed WiFi', 'Attached Balcony', 'Study Table & Chair', 'Washing Machine Access', 'Water Geyser'],
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800'
    ],
    isAvailable: true,
    likesCount: 15,
    createdAt: '2026-08-15 16:10'
  }
];

export const INITIAL_STAFF_HOD_MESSAGES: StaffHodMessage[] = [
  {
    id: 'shm-001',
    senderStaffId: 'u-staff-1',
    senderStaffName: 'Officer Rajesh Kumar',
    senderRole: 'Main Gate Security Officer',
    targetDepartmentCode: 'CSE',
    subject: 'Late Entry Flag - Student Without Physical ID Badge',
    message: 'Student Rohit Kumar (23CS001) arrived at 09:14 AM without physical badge. Scanned digital ID QR via turnstile scanner. Biometric face match confirmed 99.4%. Requesting HOD confirmation for first-hour lab entry.',
    studentRegisterNo: '23CS001',
    studentName: 'Rohit Kumar',
    incidentType: 'GATE_ENTRY_FLAG',
    timestamp: 'Today, 09:16 AM',
    status: 'REVIEWED',
    hodReply: 'Approved for Lab 3 entry. Warning recorded in department proctorial register.',
    hodRepliedAt: 'Today, 09:20 AM'
  },
  {
    id: 'shm-002',
    senderStaffId: 'u-staff-1',
    senderStaffName: 'Officer Rajesh Kumar',
    senderRole: 'Campus Gatehouse Proctor',
    targetDepartmentCode: 'IT',
    subject: 'Inter-College Symposium Bus Departure Clearance',
    message: 'IT Department delegation bus with 42 students is verified and cleared for IEEE conference departure at South Gate.',
    incidentType: 'GATE_PASS_VERIFICATION',
    timestamp: 'Today, 08:30 AM',
    status: 'ACTION_TAKEN',
    hodReply: 'Thank you Security team. The bus manifest has been filed with Dean Academic.',
    hodRepliedAt: 'Today, 08:35 AM'
  },
  {
    id: 'shm-003',
    senderStaffId: 'u-staff-1',
    senderStaffName: 'Officer Rajesh Kumar',
    senderRole: 'Chief Security Officer',
    targetDepartmentCode: 'AIDS',
    subject: 'After-Hours AI Lab Access Approval Request',
    message: 'AIDS Final Year Hackathon team (4 students) requesting extended lab access until 10:30 PM. Please verify HOD authorization.',
    incidentType: 'GATE_PASS_VERIFICATION',
    timestamp: 'Today, 06:15 PM',
    status: 'PENDING_HOD_REVIEW'
  }
];


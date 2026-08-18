import { CampusCircular } from '../types';

export const INITIAL_HOD_CIRCULARS: CampusCircular[] = [
  {
    id: 'circ-hod-01',
    circularNumber: 'SHOV/HOD/2026/042',
    issuerRole: 'HOD',
    issuerName: 'Dr. Aris Thorne',
    issuerDesignation: 'Head of Department (Computer Science & Engineering)',
    issuerAvatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    departmentCode: 'CSE',
    departmentName: 'Computer Science & Engineering',
    title: 'Final Year Project Phase-II Viva & Architecture Code Review Schedule',
    summary: 'Mandatory technical code review and live defense schedule for all B.Tech CSE final year student project teams.',
    content: `To all 4th Year CSE Students & Project Guides:
The Phase-II Project Reviews will commence from August 25th in Lab Block 3. 

1. Teams must commit their source code to the department institutional GitHub/GitLab repositories by August 22nd, 5:00 PM.
2. Architecture diagrams, test coverage reports, and live deployment demonstrations are required before the faculty review panel.
3. Industry evaluators will be present during the afternoon session.

Please contact your respective batch project coordinators for slot allocations.`,
    issuanceDate: '2026-08-15',
    effectiveDate: '2026-08-25',
    category: 'ACADEMIC',
    targetAudience: 'DEPT_SPECIFIC',
    urgency: 'HIGH_PRIORITY',
    attachmentName: 'CSE_Project_Phase2_Review_Slots_2026.pdf',
    attachmentUrl: '#',
    isAcknowledged: true,
    acknowledgementCount: 142
  },
  {
    id: 'circ-hod-02',
    circularNumber: 'SHOV/HOD/2026/039',
    issuerRole: 'HOD',
    issuerName: 'Dr. Sarah Jenkins',
    issuerDesignation: 'Head of Department (Information Technology)',
    issuerAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    departmentCode: 'IT',
    departmentName: 'Information Technology',
    title: 'Cloud Computing Lab & AWS Cloud Sandbox Access Credentials',
    summary: 'Issuance of dedicated AWS and Kubernetes sandbox cluster accounts for semester practicals.',
    content: `All IT 2nd and 3rd Year Students:
Your institutional cloud sandbox credentials have been generated and mapped to your SHOV Digital ID profile. 

Guidelines:
- Maintain resource quotas within your assigned Kubernetes namespace.
- Terminate high-compute EC2 instances after laboratory hours.
- Report any access token anomalies to the Lab Technician immediately.`,
    issuanceDate: '2026-08-13',
    effectiveDate: '2026-08-14',
    category: 'FACILITY',
    targetAudience: 'DEPT_SPECIFIC',
    urgency: 'NORMAL',
    attachmentName: 'IT_CloudLab_Policy_Guidelines.pdf',
    attachmentUrl: '#',
    isAcknowledged: false,
    acknowledgementCount: 98
  },
  {
    id: 'circ-hod-03',
    circularNumber: 'SHOV/HOD/2026/045',
    issuerRole: 'HOD',
    issuerName: 'Dr. Vikramaditya Sen',
    issuerDesignation: 'Head of Department (Artificial Intelligence & Data Science)',
    issuerAvatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    departmentCode: 'AIDS',
    departmentName: 'Artificial Intelligence & Data Science',
    title: 'GPU Cluster Time-Sharing Protocols & Research Paper Submission Grant',
    summary: 'NVIDIA GPU compute farm scheduling for machine learning model training and conference submissions.',
    content: `To all Faculty and Research Scholars in AIDS:
The department GPU computing cluster reservation portal is now live on the internal portal. Priority slots are allocated for NeurIPS, ICML, and CVPR target research submissions.`,
    issuanceDate: '2026-08-11',
    effectiveDate: '2026-08-12',
    category: 'ACADEMIC',
    targetAudience: 'ALL_FACULTY',
    urgency: 'NORMAL',
    attachmentName: 'AIDS_GPU_Allocation_Matrix.pdf',
    attachmentUrl: '#',
    isAcknowledged: true,
    acknowledgementCount: 86
  }
];

export const INITIAL_VP_CIRCULARS: CampusCircular[] = [
  {
    id: 'circ-vp-01',
    circularNumber: 'SHOV/VP/GOV/2026/108',
    issuerRole: 'VICE_PRINCIPAL',
    issuerName: 'Dr. Elizabeth Montgomery',
    issuerDesignation: 'Vice Principal & Dean of Academic Governance',
    issuerAvatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    title: 'Campus-Wide Digital ID Dynamic QR Gatehouse Compliance Directive',
    summary: 'Mandatory verification protocols at North, South, and Central turnstiles across all academic wings.',
    content: `OFFICIAL DIRECTIVE TO ALL STUDENTS, FACULTY & ADMINISTRATIVE HEADS:

Effective August 18th, 2026, entry through all primary campus gates will require active presentation of the dynamic, cryptographically signed SHOV Digital ID Card via mobile device or physical biometric badge.

Key Compliance Measures:
1. Dynamic QR codes refresh periodically to prevent badge sharing.
2. Security officers and gate marshals will conduct live barcode/NFC scans during peak entry hours (8:00 AM – 9:30 AM).
3. Any student with suspended or unpaid fine status must resolve clearances at the administrative desk or online portal before gate authorization is restored.
4. All Heads of Departments (HODs) are directed to ensure 100% student identity verification compliance during morning roll calls.

By Order of the Vice Principal & Academic Senate.`,
    issuanceDate: '2026-08-16',
    effectiveDate: '2026-08-18',
    category: 'GATE_SECURITY',
    targetAudience: 'ALL_STUDENTS',
    urgency: 'MANDATORY',
    attachmentName: 'SHOV_Campus_Security_Circular_2026.pdf',
    attachmentUrl: '#',
    isAcknowledged: true,
    acknowledgementCount: 420
  },
  {
    id: 'circ-vp-02',
    circularNumber: 'SHOV/VP/ACA/2026/094',
    issuerRole: 'VICE_PRINCIPAL',
    issuerName: 'Dr. Elizabeth Montgomery',
    issuerDesignation: 'Vice Principal & Dean of Academic Governance',
    issuerAvatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    title: 'Mid-Semester Examination Schedule & Code of Conduct Regulations',
    summary: 'Institutional examination guidelines, hall ticket issuance, and anti-malpractice governance.',
    content: `To All Departments and Academic Divisions:
The Odd Semester Central Mid-Term Examinations will take place from September 1st through September 10th across all collegiate degree programs.

- Hall tickets will be digitally generated on your SHOV Digital ID profile upon 75% minimum attendance clearance.
- No electronic storage devices or unauthorized materials are permitted inside examination halls.
- Invigilators are authorized to verify candidate identity using real-time photo matching.`,
    issuanceDate: '2026-08-14',
    effectiveDate: '2026-09-01',
    category: 'EXAMINATION',
    targetAudience: 'ALL_STUDENTS',
    urgency: 'HIGH_PRIORITY',
    attachmentName: 'MidSem_Exam_Schedule_Odd2026.pdf',
    attachmentUrl: '#',
    isAcknowledged: true,
    acknowledgementCount: 388
  },
  {
    id: 'circ-vp-03',
    circularNumber: 'SHOV/VP/DISC/2026/077',
    issuerRole: 'VICE_PRINCIPAL',
    issuerName: 'Dr. Elizabeth Montgomery',
    issuerDesignation: 'Vice Principal & Dean of Academic Governance',
    issuerAvatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    title: 'Institutional Code of Conduct, Vehicle Parking & Campus Decorum',
    summary: 'Designated two-wheeler and four-wheeler parking bays, speed limits, and quiet zone enforcement.',
    content: `All Campus Stakeholders:
To ensure student safety, strict 20 km/h speed limits are enforced within university perimeter roads. Vehicle entry stickers must be collected from the Estate Office.`,
    issuanceDate: '2026-08-08',
    effectiveDate: '2026-08-10',
    category: 'DISCIPLINARY',
    targetAudience: 'ALL_STUDENTS',
    urgency: 'NORMAL',
    attachmentName: 'Campus_Vehicle_Parking_Policy.pdf',
    attachmentUrl: '#',
    isAcknowledged: false,
    acknowledgementCount: 215
  }
];

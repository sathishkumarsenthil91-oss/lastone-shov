import { Department, DepartmentCode } from '../types';

export interface DepartmentDefinition {
  code: DepartmentCode;
  name: string;
  shortName: string;
  fullName: string;
  degree: string;
  description: string;
  hodName: string;
  hodEmail: string;
  hodPhone: string;
  hodPhotoUrl: string;
  studentCount: number;
}

export const COLLEGE_DEPARTMENTS: DepartmentDefinition[] = [
  {
    code: 'CSE',
    shortName: 'CSE',
    name: 'Computer Science and Engineering',
    fullName: 'Computer Science and Engineering (CSE)',
    degree: 'B.E. Computer Science and Engineering',
    description: 'Algorithms, Software Engineering, Systems Architecture, Computer Networks, Operating Systems, Compilers & Cryptography.',
    hodName: 'Dr. Aris Thorne',
    hodEmail: 'hod.cse@avsct.edu.in',
    hodPhone: '+91 98765 11002',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    studentCount: 420
  },
  {
    code: 'IT',
    shortName: 'IT',
    name: 'Information Technology',
    fullName: 'Information Technology (IT)',
    degree: 'B.Tech Information Technology',
    description: 'Enterprise Cloud Architecture, Full-Stack Web Technologies, Cybersecurity, Distributed Systems & DevOps.',
    hodName: 'Dr. Sarah Jenkins',
    hodEmail: 'hod.it@avsct.edu.in',
    hodPhone: '+91 98765 11001',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    studentCount: 360
  },
  {
    code: 'ECE',
    shortName: 'ECE',
    name: 'Electronics and Communication Engineering',
    fullName: 'Electronics and Communication Engineering (ECE)',
    degree: 'B.E. Electronics and Communication Engineering',
    description: 'VLSI Design, Embedded Systems, Digital Signal Processing, Wireless RF Communication, Microwave & IoT Hardware.',
    hodName: 'Dr. Raghavan Sundaram',
    hodEmail: 'hod.ece@avsct.edu.in',
    hodPhone: '+91 98765 11004',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    studentCount: 380
  },
  {
    code: 'AIDS',
    shortName: 'AIDS',
    name: 'Artificial Intelligence and Data Science',
    fullName: 'Artificial Intelligence and Data Science (AIDS)',
    degree: 'B.Tech Artificial Intelligence and Data Science',
    description: 'Deep Learning, Neural Networks, Computer Vision, Natural Language Processing, Big Data Analytics & Generative AI.',
    hodName: 'Dr. Vikramaditya Sen',
    hodEmail: 'hod.aids@avsct.edu.in',
    hodPhone: '+91 98765 11003',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    studentCount: 320
  },
  {
    code: 'EEE',
    shortName: 'EEE',
    name: 'Electrical and Electronics Engineering',
    fullName: 'Electrical and Electronics Engineering (EEE)',
    degree: 'B.E. Electrical and Electronics Engineering',
    description: 'Power Systems, Renewable Energy Microgrids, Electric Vehicles, Control Systems, Power Electronics & Smart Grid Tech.',
    hodName: 'Dr. Meenakshi Sundaram',
    hodEmail: 'hod.eee@avsct.edu.in',
    hodPhone: '+91 98765 11005',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    studentCount: 310
  },
  {
    code: 'MECH',
    shortName: 'MECH',
    name: 'Mechanical Engineering',
    fullName: 'Mechanical Engineering (MECH)',
    degree: 'B.E. Mechanical Engineering',
    description: 'Thermodynamics, Robotics, CAD/CAM Manufacturing, Fluid Dynamics, Materials Science & Autonomous Automotive.',
    hodName: 'Dr. Rajeshwari Balan',
    hodEmail: 'hod.mech@avsct.edu.in',
    hodPhone: '+91 98765 11006',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    studentCount: 340
  },
  {
    code: 'AGRI',
    shortName: 'AGRI',
    name: 'Agricultural Engineering',
    fullName: 'Agricultural Engineering (AGRI)',
    degree: 'B.Tech Agricultural Engineering',
    description: 'Precision Agriculture, Drone Crop Scouting, Smart Irrigation Systems, Food Processing Machinery & Soil Analytics.',
    hodName: 'Dr. Senthil Nathan',
    hodEmail: 'hod.agri@avsct.edu.in',
    hodPhone: '+91 98765 11007',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    studentCount: 280
  }
];

export const ALL_DEPARTMENTS_LIST: Department[] = COLLEGE_DEPARTMENTS.map(d => ({
  id: `dept-${d.code.toLowerCase()}`,
  name: d.name,
  code: d.code,
  hodName: d.hodName,
  hodEmail: d.hodEmail,
  hodPhone: d.hodPhone,
  hodPhotoUrl: d.hodPhotoUrl,
  studentCount: d.studentCount,
  description: d.description
}));

export const ALL_COLLEGE_DEPARTMENTS = COLLEGE_DEPARTMENTS;

export function getDepartmentByCode(code?: string): DepartmentDefinition {
  if (!code) return COLLEGE_DEPARTMENTS[0];
  const cleaned = code.replace(/^dept-/, '').toUpperCase();
  return COLLEGE_DEPARTMENTS.find(d => d.code === cleaned) || COLLEGE_DEPARTMENTS[0];
}

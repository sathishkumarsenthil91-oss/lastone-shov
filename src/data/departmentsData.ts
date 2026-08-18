import { Department } from '../types';

export const ALL_COLLEGE_DEPARTMENTS: Department[] = [
  {
    id: 'dept-cse',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    hodName: 'Dr. Aris Thorne',
    hodEmail: 'hod.cse@shov.college.edu',
    hodPhone: '+91 98765 11002',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300',
    studentCount: 480,
    description: 'Core Computing, Distributed Architectures, Operating Systems, Cryptography & Software Engineering.'
  },
  {
    id: 'dept-it',
    name: 'Information Technology',
    code: 'IT',
    hodName: 'Dr. Sarah Jenkins',
    hodEmail: 'hod.it@shov.college.edu',
    hodPhone: '+91 98765 11001',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    studentCount: 420,
    description: 'Enterprise Cloud Systems, DevOps, Full-Stack Web Technologies, Cybersecurity & Information Systems.'
  },
  {
    id: 'dept-aids',
    name: 'Artificial Intelligence & Data Science',
    code: 'AIDS',
    hodName: 'Dr. Vikramaditya Sen',
    hodEmail: 'hod.aids@shov.college.edu',
    hodPhone: '+91 98765 11003',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    studentCount: 360,
    description: 'Neural Networks, Deep Learning, Big Data Analytics, Computer Vision & Natural Language Processing.'
  },
  {
    id: 'dept-ece',
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    hodName: 'Dr. Rajeshwari Raman',
    hodEmail: 'hod.ece@shov.college.edu',
    hodPhone: '+91 98765 11004',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300',
    studentCount: 450,
    description: 'VLSI Design, Embedded Systems, Signal Processing, 5G Wireless Communications & IoT.'
  },
  {
    id: 'dept-eee',
    name: 'Electrical & Electronics Engineering',
    code: 'EEE',
    hodName: 'Dr. K. S. Balasubramanian',
    hodEmail: 'hod.eee@shov.college.edu',
    hodPhone: '+91 98765 11005',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    studentCount: 380,
    description: 'Renewable Power Systems, Electric Vehicle Drives, Smart Grids, Control Systems & High Voltage Engineering.'
  },
  {
    id: 'dept-mech',
    name: 'Mechanical Engineering',
    code: 'MECH',
    hodName: 'Dr. David Prakash',
    hodEmail: 'hod.mech@shov.college.edu',
    hodPhone: '+91 98765 11006',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    studentCount: 410,
    description: 'Robotics & Automation, Thermal Engineering, CAD/CAM Manufacturing, Fluid Dynamics & Materials Science.'
  },
  {
    id: 'dept-civil',
    name: 'Civil Engineering',
    code: 'CIVIL',
    hodName: 'Dr. Ananya Mukherjee',
    hodEmail: 'hod.civil@shov.college.edu',
    hodPhone: '+91 98765 11007',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    studentCount: 300,
    description: 'Structural Analysis, Smart Infrastructure, Environmental Engineering, Geotechnical Engineering & Surveying.'
  },
  {
    id: 'dept-bme',
    name: 'Biomedical Engineering',
    code: 'BME',
    hodName: 'Dr. Priya Varma',
    hodEmail: 'hod.bme@shov.college.edu',
    hodPhone: '+91 98765 11008',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    studentCount: 260,
    description: 'Medical Imaging, Bio-Instrumentation, Prosthetics, Neural Engineering & Healthcare Robotics.'
  },
  {
    id: 'dept-aero',
    name: 'Aeronautical Engineering',
    code: 'AERO',
    hodName: 'Dr. Sudhir Narayan',
    hodEmail: 'hod.aero@shov.college.edu',
    hodPhone: '+91 98765 11009',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    studentCount: 220,
    description: 'Aerodynamics, Propulsion Systems, Flight Mechanics, Spacecraft Dynamics & Drone Avionics.'
  },
  {
    id: 'dept-csbs',
    name: 'Computer Science & Business Systems',
    code: 'CSBS',
    hodName: 'Dr. Meenakshi Sundaram',
    hodEmail: 'hod.csbs@shov.college.edu',
    hodPhone: '+91 98765 11010',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    studentCount: 280,
    description: 'Enterprise Architecture, Financial Technology, Computational Finance & Business Analytics.'
  },
  {
    id: 'dept-mba',
    name: 'Management Studies (MBA)',
    code: 'MBA',
    hodName: 'Dr. Christopher Lynn',
    hodEmail: 'hod.mba@shov.college.edu',
    hodPhone: '+91 98765 11011',
    hodPhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    studentCount: 240,
    description: 'Strategic Operations, Marketing & Digital Media, Corporate Finance & Human Resource Leadership.'
  }
];

export const DEPARTMENT_OPTIONS = ALL_COLLEGE_DEPARTMENTS.map(d => ({
  code: d.code,
  name: d.name,
  hod: d.hodName
}));

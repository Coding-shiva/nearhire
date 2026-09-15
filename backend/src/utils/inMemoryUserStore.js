/**
 * In-Memory User Store
 * Guarantees zero-downtime persistence for Demo accounts and newly registered offline users
 * so Employer roles and Candidate profiles stay intact without requiring MongoDB.
 */

const DEMO_USERS = {
  'candidate@nearhire.com': {
    _id: '670000000000000000000021',
    id: '670000000000000000000021',
    name: 'Shivanand Sharma',
    email: 'candidate@nearhire.com',
    role: 'USER',
    headline: 'Full Stack MERN Developer | React & Node.js Enthusiast',
    bio: 'Software engineer specializing in building responsive web applications using React, Node.js, and MongoDB.',
    experienceLevel: 'Fresher',
    skills: ['React', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
    preferredCategories: ['Technology / IT'],
    locationName: 'Noida Sector 62',
    location: { type: 'Point', coordinates: [77.3649, 28.6280] },
    preferredRadiusKm: 25,
  },
  'employer@innovatech.com': {
    _id: '670000000000000000000022',
    id: '670000000000000000000022',
    name: 'Pooja Verma',
    email: 'employer@innovatech.com',
    role: 'EMPLOYER',
    headline: 'Head of Talent Acquisition at InnovaTech Solutions',
    experienceLevel: '5+ years',
    skills: ['Recruitment', 'Talent Acquisition', 'HR Operations'],
    locationName: 'Noida Sector 62',
    location: { type: 'Point', coordinates: [77.3649, 28.6280] },
    preferredRadiusKm: 25,
  },
  'admin@nearhire.com': {
    _id: '670000000000000000000023',
    id: '670000000000000000000023',
    name: 'NearHire Administrator',
    email: 'admin@nearhire.com',
    role: 'ADMIN',
    headline: 'Platform Operations & Compliance Manager',
    locationName: 'New Delhi',
    location: { type: 'Point', coordinates: [77.2167, 28.6315] },
    preferredRadiusKm: 50,
  },
};

// Runtime store for users registered during the active session
const runtimeUsersById = {};
const runtimeUsersByEmail = {};

// Initialize with demo users
Object.values(DEMO_USERS).forEach((u) => {
  runtimeUsersById[u.id] = u;
  runtimeUsersByEmail[u.email.toLowerCase()] = u;
});

const saveUser = (user) => {
  const normalized = {
    ...user,
    _id: user._id || user.id,
    id: user.id || user._id,
  };
  runtimeUsersById[normalized.id] = normalized;
  if (normalized.email) {
    runtimeUsersByEmail[normalized.email.toLowerCase()] = normalized;
  }
  return normalized;
};

const findUserById = (id) => {
  return runtimeUsersById[id] || null;
};

const findUserByEmail = (email) => {
  return runtimeUsersByEmail[email?.toLowerCase()] || null;
};

module.exports = {
  DEMO_USERS,
  saveUser,
  findUserById,
  findUserByEmail,
};

/**
 * Clean Job Provider Interface and Mock Feed Generator
 * Generates structured job feed items for testing the automated ingestion pipeline.
 */

class MockJobProvider {
  constructor() {
    this.name = 'Mock Authorized Job Provider';
  }

  async fetchJobs() {
    const timestamp = Date.now();
    return [
      {
        sourceJobId: `mock-feed-${timestamp}-1`,
        title: 'Senior Node.js Microservices Architect',
        companyName: 'CloudMatrix India',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
        description: 'Design distributed microservices architectures with Node.js, Express, Docker, Redis, and MongoDB for high-volume transactions.',
        skills: ['Node.js', 'Express.js', 'Redis', 'Docker', 'MongoDB', 'AWS'],
        category: 'Technology / IT',
        salaryMin: 1200000,
        salaryMax: 2200000,
        experienceLevel: '3-5 years',
        workMode: 'Hybrid',
        locationName: 'Sector 62, Noida',
        city: 'Noida',
        latitude: 28.6290,
        longitude: 77.3680,
        applyUrl: 'https://cloudmatrix.example.com/apply/101',
        source: 'MOCK',
      },
      {
        sourceJobId: `mock-feed-${timestamp}-2`,
        title: 'Inside Sales Specialist (EdTech)',
        companyName: 'BrightLearn EdTech',
        companyLogo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
        description: 'Connecting with students and professionals for technical upskilling programs. Conduct phone consultations and close enrollments.',
        skills: ['Inside Sales', 'Telecalling', 'Business Development', 'CRM Management'],
        category: 'Sales',
        salaryMin: 320000,
        salaryMax: 600000,
        experienceLevel: 'Fresher',
        workMode: 'On-site',
        locationName: 'Sector 16, Noida',
        city: 'Noida',
        latitude: 28.5780,
        longitude: 77.3150,
        applyUrl: 'https://brightlearn.example.com/apply/202',
        source: 'MOCK',
      },
      {
        sourceJobId: `mock-feed-${timestamp}-3`,
        title: 'HR Operations Executive',
        companyName: 'Nexus Retail & Logistics',
        companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
        description: 'Support employee lifecycle from onboarding, documentation, attendance management to payroll query resolution.',
        skills: ['HR Operations', 'Payroll Management', 'Advanced Excel'],
        category: 'Human Resources',
        salaryMin: 300000,
        salaryMax: 480000,
        experienceLevel: 'Fresher',
        workMode: 'On-site',
        locationName: 'Raj Nagar, Ghaziabad',
        city: 'Ghaziabad',
        latitude: 28.6836,
        longitude: 77.4431,
        applyUrl: 'https://nexuslogistics.example.com/careers/303',
        source: 'MOCK',
      },
      {
        sourceJobId: `mock-feed-${timestamp}-4`,
        title: 'Frontend React & Next.js Developer',
        companyName: 'Apex Growth Media',
        companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
        description: 'Build fast SSR web apps using Next.js, React, and Tailwind CSS. Optimize web vitals and client dashboards.',
        skills: ['React', 'Next.js', 'Tailwind CSS', 'JavaScript'],
        category: 'Technology / IT',
        salaryMin: 500000,
        salaryMax: 950000,
        experienceLevel: '1-3 years',
        workMode: 'Hybrid',
        locationName: 'Connaught Place, New Delhi',
        city: 'New Delhi',
        latitude: 28.6315,
        longitude: 77.2167,
        applyUrl: 'https://apexgrowth.example.com/apply/404',
        source: 'MOCK',
      },
    ];
  }
}

module.exports = MockJobProvider;

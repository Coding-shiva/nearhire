require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const JobSource = require('../models/JobSource');
const { generateDuplicateHash } = require('../utils/duplicateDetector');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nearhire';

async function seedDatabase() {
  try {
    console.log('Connecting to database:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB. Clearing existing collections...');

    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await JobSource.deleteMany({});

    console.log('Creating Seed Users...');
    const candidateUser = await User.create({
      name: 'Shivanand Sharma',
      email: 'candidate@nearhire.com',
      password: 'password123',
      role: 'USER',
      headline: 'Full Stack MERN Developer | React & Node.js Enthusiast',
      bio: 'Enthusiastic software engineer specializing in building responsive web applications using React, Node.js, and MongoDB.',
      phone: '+91 9876543210',
      experienceLevel: 'Fresher',
      skills: ['React', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS'],
      preferredCategories: ['Technology / IT'],
      locationName: 'Noida Sector 62',
      location: { type: 'Point', coordinates: [77.3649, 28.6280] },
      preferredRadiusKm: 25,
      preferredWorkMode: 'Any',
    });

    const employerUser = await User.create({
      name: 'Pooja Verma',
      email: 'employer@innovatech.com',
      password: 'password123',
      role: 'EMPLOYER',
      headline: 'Head of Talent Acquisition at InnovaTech Solutions',
      phone: '+91 9811223344',
      locationName: 'Noida Sector 62',
      location: { type: 'Point', coordinates: [77.3649, 28.6280] },
    });

    const adminUser = await User.create({
      name: 'NearHire Administrator',
      email: 'admin@nearhire.com',
      password: 'admin123',
      role: 'ADMIN',
      headline: 'Platform Operations & Compliance Manager',
      locationName: 'New Delhi',
      location: { type: 'Point', coordinates: [77.2167, 28.6315] },
    });

    console.log('Creating Seed Companies across NCR...');
    const companies = await Company.create([
      {
        name: 'InnovaTech Solutions',
        slug: 'innovatech-solutions',
        logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
        industry: 'Technology / IT',
        description: 'Leading product development studio specializing in enterprise SaaS and cloud solutions.',
        website: 'https://innovatech.example.com',
        email: 'careers@innovatech.example.com',
        phone: '+91 120 4567890',
        address: { area: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201309' },
        location: { type: 'Point', coordinates: [77.3649, 28.6280] }, // Sector 62 Noida
        verified: true,
        createdBy: employerUser._id,
      },
      {
        name: 'CyberGrid Systems',
        slug: 'cybergrid-systems',
        logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
        industry: 'Technology / IT',
        description: 'Next-generation cybersecurity and cloud infrastructure engineering firm.',
        website: 'https://cybergrid.example.com',
        email: 'talent@cybergrid.example.com',
        phone: '+91 124 9876543',
        address: { area: 'Cyber City, Phase 2', city: 'Gurugram', state: 'Haryana', pincode: '122002' },
        location: { type: 'Point', coordinates: [77.0895, 28.4952] }, // Cyber City Gurgaon
        verified: true,
      },
      {
        name: 'Apex Growth Media',
        slug: 'apex-growth-media',
        logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
        industry: 'Marketing',
        description: 'Performance marketing, digital advertising, and growth agency.',
        website: 'https://apexgrowth.example.com',
        email: 'hr@apexgrowth.example.com',
        address: { area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
        location: { type: 'Point', coordinates: [77.2167, 28.6315] }, // Connaught Place Delhi
        verified: true,
      },
      {
        name: 'Nexus Retail & Logistics',
        slug: 'nexus-retail-logistics',
        logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
        industry: 'Operations',
        description: 'Omnichannel logistics and supply chain powerhouse with fulfillment centers across North India.',
        website: 'https://nexuslogistics.example.com',
        email: 'jobs@nexuslogistics.example.com',
        address: { area: 'Raj Nagar District Centre', city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201002' },
        location: { type: 'Point', coordinates: [77.4431, 28.6836] }, // Raj Nagar Ghaziabad
        verified: true,
      },
      {
        name: 'FinVantage Advisors',
        slug: 'finvantage-advisors',
        logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150&auto=format&fit=crop&q=80',
        industry: 'Finance',
        description: 'Corporate financial advisory, taxation consultancy, and wealth planning.',
        website: 'https://finvantage.example.com',
        email: 'contact@finvantage.example.com',
        address: { area: 'Nehru Place', city: 'New Delhi', state: 'Delhi', pincode: '110019' },
        location: { type: 'Point', coordinates: [77.2514, 28.5492] }, // Nehru Place Delhi
        verified: true,
      },
    ]);

    const compMap = {};
    companies.forEach((c) => {
      compMap[c.name] = c;
    });

    console.log('Creating Seed Job Sources...');
    await JobSource.create([
      {
        name: 'NearHire Automated Ingestion Engine',
        sourceType: 'API',
        url: 'https://api.nearhire.internal/feed',
        enabled: true,
        fetchIntervalMinutes: 30,
        status: 'success',
        lastSuccessfulFetch: new Date(),
        totalJobsFetched: 154,
        totalJobsAdded: 82,
      },
      {
        name: 'NCR Tech Career Feeds (Public RSS)',
        sourceType: 'RSS',
        url: 'https://ncrtechjobs.example.com/rss.xml',
        enabled: true,
        fetchIntervalMinutes: 60,
        status: 'idle',
      },
    ]);

    console.log('Creating Seed Jobs & Walk-In Drives...');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(today.getTime() + 48 * 60 * 60 * 1000);

    const seedJobs = [
      // 1. React Developer - Noida Sec 62 (Matches user: 2.4 km away, fresh)
      {
        title: 'React Developer',
        company: compMap['InnovaTech Solutions']._id,
        companyName: 'InnovaTech Solutions',
        companyLogo: compMap['InnovaTech Solutions'].logo,
        description: 'Join our dynamic frontend engineering squad building real-time dashboard interfaces using React, JavaScript, and Tailwind CSS. You will collaborate closely with UI/UX designers and backend developers.',
        responsibilities: [
          'Develop high-performance, reusable UI components using React and TypeScript',
          'Integrate RESTful microservices and WebSocket streams',
          'Optimize web application responsiveness and rendering speeds',
        ],
        requirements: [
          'Solid understanding of React hooks, state management, and modern JavaScript',
          'Proficiency with HTML5, CSS3, and responsive utility frameworks like Tailwind CSS',
          'Familiarity with Git and REST APIs',
        ],
        skills: ['React', 'JavaScript', 'HTML5', 'Tailwind CSS', 'Git', 'TypeScript'],
        category: 'Technology / IT',
        categories: ['Technology / IT'],
        subCategory: 'Frontend Development',
        salaryMin: 450000,
        salaryMax: 850000,
        experienceLevel: 'Fresher',
        experienceMin: 0,
        experienceMax: 2,
        employmentType: 'Full Time',
        workMode: 'Hybrid',
        locationName: 'Sector 62, Noida',
        city: 'Noida',
        state: 'Uttar Pradesh',
        location: { type: 'Point', coordinates: [77.3620, 28.6250] }, // ~0.5 km from center
        postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        walkIn: false,
        source: 'EMPLOYER',
        postedBy: employerUser._id,
        verified: true,
        status: 'active',
      },

      // 2. Software Engineer (Full Stack) - Noida Sec 62 (Matches user: 4.1 km away)
      {
        title: 'Software Engineer - Full Stack (MERN)',
        company: compMap['InnovaTech Solutions']._id,
        companyName: 'InnovaTech Solutions',
        companyLogo: compMap['InnovaTech Solutions'].logo,
        description: 'We are seeking an ambitious Full Stack Software Engineer to build scalable web products using Node.js, Express, React, and MongoDB.',
        responsibilities: [
          'Design and maintain backend REST APIs with Express and Node.js',
          'Build responsive web interfaces with React',
          'Manage MongoDB schema design and caching layers',
        ],
        requirements: [
          'Hands-on experience with Node.js, Express.js, MongoDB, and React',
          'Good problem-solving and algorithmic thinking',
          'Knowledge of authentication patterns (JWT) and API design',
        ],
        skills: ['React', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript', 'REST API'],
        category: 'Technology / IT',
        categories: ['Technology / IT'],
        subCategory: 'Full Stack Development',
        salaryMin: 600000,
        salaryMax: 1200000,
        experienceLevel: '1-3 years',
        experienceMin: 1,
        experienceMax: 3,
        employmentType: 'Full Time',
        workMode: 'On-site',
        locationName: 'Sector 63, Noida',
        city: 'Noida',
        state: 'Uttar Pradesh',
        location: { type: 'Point', coordinates: [77.3820, 28.6200] }, // ~3.5 km
        postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // Today
        walkIn: false,
        source: 'EMPLOYER',
        postedBy: employerUser._id,
        verified: true,
        status: 'active',
      },

      // 3. WALK-IN DRIVE: React & Node.js Developers (Noida Sector 62) - TODAY
      {
        title: 'MEGA WALK-IN DRIVE: Software Engineers & React Developers',
        company: compMap['InnovaTech Solutions']._id,
        companyName: 'InnovaTech Solutions',
        companyLogo: compMap['InnovaTech Solutions'].logo,
        description: 'Direct in-person interview drive for Freshers & Experienced Web Developers. Spot offer letters will be rolled out to selected candidates after technical and HR rounds.',
        responsibilities: [
          'In-person technical evaluation and live coding test',
          'Discussion with Principal Architect on MERN architecture',
          'Immediate onboarding upon selection',
        ],
        requirements: [
          'Proficiency in React, JavaScript, or Node.js',
          'Degree in B.Tech, BCA, MCA, or relevant certification',
          'Carry 2 hard copies of updated resume, college marksheets, and Govt photo ID',
        ],
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
        category: 'Technology / IT',
        categories: ['Technology / IT'],
        subCategory: 'Full Stack Development',
        salaryMin: 400000,
        salaryMax: 900000,
        experienceLevel: 'Fresher',
        experienceMin: 0,
        experienceMax: 3,
        employmentType: 'Walk-in',
        workMode: 'On-site',
        locationName: 'InnovaTech Tower, Sector 62, Noida',
        city: 'Noida',
        state: 'Uttar Pradesh',
        location: { type: 'Point', coordinates: [77.3649, 28.6280] },
        postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        walkIn: true,
        walkInDate: today,
        walkInStartTime: '10:00 AM',
        walkInEndTime: '04:30 PM',
        venue: 'InnovaTech Towers, 4th Floor, C-Block, Sector 62, Noida (Near Electronic City Metro)',
        requiredDocuments: ['2 Hard Copies of Resume', 'Original Govt Photo ID (Aadhar/PAN)', 'Educational Certificates'],
        contactPhone: '+91 120 4567890',
        contactEmail: 'walkin@innovatech.example.com',
        source: 'EMPLOYER',
        postedBy: employerUser._id,
        verified: true,
        status: 'active',
      },

      // 4. Sales Executive - Noida Sec 18 (Matches user radius ~6.3 km)
      {
        title: 'Business Development Executive (BDE) - IT Services',
        company: compMap['InnovaTech Solutions']._id,
        companyName: 'InnovaTech Solutions',
        companyLogo: compMap['InnovaTech Solutions'].logo,
        description: 'Seeking energetic Sales Executives to drive outbound customer outreach, demonstrate software demos, and nurture leads for our enterprise SaaS product suite.',
        responsibilities: [
          'Generate qualified leads through telephone calls, LinkedIn, and email campaigns',
          'Conduct product demos for corporate clients',
          'Achieve monthly sales acquisition targets',
        ],
        requirements: [
          'Excellent English and Hindi verbal and written communication',
          'Basic understanding of IT services and SaaS workflows',
          'Target-driven mindset with persuasive negotiation skills',
        ],
        skills: ['Business Development', 'Inside Sales', 'Lead Generation', 'Cold Calling', 'Negotiation Skills'],
        category: 'Sales',
        categories: ['Sales'],
        subCategory: 'Business Development (BDE)',
        salaryMin: 350000,
        salaryMax: 650000,
        experienceLevel: 'Fresher',
        experienceMin: 0,
        experienceMax: 2,
        employmentType: 'Full Time',
        workMode: 'On-site',
        locationName: 'Sector 18, Noida',
        city: 'Noida',
        state: 'Uttar Pradesh',
        location: { type: 'Point', coordinates: [77.3261, 28.5708] }, // Sector 18 Noida ~6.5 km
        postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        walkIn: false,
        source: 'EMPLOYER',
        postedBy: employerUser._id,
        verified: true,
        status: 'active',
      },

      // 5. HR Recruiter - Sahibabad / Ghaziabad (Matches user radius ~8.2 km)
      {
        title: 'HR Recruiter / Talent Acquisition Executive',
        company: compMap['Nexus Retail & Logistics']._id,
        companyName: 'Nexus Retail & Logistics',
        companyLogo: compMap['Nexus Retail & Logistics'].logo,
        description: 'Fast-growing retail logistics company hiring an HR Recruiter to oversee end-to-end talent sourcing, campus hiring drives, and candidate onboarding.',
        responsibilities: [
          'Source candidates across job portals, LinkedIn, and colleges',
          'Screen resumes and schedule technical interviews',
          'Manage onboarding documentation and employee records',
        ],
        requirements: [
          'MBA or Graduate with enthusiasm for people operations',
          'Clear communication and interpersonal skills',
          'Proficiency with MS Excel and recruitment portals',
        ],
        skills: ['Recruitment', 'Talent Acquisition', 'Resume Screening', 'Candidate Sourcing', 'Advanced Excel'],
        category: 'Human Resources',
        categories: ['Human Resources'],
        subCategory: 'Recruiter / Talent Acquisition',
        salaryMin: 300000,
        salaryMax: 500000,
        experienceLevel: 'Fresher',
        experienceMin: 0,
        experienceMax: 1,
        employmentType: 'Full Time',
        workMode: 'On-site',
        locationName: 'Sahibabad Industrial Area, Ghaziabad',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        location: { type: 'Point', coordinates: [77.3450, 28.6720] }, // ~8 km from Sec 62
        postedAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // Yesterday
        walkIn: false,
        source: 'ADMIN',
        verified: true,
        status: 'active',
      },

      // 6. WALK-IN DRIVE: Field Sales & Logistics Coordinators - TOMORROW (Ghaziabad)
      {
        title: 'WALK-IN INTERVIEWS: Field Sales Executives & Logistics Leads',
        company: compMap['Nexus Retail & Logistics']._id,
        companyName: 'Nexus Retail & Logistics',
        companyLogo: compMap['Nexus Retail & Logistics'].logo,
        description: 'Immediate openings for Field Sales Officers and Logistics dispatchers across Ghaziabad & East Delhi. Same-day selection with attractive fuel allowance and incentives.',
        responsibilities: [
          'Client onboarding and route coordination in industrial hubs',
          'Vendor relationship management',
        ],
        requirements: [
          'Two-wheeler with valid driving license preferred for field sales',
          '12th pass or Graduate candidates eligible',
        ],
        skills: ['Field Sales', 'Client Relations', 'Logistics & Supply Chain'],
        category: 'Sales',
        categories: ['Sales', 'Operations'],
        subCategory: 'Field Sales',
        salaryMin: 280000,
        salaryMax: 480000,
        experienceLevel: 'Fresher',
        experienceMin: 0,
        experienceMax: 2,
        employmentType: 'Walk-in',
        workMode: 'On-site',
        locationName: 'Raj Nagar District Centre, Ghaziabad',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        location: { type: 'Point', coordinates: [77.4431, 28.6836] },
        postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        walkIn: true,
        walkInDate: tomorrow,
        walkInStartTime: '11:00 AM',
        walkInEndTime: '03:30 PM',
        venue: 'Nexus Hub, Plot 14, RDC Raj Nagar, Ghaziabad',
        requiredDocuments: ['Resume', 'Driving License / Aadhar Card'],
        contactPhone: '+91 120 8899776',
        source: 'ADMIN',
        verified: true,
        status: 'active',
      },

      // 7. DevOps & Cloud Engineer - Cyber City Gurugram
      {
        title: 'Cloud & DevOps Engineer (AWS / Kubernetes)',
        company: compMap['CyberGrid Systems']._id,
        companyName: 'CyberGrid Systems',
        companyLogo: compMap['CyberGrid Systems'].logo,
        description: 'Looking for a passionate DevOps engineer to manage high-availability Kubernetes clusters, automate CI/CD pipelines, and secure AWS infrastructure.',
        responsibilities: [
          'Provision infrastructure with Terraform and AWS CloudFormation',
          'Maintain Docker containers and Kubernetes orchestrations',
          'Automate deployment pipelines using GitHub Actions',
        ],
        requirements: [
          'Solid understanding of AWS services (EC2, S3, RDS, IAM)',
          'Experience with Docker, Kubernetes, and Linux shell scripting',
          'Knowledge of CI/CD concepts',
        ],
        skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Terraform', 'Git'],
        category: 'Technology / IT',
        categories: ['Technology / IT'],
        subCategory: 'DevOps & Cloud',
        salaryMin: 800000,
        salaryMax: 1600000,
        experienceLevel: '1-3 years',
        experienceMin: 1,
        experienceMax: 4,
        employmentType: 'Full Time',
        workMode: 'Hybrid',
        locationName: 'DLF Cyber City, Gurugram',
        city: 'Gurugram',
        state: 'Haryana',
        location: { type: 'Point', coordinates: [77.0895, 28.4952] },
        postedAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        walkIn: false,
        source: 'API',
        verified: true,
        status: 'active',
      },

      // 8. Python & Machine Learning Engineer - Cyber City Gurugram
      {
        title: 'Python Machine Learning & AI Engineer',
        company: compMap['CyberGrid Systems']._id,
        companyName: 'CyberGrid Systems',
        companyLogo: compMap['CyberGrid Systems'].logo,
        description: 'Build predictive AI engines and GenAI assistants utilizing Python, PyTorch, LangChain, and vector embeddings.',
        responsibilities: [
          'Design LLM agent workflows and fine-tune open-weight models',
          'Develop REST microservices using FastAPI',
          'Build end-to-end data pipelines with Pandas & NumPy',
        ],
        requirements: [
          'Strong Python programming background',
          'Experience with ML libraries (PyTorch/Scikit-Learn/TensorFlow)',
          'Familiarity with Generative AI / OpenAI / Gemini APIs',
        ],
        skills: ['Python', 'Machine Learning', 'Generative AI', 'FastAPI', 'Pandas', 'PyTorch'],
        category: 'Technology / IT',
        categories: ['Technology / IT'],
        subCategory: 'Data Science & AI',
        salaryMin: 900000,
        salaryMax: 1800000,
        experienceLevel: '1-3 years',
        experienceMin: 1,
        experienceMax: 3,
        employmentType: 'Full Time',
        workMode: 'Remote',
        locationName: 'DLF Phase 2, Gurugram',
        city: 'Gurugram',
        state: 'Haryana',
        location: { type: 'Point', coordinates: [77.0820, 28.5080] },
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        walkIn: false,
        source: 'API',
        verified: true,
        status: 'active',
      },

      // 9. Digital Marketing Executive - Connaught Place New Delhi
      {
        title: 'Digital Marketing & Growth Specialist',
        company: compMap['Apex Growth Media']._id,
        companyName: 'Apex Growth Media',
        companyLogo: compMap['Apex Growth Media'].logo,
        description: 'Drive high-ROI customer acquisition across Google Ads, Meta advertising, SEO optimization, and email nurturing funnels.',
        responsibilities: [
          'Plan and optimize Google Search & Meta ad campaigns',
          'Execute on-page and technical SEO strategies',
          'Analyze web traffic and conversions via Google Analytics 4',
        ],
        requirements: [
          'Hands-on experience in managing paid digital ad campaigns',
          'Strong knowledge of keyword research and SEO content architecture',
          'Data-driven mindset with analytical chops',
        ],
        skills: ['Digital Marketing', 'SEO / SEM', 'Social Media Marketing', 'Google Analytics'],
        category: 'Marketing',
        categories: ['Marketing'],
        subCategory: 'Digital Marketing',
        salaryMin: 400000,
        salaryMax: 750000,
        experienceLevel: '1-3 years',
        experienceMin: 1,
        experienceMax: 3,
        employmentType: 'Full Time',
        workMode: 'On-site',
        locationName: 'Inner Circle, Connaught Place, New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        location: { type: 'Point', coordinates: [77.2167, 28.6315] },
        postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        walkIn: false,
        source: 'ADMIN',
        verified: true,
        status: 'active',
      },

      // 10. Financial Analyst / Accountant - Nehru Place New Delhi
      {
        title: 'Corporate Financial Analyst & Accountant',
        company: compMap['FinVantage Advisors']._id,
        companyName: 'FinVantage Advisors',
        companyLogo: compMap['FinVantage Advisors'].logo,
        description: 'Manage corporate financial reporting, statutory audits, GST reconciliation, and variance analysis.',
        responsibilities: [
          'Prepare quarterly balance sheets and P&L financial statements',
          'Ensure accurate GST, TDS, and corporate tax compliance filings',
          'Perform budget variance modeling in Excel and Tally ERP',
        ],
        requirements: [
          'B.Com / M.Com / Inter CA candidate with solid accounting fundamentals',
          'Proficiency in Tally Prime, ERP systems, and Advanced Excel',
          'Knowledge of Indian taxation regulations',
        ],
        skills: ['Accountant', 'Financial Analyst', 'Taxation & GST', 'Advanced Excel', 'Tally'],
        category: 'Finance',
        categories: ['Finance'],
        subCategory: 'Financial Analyst',
        salaryMin: 450000,
        salaryMax: 800000,
        experienceLevel: '1-3 years',
        experienceMin: 1,
        experienceMax: 3,
        employmentType: 'Full Time',
        workMode: 'On-site',
        locationName: 'Nehru Place Financial District, New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        location: { type: 'Point', coordinates: [77.2514, 28.5492] },
        postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        walkIn: false,
        source: 'ADMIN',
        verified: true,
        status: 'active',
      },

      // 11. UI/UX Designer - Noida Sector 62
      {
        title: 'UI/UX & Product Designer',
        company: compMap['InnovaTech Solutions']._id,
        companyName: 'InnovaTech Solutions',
        companyLogo: compMap['InnovaTech Solutions'].logo,
        description: 'Design intuitive interfaces, interactive wireframes, and design systems for enterprise SaaS tools using Figma.',
        responsibilities: [
          'Create user journey maps, wireframes, and high-fidelity clickable prototypes in Figma',
          'Conduct usability feedback sessions with end users',
          'Collaborate with React engineers to ensure pixel-perfect implementation',
        ],
        requirements: [
          'Strong portfolio demonstrating UI design systems and UX problem solving',
          'Mastery of Figma, auto-layout, and design tokens',
          'Understanding of web accessibility (WCAG)',
        ],
        skills: ['Figma', 'UI Design', 'UX Research', 'UI/UX Design'],
        category: 'Design',
        categories: ['Design'],
        subCategory: 'UI/UX Design',
        salaryMin: 500000,
        salaryMax: 1000000,
        experienceLevel: 'Fresher',
        experienceMin: 0,
        experienceMax: 2,
        employmentType: 'Full Time',
        workMode: 'Hybrid',
        locationName: 'Sector 62, Noida',
        city: 'Noida',
        state: 'Uttar Pradesh',
        location: { type: 'Point', coordinates: [77.3630, 28.6270] },
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        walkIn: false,
        source: 'EMPLOYER',
        postedBy: employerUser._id,
        verified: true,
        status: 'active',
      },

      // 12. QA Automation Engineer - Noida
      {
        title: 'QA Automation Engineer (Selenium & Cypress)',
        company: compMap['InnovaTech Solutions']._id,
        companyName: 'InnovaTech Solutions',
        companyLogo: compMap['InnovaTech Solutions'].logo,
        description: 'Develop automated test frameworks for web applications and REST APIs to prevent regressions and accelerate CI/CD release cycles.',
        responsibilities: [
          'Write end-to-end automation test scripts in Cypress and Selenium',
          'Perform manual boundary and stress testing before production releases',
          'Integrate test runners into GitHub Actions pipelines',
        ],
        requirements: [
          'Proficiency in JavaScript or Python test automation scripting',
          'Hands-on experience with Cypress, Selenium, or Playwright',
          'Familiarity with Postman API testing',
        ],
        skills: ['Selenium', 'Cypress', 'QA Testing', 'Automation Testing', 'JavaScript', 'Jest'],
        category: 'Technology / IT',
        categories: ['Technology / IT'],
        subCategory: 'QA / Testing',
        salaryMin: 450000,
        salaryMax: 850000,
        experienceLevel: 'Fresher',
        experienceMin: 0,
        experienceMax: 2,
        employmentType: 'Full Time',
        workMode: 'Hybrid',
        locationName: 'Sector 62, Noida',
        city: 'Noida',
        state: 'Uttar Pradesh',
        location: { type: 'Point', coordinates: [77.3655, 28.6290] },
        postedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        walkIn: false,
        source: 'EMPLOYER',
        postedBy: employerUser._id,
        verified: true,
        status: 'active',
      },
    ];

    // Compute duplicate hashes for each job
    seedJobs.forEach((j) => {
      j.duplicateHash = generateDuplicateHash(j.companyName, j.title, j.locationName);
    });

    await Job.insertMany(seedJobs);
    console.log(`Successfully seeded ${seedJobs.length} jobs with realistic GeoJSON points & walk-ins!`);

    console.log('\n========================================');
    console.log(' SEED COMPLETED SUCCESSFULLY! ');
    console.log('========================================');
    console.log('Demo Credentials:');
    console.log('1. Job Seeker : candidate@nearhire.com / password123 (Noida Sec 62)');
    console.log('2. Employer   : employer@innovatech.com / password123');
    console.log('3. Admin      : admin@nearhire.com / admin123');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed Database Error:', err);
    process.exit(1);
  }
}

seedDatabase();

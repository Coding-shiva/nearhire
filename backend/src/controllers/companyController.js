const mongoose = require('mongoose');
const Company = require('../models/Company');
const Job = require('../models/Job');
const { success, error } = require('../utils/apiResponse');
const { resolveKnownLocation } = require('../utils/geoUtils');
const { MOCK_JOBS_DATA } = require('../utils/mockJobsData');

const MOCK_COMPANIES = [
  {
    _id: '670000000000000000000011',
    name: 'Tata Consultancy Services (TCS)',
    slug: 'tcs',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
    industry: 'Technology / IT',
    description: 'Leading global IT services, consulting and business solutions organization with a major campus in Sector 62, Noida.',
    address: { area: 'Plot 22 & 23, Sector 62', city: 'Noida', state: 'Uttar Pradesh' },
    website: 'https://www.tcs.com/careers',
    verified: true,
  },
  {
    _id: '670000000000000000000012',
    name: 'Tech Mahindra',
    slug: 'tech-mahindra',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
    industry: 'Technology / IT',
    description: 'Digital transformation, consulting and business re-engineering solutions company headquartered with a premier development center in Sector 62, Noida.',
    address: { area: 'A-7, Sector 62', city: 'Noida', state: 'Uttar Pradesh' },
    website: 'https://careers.techmahindra.com',
    verified: true,
  },
  {
    _id: '670000000000000000000013',
    name: 'Samsung R&D Institute India',
    slug: 'samsung-rd',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
    industry: 'Technology / IT',
    description: 'Samsung Electronics advanced software and AI engineering institute located in Logix Cyber Park, Sector 62, Noida.',
    address: { area: 'Logix Cyber Park, Sector 62', city: 'Noida', state: 'Uttar Pradesh' },
    website: 'https://research.samsung.com',
    verified: true,
  },
  {
    _id: '670000000000000000000014',
    name: 'HCL Technologies',
    slug: 'hcl-technologies',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150&auto=format&fit=crop&q=80',
    industry: 'Technology / IT',
    description: 'Global technology enterprise helping businesses reimagine their products with world-class engineering campus in Sector 126, Noida.',
    address: { area: 'Technology Hub, Sector 126', city: 'Noida', state: 'Uttar Pradesh' },
    website: 'https://www.hcltech.com/careers',
    verified: true,
  },
  {
    _id: '670000000000000000000015',
    name: 'Paytm (One97 Communications)',
    slug: 'paytm',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
    industry: 'Technology / IT',
    description: "India's leading payments and financial services distribution powerhouse based out of One Skymark, Sector 98, Noida.",
    address: { area: 'One Skymark, Sector 98', city: 'Noida', state: 'Uttar Pradesh' },
    website: 'https://paytm.com/careers',
    verified: true,
  },
  {
    _id: '670000000000000000000016',
    name: 'Info Edge (Naukri.com)',
    slug: 'info-edge',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
    industry: 'Human Resources',
    description: 'Premier online classifieds company pioneering Indian internet recruitment, based out of Sector 132, Noida.',
    address: { area: 'B-8, Sector 132', city: 'Noida', state: 'Uttar Pradesh' },
    website: 'https://www.infoedge.in/careers',
    verified: true,
  },
  {
    _id: '670000000000000000000017',
    name: 'Adobe Systems India',
    slug: 'adobe',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
    industry: 'Technology / IT',
    description: 'Global leader in digital media and digital marketing software with expansive campus in Sector 132, Noida.',
    address: { area: 'Adobe Towers, Sector 132', city: 'Noida', state: 'Uttar Pradesh' },
    website: 'https://www.adobe.com/careers',
    verified: true,
  },
];

/**
 * @desc    Get companies directory
 * @route   GET /api/companies
 */
const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, verified, page = 1, limit = 12 } = req.query;

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (search) query.name = { $regex: search, $options: 'i' };
        if (industry && industry !== 'All') query.industry = industry;
        if (verified === 'true') query.verified = true;

        const total = await Company.countDocuments(query);
        const companies = await Company.find(query)
          .sort({ verified: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit));

        if (companies.length > 0) {
          return success(res, { companies, total, page: parseInt(page), totalPages: Math.ceil(total / limit) || 1 });
        }
      } catch (e) {}
    }

    // Fallback
    let pool = MOCK_COMPANIES;
    if (search) pool = pool.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (industry && industry !== 'All') pool = pool.filter((c) => c.industry === industry);

    return success(
      res,
      {
        companies: pool,
        total: pool.length,
        page: 1,
        totalPages: 1,
      },
      'Companies retrieved (in-memory)'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get company details with active jobs and walk-ins
 * @route   GET /api/companies/:id
 */
const getCompanyById = async (req, res, next) => {
  try {
    let company = null;
    let activeJobs = [];

    if (mongoose.connection.readyState === 1) {
      try {
        company = await Company.findById(req.params.id);
        if (company) {
          activeJobs = await Job.find({
            $or: [{ company: company._id }, { companyName: company.name }],
            status: 'active',
          }).sort({ postedAt: -1 });
        }
      } catch (e) {}
    }

    if (!company) {
      company = MOCK_COMPANIES.find((c) => c._id === req.params.id || c.slug === req.params.id) || MOCK_COMPANIES[0];
      activeJobs = MOCK_JOBS_DATA.filter((j) => j.companyName === company.name);
    }

    const walkIns = activeJobs.filter((j) => j.walkIn);

    return success(
      res,
      {
        company,
        activeJobs,
        walkIns,
        totalJobs: activeJobs.length,
      },
      'Company details retrieved'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Register company (Employer)
 * @route   POST /api/companies
 */
const createCompany = async (req, res, next) => {
  try {
    const { name, industry, description, website, email, phone, city, state, area, latitude, longitude, logo } = req.body;

    if (mongoose.connection.readyState === 1) {
      const company = await Company.create({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        industry: industry || 'Technology / IT',
        description: description || '',
        website: website || '',
        email: email || '',
        phone: phone || '',
        address: { city: city || 'Noida', state: state || 'Uttar Pradesh', area: area || '' },
        location: { type: 'Point', coordinates: [77.3649, 28.6280] },
        logo: logo || undefined,
        createdBy: req.user?._id || null,
        verified: true,
      });
      return success(res, company, 'Company registered successfully', 201);
    }

    const mockNew = {
      _id: `comp-${Date.now()}`,
      name,
      industry: industry || 'Technology / IT',
      description,
      address: { city: city || 'Noida' },
      verified: true,
    };
    return success(res, mockNew, 'Company registered (fallback mode)', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
};

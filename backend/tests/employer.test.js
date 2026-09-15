const request = require('supertest');
const app = require('../src/app');

describe('Employer Flow Verification (Option 4)', () => {
  let employerToken = '';

  it('1. should register a new employer successfully in offline mode', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sharma Tech Recruiters',
        email: 'recruiter@sharmatech.com',
        password: 'password123',
        role: 'EMPLOYER',
        headline: 'Lead Talent Partner',
        locationName: 'Noida Sector 62',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('EMPLOYER');
    expect(res.body.data.token).toBeDefined();
    employerToken = res.body.data.token;
  });

  it('2. should verify /api/auth/me retains EMPLOYER role', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${employerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.role).toBe('EMPLOYER');
  });

  it('3. should post a new job opportunity as an employer', async () => {
    const res = await request(app)
      .post('/api/employer/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Senior MERN Stack Architect',
        companyName: 'Sharma Tech Corp',
        description: 'Building next-generation real-time geospatial applications.',
        category: 'Technology / IT',
        skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
        locationName: 'Sector 62, Noida',
        city: 'Noida',
        walkIn: true,
        walkInDate: '2026-09-20',
        walkInStartTime: '10:00 AM',
        walkInEndTime: '04:00 PM',
        venue: 'Tower 4, Ground Floor, Sector 62 Noida',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Senior MERN Stack Architect');
    expect(res.body.data.walkIn).toBe(true);
  });

  it('4. should list employer postings including the newly created job', async () => {
    const res = await request(app)
      .get('/api/employer/jobs')
      .set('Authorization', `Bearer ${employerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    const posted = res.body.data.find((j) => j.title === 'Senior MERN Stack Architect');
    expect(posted).toBeDefined();
  });

  it('5. should fetch applicants list for the posted job', async () => {
    const jobsRes = await request(app)
      .get('/api/employer/jobs')
      .set('Authorization', `Bearer ${employerToken}`);

    const jobId = jobsRes.body.data[0]._id;
    const res = await request(app)
      .get(`/api/employer/jobs/${jobId}/applicants`)
      .set('Authorization', `Bearer ${employerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.applicants).toBeDefined();
    expect(Array.isArray(res.body.data.applicants)).toBe(true);
  });
});

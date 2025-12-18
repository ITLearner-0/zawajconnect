-- Seed data for IT Certifications

-- Insert popular IT certifications
INSERT INTO it_certifications (name, code, description, passing_score, exam_duration, is_active) VALUES
  (
    'AWS Certified Solutions Architect - Associate',
    'AWS-SAA-C03',
    'Validates ability to design and implement distributed systems on AWS',
    72,
    130,
    true
  ),
  (
    'AWS Certified Cloud Practitioner',
    'AWS-CLF-C02',
    'Foundational understanding of AWS Cloud concepts, services, and terminology',
    70,
    90,
    true
  ),
  (
    'Microsoft Azure Fundamentals',
    'AZ-900',
    'Foundational knowledge of cloud services and how those services are provided with Microsoft Azure',
    70,
    60,
    true
  ),
  (
    'Microsoft Azure Administrator',
    'AZ-104',
    'Skills to implement, manage, and monitor Azure environments',
    70,
    120,
    true
  ),
  (
    'CompTIA A+',
    'COMPTIA-A+',
    'Entry-level IT certification covering hardware, software, networking, and security',
    70,
    90,
    true
  ),
  (
    'CompTIA Network+',
    'COMPTIA-NET+',
    'Certification for networking professionals covering network technologies, installation, and troubleshooting',
    72,
    90,
    true
  ),
  (
    'CompTIA Security+',
    'COMPTIA-SEC+',
    'Validates baseline cybersecurity skills for IT professionals',
    75,
    90,
    true
  ),
  (
    'Cisco CCNA',
    'CCNA-200-301',
    'Cisco Certified Network Associate - Foundation in networking fundamentals',
    80,
    120,
    true
  ),
  (
    'Google Cloud Associate Cloud Engineer',
    'GCP-ACE',
    'Demonstrates ability to deploy applications, monitor operations, and manage enterprise solutions on Google Cloud',
    70,
    120,
    true
  ),
  (
    'Certified Kubernetes Administrator',
    'CKA',
    'Validates skills required to be a successful Kubernetes Administrator',
    66,
    120,
    true
  ),
  (
    'Certified Information Systems Security Professional',
    'CISSP',
    'Advanced-level certification for IT security professionals',
    70,
    180,
    true
  ),
  (
    'Project Management Professional',
    'PMP',
    'Globally recognized project management certification',
    61,
    230,
    true
  )
ON CONFLICT (code) DO NOTHING;

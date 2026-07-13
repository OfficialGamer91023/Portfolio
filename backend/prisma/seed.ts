import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedExperience(): Promise<void> {
  const experiences = [
    {
      company: 'Google Summer of Code',
      role: 'Open Source Developer',
      location: 'Remote',
      startDate: 'May 2025',
      endDate: 'Sep 2025',
      order: 0,
      bullets: [
        'Owned a complex deliverable end-to-end: scoped from first principles, implemented in C++, and shipped with a 50+ case test suite covering edge cases — merged into a production codebase used by millions.',
        'Replaced fragile floating-point logic with error-bounded interval arithmetic, resolving a long-standing robustness gap in lib2geom.',
        'Collaborated asynchronously with senior open-source maintainers through structured code review cycles, raising API surface design standards.',
      ],
    },
    {
      company: 'Inkscape',
      role: 'Open Source Developer',
      location: 'Remote',
      startDate: 'Oct 2024',
      endDate: 'May 2025',
      order: 1,
      bullets: [
        'Independently diagnosed and resolved high-impact bugs across rendering, tool interaction, and editor state layers in a multi-hundred-thousand-line C++/GTK project with no onboarding documentation.',
        'Maintained CI integrity across 5+ dependent tool behaviors and delivered regression-free fixes improving reliability for 3M+ active users.',
        'Communicated technical decisions clearly in async review threads, contributing to knowledge-sharing across a globally distributed contributor base.',
      ],
    },
    {
      company: 'Systems Limited',
      role: 'Software Engineering Intern',
      location: 'Lahore',
      startDate: 'Jul 2024',
      endDate: 'Sep 2024',
      order: 2,
      bullets: [
        'Designed and deployed cloud solutions on AWS (EC2, S3, RDS, Lambda), containerized workloads with Docker and Kubernetes, and strengthened security across 3 production environments.',
        'Integrated cloud infrastructure into existing product workflows: RESTful API integration, database optimization on RDS, and scalable deployment practices.',
      ],
    },
    {
      company: 'Systems Limited',
      role: 'Software Engineering Intern',
      location: 'Lahore',
      startDate: 'Jul 2023',
      endDate: 'Sep 2023',
      order: 3,
      bullets: [
        'Designed and deployed cloud solutions on AWS (EC2, S3, RDS, Lambda), containerized workloads with Docker and Kubernetes, and strengthened security across 3 production environments.',
        'Integrated cloud infrastructure into existing product workflows: RESTful API integration, database optimization on RDS, and scalable deployment practices.',
      ],
    },
  ];

  for (const exp of experiences) {
    await prisma.experience.create({ data: exp });
  }
  console.log(`Seeded ${experiences.length} experiences`);
}

async function seedProjects(): Promise<void> {
  const projects = [
    {
      title: 'SmartEngage',
      description:
        'Full-stack ML platform that ingests social media telemetry via async pipelines, predicts content virality with a hybrid ML model, and routes drafts through an agentic RAG loop backed by a vector DB and LLM orchestrator. Containerized with Docker; data modeling layer designed for scalable PostgreSQL queries.',
      tags: ['Python', 'FastAPI', 'XGBoost', 'PyTorch', 'LangChain', 'PostgreSQL', 'Docker', 'ChromaDB'],
      githubUrl: '#',
      featured: true,
      order: 0,
    },
    {
      title: 'Blood Bank Management System',
      description:
        'Designed a normalized relational schema across 7 entities and built a full-stack web platform enabling real-time inventory tracking with role-based access control. Implemented PDO-parameterized queries and separate admin/donor portals.',
      tags: ['PHP', 'MySQL', 'JavaScript', 'HTML5', 'CSS3'],
      githubUrl: '#',
      featured: true,
      order: 1,
    },
    {
      title: 'Image Segmentation Engine (HPC)',
      description:
        'High-performance image segmentation tool using hybrid CPU/GPU parallelism. Built with CUDA for GPU acceleration and OpenMP for CPU-level threading, enabling real-time processing of high-resolution images.',
      tags: ['CUDA', 'C++', 'OpenMP'],
      githubUrl: '#',
      featured: false,
      order: 2,
    },
    {
      title: 'Multithreaded HTTP Server',
      description:
        'Engineered a multithreaded web server from scratch using C++ sockets and a custom HTTP parser. Handles concurrent connections via Pthreads with a thread pool architecture for optimal resource utilization.',
      tags: ['C++', 'Socket API', 'Pthreads'],
      githubUrl: '#',
      featured: false,
      order: 3,
    },
  ];

  for (const project of projects) {
    await prisma.project.create({ data: project });
  }
  console.log(`Seeded ${projects.length} projects`);
}

async function seedSkills(): Promise<void> {
  const skillsByCategory: Record<string, string[]> = {
    Languages: ['C++', 'JavaScript', 'TypeScript', 'Python', 'Java'],
    Frontend: ['React', 'Next.js', 'Tailwind CSS', 'HTML5/CSS3'],
    'Backend & APIs': ['Node.js', 'FastAPI', 'REST API Design'],
    Databases: ['PostgreSQL', 'MySQL'],
    'Cloud & DevOps': ['AWS (EC2, Lambda, RDS, S3, ECS/Fargate)', 'Docker', 'Kubernetes', 'CI/CD'],
    'ML/AI': ['PyTorch', 'LangChain', 'RAG', 'LLMs', 'XGBoost'],
    Tools: ['Git', 'GitHub/GitLab', 'CMake', 'Google Test', 'Linux'],
  };

  let count = 0;
  for (const [category, skills] of Object.entries(skillsByCategory)) {
    for (const name of skills) {
      await prisma.skill.create({ data: { name, category } });
      count++;
    }
  }
  console.log(`Seeded ${count} skills`);
}

async function main(): Promise<void> {
  console.log('Starting database seed...');

  // Clear existing data to allow re-seeding
  await prisma.contactSubmission.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.project.deleteMany();
  await prisma.experience.deleteMany();

  await seedExperience();
  await seedProjects();
  await seedSkills();

  console.log('Database seeded successfully!');
}

main()
  .catch((error: Error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

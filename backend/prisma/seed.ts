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
  // The "verified notebook" work cases: problem -> method -> verified.
  const projects = [
    {
      title: 'lib2geom — intersection engine',
      subtitle: 'C++ · Google Test · Inkscape · merged to production',
      figNo: 'fig.02',
      description:
        'Error-bounded curve-curve intersection for lib2geom, the geometry library behind Inkscape.',
      problem:
        'Degenerate curve-curve configs returned wrong results; fragile floating-point logic.',
      method:
        'Replaced it with error-bounded interval arithmetic, scoped from first principles.',
      verified:
        '50+ case test suite: tangent, overlapping, precision-sensitive edges. Merged, used by millions.',
      tags: ['C++', 'interval arithmetic', 'Google Test', 'numerical methods'],
      githubUrl: 'https://gitlab.com/inkscape/lib2geom',
      featured: true,
      order: 0,
    },
    {
      title: 'Vigil — autonomous options-trading agent',
      subtitle: 'Python · FastAPI · Alpaca · LLM + deterministic kernel · lablab.ai hackathon',
      figNo: 'fig.03',
      description:
        'An LLM portfolio manager that cannot act without clearing a deterministic risk gate.',
      problem: "An LLM portfolio manager can't be trusted to place real trades unchecked.",
      method:
        'Split it: a deterministic 12-gate risk kernel as pure functions ahead of every order; the model only proposes.',
      verified:
        'Hypothesis property test proves the per-trade invariant; 241-test suite green under mypy --strict.',
      tags: ['Python', 'LLM orchestration', 'Hypothesis', 'SQLAlchemy async', 'Decimal money'],
      githubUrl: '#',
      featured: true,
      order: 1,
    },
    {
      title: 'Real-time healthcare voice agent',
      subtitle: 'Node.js · Twilio Media Streams · AWS Bedrock Nova Sonic · ECS/Fargate',
      figNo: 'fig.04',
      description:
        'HIPAA-eligible, auditable real-time medical voice built on a config-driven multi-agent architecture.',
      problem: 'Real-time medical voice needs to be HIPAA-eligible and auditable end-to-end.',
      method:
        'Config-driven multi-agent architecture: 20 agents, one codebase, KMS-encrypted S3 pipeline.',
      verified: 'PostgreSQL audit trails + full integration test suite.',
      tags: ['TypeScript', 'Twilio', 'Bedrock', 'multi-agent', 'HIPAA'],
      githubUrl: '#',
      featured: true,
      order: 2,
    },
  ];

  for (const project of projects) {
    await prisma.project.create({ data: project });
  }
  console.log(`Seeded ${projects.length} projects`);
}

async function seedContributions(): Promise<void> {
  // The open-source ledger — every row is a real, linkable contribution.
  // statusKind 'verify' = merged (green check), 'plot' = still in review (orange).
  const contributions = [
    {
      project: 'GSoC 2025 · lib2geom',
      detail: "Boost interval-arithmetic library integration",
      status: 'merged',
      statusKind: 'verify',
      url: 'https://gitlab.com/rafay119muhammad/lib2geom/-/commit/cbd238ab33448d9be8506a7ca2b53038147b9487',
      order: 0,
    },
    {
      project: 'GSoC 2025 · lib2geom',
      detail: 'line-segment intersection routine',
      status: 'merged',
      statusKind: 'verify',
      url: 'https://gitlab.com/rafay119muhammad/lib2geom/-/commit/2ac679425bedfc1adf74c4b319e028674212251a',
      order: 1,
    },
    {
      project: 'GSoC 2025 · lib2geom',
      detail: 'general curve-intersection algorithm',
      status: 'in review',
      statusKind: 'plot',
      url: 'https://gitlab.com/inkscape/lib2geom/-/merge_requests/140',
      order: 2,
    },
    {
      project: 'Inkscape',
      detail: 'fix path-simplify inflating node count on beziers',
      status: 'merged',
      statusKind: 'verify',
      url: 'https://gitlab.com/inkscape/inkscape/-/merge_requests/7029',
      order: 3,
    },
    {
      project: 'Inkscape',
      detail: 'quick-preview / zoom shortcut labels',
      status: 'merged',
      statusKind: 'verify',
      url: 'https://gitlab.com/inkscape/inkscape/-/merge_requests/6936',
      order: 4,
    },
    {
      project: 'Inkscape',
      detail: 'null check to prevent shortcut-label crash',
      status: 'merged',
      statusKind: 'verify',
      url: 'https://gitlab.com/inkscape/inkscape/-/merge_requests/6968',
      order: 5,
    },
    {
      project: 'HAMi-core (CNCF) · #275',
      detail: 'fix global buffer overflow in parse_cuda_visible_env',
      status: 'merged',
      statusKind: 'verify',
      url: 'https://github.com/Project-HAMi/HAMi-core/pull/275',
      order: 6,
    },
    {
      project: 'HAMi-core (CNCF) · #265',
      detail: 'fix unsigned integer underflow in getextrapid',
      status: 'merged',
      statusKind: 'verify',
      url: 'https://github.com/Project-HAMi/HAMi-core/pull/265',
      order: 7,
    },
  ];

  for (const c of contributions) {
    await prisma.openSourceContribution.create({ data: c });
  }
  console.log(`Seeded ${contributions.length} contributions`);
}

async function seedRuns(): Promise<void> {
  // Real training data: Samsung Health export, aggregated per day.
  // pace = min/km, dur = moving minutes, speed = km/h; hr/elev null when unrecorded.
  const RUN: Record<
    string,
    { cal: number | null; dur: number; elev: number | null; hr: number | null; km: number; note: string; pace: number; speed: number }
  > = {"2022-07-09":{"cal":319,"dur":38.4,"elev":null,"hr":169,"km":4.49,"note":"afternoon run","pace":8.553,"speed":7.02},"2022-07-13":{"cal":211,"dur":24.6,"elev":null,"hr":157,"km":2.82,"note":"afternoon run","pace":8.728,"speed":6.87},"2023-03-09":{"cal":154,"dur":16.0,"elev":null,"hr":null,"km":2.32,"note":"afternoon run","pace":6.894,"speed":8.7},"2023-05-15":{"cal":104,"dur":8.2,"elev":0,"hr":null,"km":1.64,"note":"afternoon run","pace":5.003,"speed":11.99},"2023-07-02":{"cal":196,"dur":21.8,"elev":null,"hr":191,"km":3.33,"note":"afternoon run","pace":6.555,"speed":9.15},"2023-07-12":{"cal":119,"dur":9.5,"elev":0,"hr":null,"km":1.73,"note":"afternoon run","pace":5.506,"speed":10.9},"2023-07-14":{"cal":147,"dur":21.0,"elev":null,"hr":null,"km":2.77,"note":"afternoon run","pace":7.58,"speed":7.92},"2023-07-16":{"cal":115,"dur":9.6,"elev":null,"hr":189,"km":1.81,"note":"afternoon run","pace":5.335,"speed":11.25},"2023-07-26":{"cal":135,"dur":15.5,"elev":0,"hr":null,"km":2.19,"note":"afternoon run","pace":7.103,"speed":8.45},"2023-07-28":{"cal":251,"dur":30.4,"elev":null,"hr":197,"km":4.57,"note":"afternoon run","pace":6.666,"speed":9.0},"2023-07-30":{"cal":99,"dur":8.7,"elev":null,"hr":135,"km":1.4,"note":"afternoon run","pace":6.237,"speed":9.62},"2023-08-04":{"cal":160,"dur":16.9,"elev":null,"hr":190,"km":2.46,"note":"afternoon run","pace":6.886,"speed":8.71},"2023-08-06":{"cal":98,"dur":8.5,"elev":null,"hr":188,"km":1.76,"note":"afternoon run","pace":4.843,"speed":12.39},"2023-08-09":{"cal":180,"dur":20.0,"elev":null,"hr":178,"km":2.67,"note":"afternoon run","pace":7.491,"speed":8.01},"2023-08-11":{"cal":95,"dur":8.3,"elev":null,"hr":193,"km":1.37,"note":"afternoon run","pace":6.07,"speed":9.88},"2023-08-13":{"cal":296,"dur":27.7,"elev":null,"hr":192,"km":4.48,"note":"afternoon run","pace":6.18,"speed":9.71},"2023-08-15":{"cal":93,"dur":8.2,"elev":null,"hr":189,"km":1.67,"note":"afternoon run","pace":4.936,"speed":12.16},"2023-08-17":{"cal":279,"dur":25.8,"elev":null,"hr":192,"km":4.14,"note":"afternoon run","pace":6.228,"speed":9.63},"2023-08-20":{"cal":95,"dur":7.8,"elev":null,"hr":189,"km":1.63,"note":"afternoon run","pace":4.793,"speed":12.52},"2023-08-22":{"cal":215,"dur":23.5,"elev":null,"hr":191,"km":3.5,"note":"afternoon run","pace":6.723,"speed":8.92},"2023-08-26":{"cal":348,"dur":32.1,"elev":null,"hr":192,"km":5.1,"note":"afternoon run","pace":6.298,"speed":9.53},"2023-08-30":{"cal":87,"dur":7.6,"elev":null,"hr":192,"km":1.62,"note":"afternoon run","pace":4.71,"speed":12.74},"2023-09-26":{"cal":95,"dur":18.0,"elev":null,"hr":null,"km":1.69,"note":"afternoon run","pace":10.656,"speed":5.63},"2024-01-25":{"cal":107,"dur":10.2,"elev":null,"hr":168,"km":1.62,"note":"morning run","pace":6.315,"speed":9.5},"2024-02-21":{"cal":136,"dur":17.0,"elev":null,"hr":null,"km":2.43,"note":"afternoon run","pace":7.004,"speed":8.57},"2024-02-22":{"cal":302,"dur":38.5,"elev":null,"hr":135,"km":4.93,"note":"afternoon run","pace":7.814,"speed":7.68},"2024-02-27":{"cal":152,"dur":21.0,"elev":null,"hr":null,"km":2.66,"note":"afternoon run","pace":7.897,"speed":7.6},"2024-03-11":{"cal":238,"dur":21.0,"elev":null,"hr":149,"km":4.02,"note":"afternoon run","pace":5.228,"speed":11.48},"2024-03-14":{"cal":259,"dur":21.7,"elev":null,"hr":161,"km":4.01,"note":"evening run","pace":5.424,"speed":11.06},"2024-03-23":{"cal":799,"dur":75.8,"elev":null,"hr":192,"km":12.16,"note":"evening run · long","pace":6.23,"speed":9.63},"2024-04-06":{"cal":203,"dur":17.6,"elev":0,"hr":null,"km":3.31,"note":"evening run","pace":5.315,"speed":11.29},"2024-06-20":{"cal":191,"dur":25.0,"elev":null,"hr":null,"km":3.39,"note":"afternoon run","pace":7.374,"speed":8.14},"2024-06-27":{"cal":247,"dur":35.0,"elev":null,"hr":null,"km":4.47,"note":"afternoon run","pace":7.829,"speed":7.66},"2024-07-01":{"cal":159,"dur":25.9,"elev":null,"hr":null,"km":2.91,"note":"afternoon run","pace":8.884,"speed":6.75},"2024-07-03":{"cal":248,"dur":32.6,"elev":null,"hr":null,"km":4.33,"note":"afternoon run","pace":7.538,"speed":7.96},"2024-07-08":{"cal":302,"dur":40.0,"elev":null,"hr":null,"km":5.31,"note":"afternoon run","pace":7.536,"speed":7.96},"2024-07-12":{"cal":360,"dur":46.7,"elev":null,"hr":null,"km":6.22,"note":"afternoon run","pace":7.503,"speed":8.0},"2024-07-16":{"cal":294,"dur":41.8,"elev":null,"hr":null,"km":5.25,"note":"afternoon run","pace":7.954,"speed":7.54},"2024-07-22":{"cal":303,"dur":39.8,"elev":null,"hr":null,"km":5.32,"note":"afternoon run","pace":7.474,"speed":8.03},"2024-07-27":{"cal":288,"dur":38.0,"elev":null,"hr":null,"km":5.07,"note":"afternoon run","pace":7.487,"speed":8.01},"2024-08-02":{"cal":370,"dur":46.9,"elev":null,"hr":null,"km":6.33,"note":"afternoon run","pace":7.399,"speed":8.11},"2024-08-21":{"cal":282,"dur":36.0,"elev":null,"hr":null,"km":4.93,"note":"afternoon run","pace":7.307,"speed":8.21},"2026-01-08":{"cal":240,"dur":30.0,"elev":null,"hr":null,"km":4.22,"note":"afternoon run","pace":7.113,"speed":8.44},"2026-01-09":{"cal":326,"dur":38.0,"elev":null,"hr":null,"km":5.62,"note":"afternoon run","pace":6.76,"speed":8.88},"2026-01-11":{"cal":394,"dur":33.4,"elev":0,"hr":null,"km":5.01,"note":"afternoon run","pace":6.657,"speed":9.01},"2026-01-13":{"cal":547,"dur":46.4,"elev":0,"hr":null,"km":7.19,"note":"afternoon run","pace":6.46,"speed":9.29},"2026-01-14":{"cal":369,"dur":30.4,"elev":0,"hr":null,"km":5.01,"note":"afternoon run","pace":6.075,"speed":9.88},"2026-01-16":{"cal":828,"dur":70.6,"elev":0,"hr":null,"km":10.0,"note":"afternoon run","pace":7.052,"speed":8.51},"2026-01-19":{"cal":1147,"dur":100.4,"elev":0,"hr":null,"km":15.01,"note":"afternoon run · long","pace":6.693,"speed":8.96},"2026-01-22":{"cal":336,"dur":30.5,"elev":0,"hr":null,"km":4.18,"note":"morning run","pace":7.309,"speed":8.21},"2026-01-25":{"cal":1881,"dur":168.8,"elev":0,"hr":null,"km":21.06,"note":"morning run · long","pace":8.014,"speed":7.49},"2026-02-01":{"cal":96,"dur":8.4,"elev":0,"hr":null,"km":1.45,"note":"afternoon run","pace":5.753,"speed":10.43},"2026-02-13":{"cal":364,"dur":31.1,"elev":0,"hr":null,"km":4.47,"note":"afternoon run","pace":6.962,"speed":8.62},"2026-02-15":{"cal":1892,"dur":156.4,"elev":0,"hr":null,"km":21.42,"note":"morning run · long","pace":7.301,"speed":8.22},"2026-04-18":{"cal":184,"dur":19.9,"elev":0,"hr":null,"km":3.03,"note":"evening run","pace":6.569,"speed":9.13},"2026-05-09":{"cal":179,"dur":20.7,"elev":null,"hr":null,"km":3.05,"note":"afternoon run","pace":6.784,"speed":8.84},"2026-05-14":{"cal":348,"dur":35.9,"elev":null,"hr":null,"km":5.88,"note":"afternoon run","pace":6.112,"speed":9.82},"2026-05-20":{"cal":335,"dur":38.8,"elev":null,"hr":null,"km":5.72,"note":"afternoon run","pace":6.776,"speed":8.86},"2026-05-28":{"cal":188,"dur":20.6,"elev":0,"hr":null,"km":3.3,"note":"afternoon run","pace":6.249,"speed":9.6},"2026-06-01":{"cal":282,"dur":34.0,"elev":null,"hr":null,"km":4.82,"note":"afternoon run","pace":7.046,"speed":8.51},"2026-06-03":{"cal":410,"dur":46.8,"elev":null,"hr":null,"km":7.06,"note":"afternoon run","pace":6.627,"speed":9.05},"2026-06-05":{"cal":257,"dur":40.0,"elev":0,"hr":null,"km":4.63,"note":"afternoon run","pace":8.643,"speed":6.94},"2026-06-07":{"cal":274,"dur":35.3,"elev":0,"hr":null,"km":5.2,"note":"afternoon run","pace":6.792,"speed":8.83},"2026-06-10":{"cal":271,"dur":37.8,"elev":0,"hr":null,"km":5.3,"note":"afternoon run","pace":7.126,"speed":8.42},"2026-06-12":{"cal":366,"dur":46.1,"elev":0,"hr":null,"km":6.43,"note":"afternoon run","pace":7.173,"speed":8.36},"2026-06-14":{"cal":378,"dur":43.5,"elev":0,"hr":null,"km":6.45,"note":"afternoon run","pace":6.732,"speed":8.91},"2026-06-17":{"cal":408,"dur":60.6,"elev":0,"hr":null,"km":8.12,"note":"afternoon run","pace":7.459,"speed":8.04},"2026-07-02":{"cal":248,"dur":37.7,"elev":0,"hr":null,"km":5.26,"note":"afternoon run","pace":7.168,"speed":8.37},"2026-07-11":{"cal":243,"dur":60.0,"elev":0,"hr":null,"km":10.04,"note":"afternoon run","pace":5.98,"speed":10.03},"2026-07-20":{"cal":64,"dur":9.4,"elev":0,"hr":null,"km":1.2,"note":"afternoon run","pace":7.89,"speed":7.6},"2026-07-24":{"cal":130,"dur":16.7,"elev":0,"hr":null,"km":2.28,"note":"afternoon run","pace":7.329,"speed":8.19},"2026-07-26":{"cal":232,"dur":30.3,"elev":0,"hr":null,"km":4.07,"note":"afternoon run","pace":7.453,"speed":8.05},"2026-07-30":{"cal":474,"dur":60.0,"elev":0,"hr":null,"km":8.21,"note":"afternoon run","pace":7.318,"speed":8.2},"2026-08-02":{"cal":234,"dur":30.7,"elev":0,"hr":null,"km":4.07,"note":"afternoon run","pace":7.551,"speed":7.95},"2026-08-04":{"cal":608,"dur":76.8,"elev":0,"hr":null,"km":10.03,"note":"afternoon run","pace":7.66,"speed":7.83},"2026-08-07":{"cal":272,"dur":35.1,"elev":0,"hr":null,"km":5.01,"note":"afternoon run","pace":7.016,"speed":8.55},"2026-08-11":{"cal":526,"dur":60.7,"elev":0,"hr":null,"km":8.5,"note":"evening run","pace":7.143,"speed":8.4},"2026-08-14":{"cal":804,"dur":147.9,"elev":0,"hr":null,"km":21.14,"note":"morning run · long","pace":6.997,"speed":8.58},"2026-08-19":{"cal":150,"dur":15.3,"elev":0,"hr":null,"km":2.69,"note":"afternoon run","pace":5.702,"speed":10.52},"2026-08-21":{"cal":260,"dur":26.0,"elev":0,"hr":null,"km":4.45,"note":"afternoon run","pace":5.844,"speed":10.27},"2026-08-24":{"cal":474,"dur":63.6,"elev":0,"hr":null,"km":8.68,"note":"afternoon run","pace":7.329,"speed":8.19},"2026-08-27":{"cal":456,"dur":60.4,"elev":0,"hr":null,"km":8.23,"note":"afternoon run","pace":7.344,"speed":8.17},"2026-08-28":{"cal":399,"dur":53.0,"elev":0,"hr":null,"km":7.57,"note":"afternoon run","pace":7.002,"speed":8.57}};

  const rows = Object.entries(RUN).map(([date, r]) => ({
    date,
    km: r.km,
    pace: r.pace,
    dur: r.dur,
    speed: r.speed,
    hr: r.hr,
    elev: r.elev,
    cal: r.cal,
    note: r.note,
    source: 'seed', // hardcoded initial data — the Strava sync must never overwrite these
  }));

  await prisma.run.createMany({ data: rows });
  console.log(`Seeded ${rows.length} runs`);
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
  await prisma.openSourceContribution.deleteMany();
  await prisma.run.deleteMany();

  await seedExperience();
  await seedProjects();
  await seedSkills();
  await seedContributions();
  await seedRuns();

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

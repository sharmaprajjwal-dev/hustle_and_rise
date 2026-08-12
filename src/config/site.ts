export const site = {
  name: "Hustle & Rise",
  domain: "https://hustleandrise.com",
  tagline: "Find Work. Build Skills. Earn More.",
  description:
    "A practical career and earning hub for students, job seekers, and early-career people in New Zealand and beyond.",
  email: "hello@hustleandrise.com",
} as const;

export const navigation = [
  { label: "Jobs", href: "/jobs" },
  { label: "Interview Prep", href: "/interview" },
  { label: "Career", href: "/career" },
  { label: "Training", href: "/training" },
  { label: "Side Hustles", href: "/side-hustles" },
  { label: "Tools", href: "/tools" },
] as const;
export const productSections = [
  {
    title: "Find legitimate opportunities",
    shortTitle: "Jobs",
    description: "Browse student, part-time, graduate, and remote opportunities, starting with New Zealand.",
    href: "/jobs",
    eyebrow: "Find work",
  },
  {
    title: "Prepare with confidence",
    shortTitle: "Interview Prep",
    description: "Practise common questions, build stronger answers, and walk into interviews better prepared.",
    href: "/interview",
    eyebrow: "Get ready",
  },
  {
    title: "Build a stronger career",
    shortTitle: "Career Toolkit",
    description: "Practical CV, cover-letter, job-search, workplace, and career-planning guidance.",
    href: "/career",
    eyebrow: "Move forward",
  },
  {
    title: "Learn practical skills",
    shortTitle: "Training",
    description: "Short, useful classes and workshops designed around employable, real-world skills.",
    href: "/training",
    eyebrow: "Build skills",
  },
  {
    title: "Earn beyond a job",
    shortTitle: "Side Hustles",
    description: "Realistic student-friendly ways to freelance, sell services, and earn around study or work.",
    href: "/side-hustles",
    eyebrow: "Earn more",
  },
  {
    title: "Use better resources",
    shortTitle: "Tools & Resources",
    description: "Useful career, productivity, research, and AI tools without hype or unnecessary complexity.",
    href: "/tools",
    eyebrow: "Work smarter",
  },
] as const;

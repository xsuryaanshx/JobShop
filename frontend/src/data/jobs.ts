export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  remote: boolean;
  salary: string;
  type: string;
  matchScore: number;
  matchReason: string;
  matchingSkills: string[];
  missingSkills: string[];
  description: string;
  posted: string;
}

export const JOBS: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "Linear",
    companyLogo: "L",
    location: "San Francisco, CA",
    remote: true,
    salary: "$180k – $230k",
    type: "Full-time",
    matchScore: 94,
    matchReason: "React, TypeScript & design systems experience",
    matchingSkills: ["React", "TypeScript", "Tailwind", "GraphQL", "Design Systems"],
    missingSkills: ["Rust"],
    description: "Build the issue tracker engineers love. Craft pixel-perfect interfaces with motion and intent.",
    posted: "2d ago",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "Stripe",
    companyLogo: "S",
    location: "New York, NY",
    remote: true,
    salary: "$165k – $210k",
    type: "Full-time",
    matchScore: 87,
    matchReason: "Strong systems thinking + Figma expertise",
    matchingSkills: ["Figma", "Prototyping", "Design Systems", "User Research"],
    missingSkills: ["Motion Design", "Webflow"],
    description: "Shape the future of internet payments. Work on flows used by millions of businesses.",
    posted: "5h ago",
  },
  {
    id: "3",
    title: "AI Product Engineer",
    company: "OpenAI",
    companyLogo: "◎",
    location: "San Francisco, CA",
    remote: false,
    salary: "$220k – $310k",
    type: "Full-time",
    matchScore: 91,
    matchReason: "ML pipelines + production React",
    matchingSkills: ["Python", "React", "LLMs", "TypeScript"],
    missingSkills: ["CUDA", "PyTorch"],
    description: "Build the next generation of AI products. Ship features that redefine human-AI collaboration.",
    posted: "1d ago",
  },
  {
    id: "4",
    title: "Staff Software Engineer",
    company: "Vercel",
    companyLogo: "▲",
    location: "Remote",
    remote: true,
    salary: "$210k – $280k",
    type: "Full-time",
    matchScore: 89,
    matchReason: "Next.js + edge infrastructure",
    matchingSkills: ["Next.js", "React", "Node.js", "Edge Functions"],
    missingSkills: ["Go"],
    description: "Power the frontend cloud. Build infrastructure that millions of developers rely on every day.",
    posted: "3d ago",
  },
  {
    id: "5",
    title: "Design Engineer",
    company: "Figma",
    companyLogo: "✦",
    location: "San Francisco, CA",
    remote: true,
    salary: "$190k – $245k",
    type: "Full-time",
    matchScore: 96,
    matchReason: "Rare blend of design + frontend craft",
    matchingSkills: ["React", "WebGL", "Design Systems", "Animation", "TypeScript"],
    missingSkills: ["C++"],
    description: "Bridge design and engineering. Prototype the future of collaborative creative tools.",
    posted: "12h ago",
  },
  {
    id: "6",
    title: "Senior Full-Stack Engineer",
    company: "Notion",
    companyLogo: "N",
    location: "New York, NY",
    remote: true,
    salary: "$175k – $225k",
    type: "Full-time",
    matchScore: 83,
    matchReason: "Full-stack experience with collaborative tools",
    matchingSkills: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    missingSkills: ["Elixir", "WebRTC"],
    description: "Build the connected workspace where better, faster work happens. Help millions stay organized.",
    posted: "1w ago",
  },
  {
    id: "7",
    title: "Head of Engineering",
    company: "Anthropic",
    companyLogo: "✱",
    location: "San Francisco, CA",
    remote: false,
    salary: "$280k – $400k",
    type: "Full-time",
    matchScore: 78,
    matchReason: "Leadership + AI safety alignment",
    matchingSkills: ["Leadership", "Python", "ML", "Architecture"],
    missingSkills: ["Distributed Systems", "Triton"],
    description: "Lead engineering at the frontier of AI safety. Build systems that scale to billions.",
    posted: "4d ago",
  },
];

// ============================================================
// PORTFOLIO DATA — Edit all your content here.
// Search "TEMPLATE" for placeholders that need replacing.
// ============================================================

export const personal = {
  name: "Ariel Mazor",
  tagline: "Building intelligent systems for surgery and medicine.",
  email: "amazor@scu.edu",
  github: "https://github.com/amazor06",
  linkedin: "https://www.linkedin.com/in/amazor28/",
  efolio: "https://your-efolio-url.scu.edu", // TEMPLATE — replace
};

export const about = {
  paragraphs: [
    `I'm a sophomore at Santa Clara University double-majoring in Computer Science & Engineering and Engineering Physics, with a minor in Technical Innovation, Design & Entrepreneurship. My work sits at the intersection of AI, robotics, and medicine — I build systems that help surgeons operate with greater precision and help researchers see what was previously invisible.`,
    `Across two active research labs and a series of engineering projects, I've developed real-time shape reconstruction for medical robots, analyzed quantum materials at national accelerator facilities, and built a 6-DoF surgical teleoperation system from scratch. I'm driven by a single question: how do we make surgical and diagnostic tools fundamentally more intelligent?`,
  ],
  honors: [
    "SCU Honors Program",
    "Grand Challenge Scholars Program",
    "Geoff & Josie Fox Fellowship (2025)",
    "Hayes Fellowship (2026)",
    "MLT Career Prep Fellow",
    "JFCS National Scholarship",
  ],
};

export const research = [
  {
    id: "softcon",
    lab: "SoftCon Robotics Lab",
    pi: "Professor Kürkçü",
    institution: "Santa Clara University",
    title: "Real-Time Shape Reconstruction for Medical Robotics",
    description:
      "Developing real-time shape reconstruction methods for soft medical robots using embedded sensing and machine learning. This work enables robots to understand their own deformation during surgical procedures — a critical capability for safe, autonomous operation inside the body.",
    tags: ["Medical Robotics", "ML", "Embedded Sensing"],
    publication: "Forthcoming — contributing author",
  },
  {
    id: "quantum",
    lab: "Quantum Materials Lab",
    pi: "Professor Wu",
    institution: "Santa Clara University",
    title: "µSR Experimental Analysis of Quantum Materials",
    description:
      "Leading experimental analysis using muon spin rotation techniques to probe magnetic and electronic properties of quantum materials. On-site experiments conducted at SLAC National Accelerator Laboratory and the Advanced Light Source at Lawrence Berkeley National Laboratory.",
    tags: ["µSR", "Quantum Materials", "SLAC", "ALS"],
    publication: "Forthcoming — lead author",
  },
  {
    id: "akbari",
    lab: "Medical Imaging & Robotic Surgery Lab",
    pi: "Dr. Hamed Akbari",
    institution: "Santa Clara University",
    title: "AI in Medical Imaging and Robotic Surgery",
    description:
      "Starting junior year. Research focus on applying artificial intelligence to medical imaging analysis and robotic surgical systems.",
    tags: ["Medical Imaging", "AI", "Robotic Surgery"],
    publication: null,
    upcoming: true,
  },
];

export const projects = [
  {
    id: "acuros",
    title: "Acuros",
    description:
      "6-DoF surgical teleoperation system with mirrored joint-space control across dual robotic arms. Enables intuitive, real-time remote manipulation for surgical applications.",
    tags: ["C++", "Embedded Systems", "Motor Control", "Robotics"],
    github: "",
    demo: "",
    featured: true,
  },
  {
    id: "protein-insight",
    title: "Protein Insight Engine",
    description:
      "Computational protein structure analysis and visualization tool. Currently adding a web-based UI and ML-driven predictions for structural properties.",
    tags: ["Python", "PyMOL", "ML", "React"],
    github: "",
    demo: "",
  },
  {
    id: "physicslab",
    title: "PhysicsLab",
    description:
      "Educational physics simulation platform with 200+ active users. Interactive simulations covering mechanics, electromagnetism, and more.",
    tags: ["JavaScript", "React", "Physics"],
    github: "",
    demo: "https://PhysicsLab.vercel.app",
  },
  {
    id: "propel",
    title: "Propel",
    description:
      "Full-stack ML housing price prediction platform. End-to-end pipeline from data ingestion to interactive predictions.",
    tags: ["Python", "ML", "React"],
    github: "",
    demo: "https://Propel.vercel.app",
  },
  {
    id: "swim-touchpad",
    title: "Swim Training Touchpad",
    description:
      "Data capture system for competitive swim training. Leading a 3-person engineering team through design, prototyping, and deployment.",
    tags: ["Embedded Systems", "Hardware"],
    github: "",
    demo: "",
  },
];

export const experience = [
  {
    role: "Software Engineering Intern",
    company: "Triple Ring Technologies",
    location: "Bay Area, CA",
    period: "Summer 2026",
    description: "Medtech engineering firm. Details to come.",
  },
];

export const publications = [
  {
    title: "TEMPLATE — Paper title on shape reconstruction for medical robotics",
    authors: "Kürkçü, ..., A. Mazor, ...",
    venue: "TEMPLATE — Journal/Conference",
    status: "Forthcoming",
    role: "Contributing Author",
  },
  {
    title: "TEMPLATE — Paper title on µSR experimental analysis",
    authors: "A. Mazor, ..., Wu",
    venue: "TEMPLATE — Journal/Conference",
    status: "Forthcoming",
    role: "Lead Author",
  },
];

export const skills = {
  languages: ["C++", "C", "Python", "JavaScript", "MATLAB", "Assembly", "Verilog"],
  tools: ["React", "Linux", "Git", "CAD"],
  domains: ["Embedded Systems", "Motor Control", "Machine Learning", "Medical Robotics", "Signal Processing"],
};

export const nav = [
  { label: "About", href: "#about" },
  { label: "Research", href: "#research" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];
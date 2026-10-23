/*
  content.js
  All of the site's words live here. Edit this file to change the site.

  To add a project: copy one object inside `projects`, paste it where you
  want it to appear, and change the fields. Order in the list = order on the page.
  To hide something without deleting it, add  hidden: true  to that object.

  Fields you can use on a project:
    title        (required)  project name
    status       short line under the title, like "Fall 2025, Infineon"
    highlight    optional saffron text before the status, like "Top 4 of 40+ teams"
    description  one or two sentences
    stack        list of tools, shown as small pills
    links        list of { label, url }, shown as buttons
    featured     true for the one big project at the top (only one)
    facts        list of short bullet points (featured project only)
    demo         "recognition" shows the face recognition demo (featured only)
*/

window.SITE = {
  person: {
    firstName: "Saba",
    lastName: "Feilizadeh",
    lede: "I build software that still works for people on their hardest days.",
    intro: "Computer science at UC Berkeley. I work across health tech, applied machine learning, and embedded systems, usually starting from a real problem someone in front of me is dealing with.",
    email: "saba.feilizadeh@berkeley.edu",
    github: "https://github.com/sabaflz",
    linkedin: "https://linkedin.com/in/saba-feilizadeh",
    photo: "assets/img/profile.jpg",
    photoAlt: "Portrait of Saba Feilizadeh",
    // To update your resume: replace this PDF with a new download from Overleaf,
    // keeping the same file name. Nothing else needs to change.
    resumePdf: "assets/resume/Saba_Feilizadeh_Resume.pdf",
    footerNote: "Designed and built by Saba Feilizadeh. Off screen, I paint and work with clay."
  },

  projects: [
    {
      title: "Memory-assist wearable",
      status: "Fall 2025, ENGR 77 at De Anza with Infineon",
      featured: true,
      demo: "recognition",
      description: [
        "A wearable camera for people living with dementia, Alzheimer's, or low vision. When someone approaches, it tells the wearer who they are and how they know them.",
        "I trained the face recognition model from scratch, pushed its accuracy, and integrated the camera, model, and mobile app into one working system."
      ],
      facts: [
        "Recognizes everyone in the frame at once, not one face at a time",
        "New people can be added live from the companion app",
        "A hand gesture read by the PSoC 6 sensor triggers recognition",
        "Tested successfully end to end, with 3D printed housing"
      ],
      stack: ["Python", "PyTorch", "C++", "Computer vision", "Raspberry Pi", "Infineon PSoC 6", "3D printing"],
      links: []
    },
    {
      title: "Fung x KP Benefits",
      highlight: "In progress",
      status: "Fung Fellowship, UC Berkeley x Kaiser Permanente",
      description: "A health-tech project with Kaiser Permanente through Berkeley's Fung Fellowship, rethinking how members 24 and under discover and actually use their supplemental benefits. Built with a three-person team.",
      stack: ["Health tech", "User research", "Product design"],
      links: []
    },
    {
      title: "Network intrusion detector",
      highlight: "In progress",
      status: "AI security club, UC Berkeley",
      description: "A machine learning model that classifies network connections as normal or attack traffic, trained on the UNSW-NB15 dataset. It's the starter project for the AI security club I'm co-founding at Berkeley, built milestone by milestone so new members can learn alongside it.",
      stack: ["Python", "Machine learning", "Security"],
      links: []
    },
    {
      title: "StarVest",
      highlight: "Top 4 of 40+ teams",
      status: "Fall 2024, DAHacks 3.0",
      description: "An accessible decision-support tool for farmers, built in one hackathon weekend. I led the team, built the backend and third-party API integrations, taught teammates who were new to programming, and debugged through the night to ship a working demo.",
      stack: ["Python", "REST APIs", "Team lead"],
      links: []
    },
    {
      title: "De Anza and Foothill student platform",
      highlight: "In development",
      status: "Project lead",
      description: "A chat platform where community college students find roommates, join major-specific spaces, and get real answers from students and alumni who've already been through it. My idea, and I lead the build.",
      stack: ["Java", "JavaFX", "Real-time chat"],
      links: []
    },
    {
      title: "GrantLink",
      status: "Web app",
      description: "A web app that matches people to relevant grants through a guided survey and a project exploration flow, with a built-in AI assistant that helps them find funding that fits their work.",
      stack: ["React", "Tailwind CSS", "AI assistant"],
      links: []
    }
  ],

  leadership: [
    { role: "Fung Fellow", org: "Fung Fellowship, UC Berkeley x Kaiser Permanente", text: "Selected for Berkeley's project-based health-technology fellowship. Building a supplemental benefits solution for Kaiser Permanente members under 24." },
    { role: "President", org: "Iranian Student Association, De Anza", text: "Rebuilt an inactive club into an active community. Defined officer roles, grew membership and attendance, and ran cultural events that drew students from every background." },
    { role: "Vice President", org: "Competitive Programming Club, De Anza", text: "Ran weekly contests and algorithm workshops, helped form ICPC teams, and independently organized a speaker event with a Google AI/ML engineer." },
    { role: "CIS Lab Tutor and Peer Mentor", org: "De Anza College", text: "Guided students through programming assignments step by step. Designed a functions workshop that instructors now repeat every quarter." },
    { role: "Organizer and Mentor", org: "DAHacks and CalHacks", text: "Mentored 40+ hackathon teams and ran workshops on problem solving and hackathon strategy." },
    { role: "Language Arts Lab Assistant", org: "De Anza College", text: "Tested and documented new lab software, supported its rollout across the department, and wrote the instructor manual." }
  ],

  skills: [
    { label: "Languages", items: "Python, Java, C++, C, JavaScript, SQL, HTML, CSS" },
    { label: "Frameworks", items: "PyTorch, React, Tailwind CSS, JavaFX" },
    { label: "Machine learning", items: "Computer vision, model training, classification, data science" },
    { label: "Systems", items: "Unix and Linux, systems design, data structures and algorithms, REST APIs" },
    { label: "Hardware", items: "Raspberry Pi, Infineon PSoC 6, 3D printing" },
    { label: "Tools", items: "Git, GitHub, VS Code, Linear" }
  ],

  education: [
    { school: "University of California, Berkeley", lines: ["B.A. Computer Science, College of Computing, Data Science and Society", "Aug. 2026 to May 2028 (expected)"] },
    { school: "De Anza College and Foothill College", lines: ["3.96 GPA, Dean's List every eligible term", "A.S.-T Computer Science, A.S.-T Mathematics, A.A. Liberal Arts"] }
  ]
};

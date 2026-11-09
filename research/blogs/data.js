/*
  Blogs: every post I publish, with the sources behind it.

  TO ADD A POST: append one object below. Nothing else to create, the list page
  and post.html both read from here. Order does not matter, the newest date
  shows first.

  Fields (all optional except id, title, date):
    id        url slug, lowercase and hyphenated, never change it once shared
    title     post title
    date      "YYYY-MM-DD", the day it went out (or the day it is planned)
    status    "Published" or "Draft"
    where     "LinkedIn", "Substack", wherever it lives
    url       link to the live post, once it is live
    topics    [] tags, these build the filter chips automatically
    summary   one line, shown in the list
    body      [] the post itself, one string per paragraph
    findings  [] { h, p } what I took away, as cards
    sources   [] { citation, type, link, method, finding, quote, limits, verified }
    notes     anything to remember next time
*/
window.BLOG_POSTS = [
  {
    id: "when-assistive-ai-should-stay-quiet",
    title: "When an assistive tool should stay quiet",
    date: "2026-11-10",
    status: "Draft",
    where: "LinkedIn",
    url: "",
    topics: ["Accessibility", "Human-centered AI", "Assistive technology"],
    summary:
      "Two studies a year apart found AI coding assistants help blind and low-vision developers while handing them new work. That reframed a design question in my own wearable project.",
    body: [
      "The assistant was not failing at being smart. It was failing at knowing when to be quiet.",
      "That is my takeaway from a paper I read this week. Flores-Saviaga, Hanrahan, Imteyaz, Clarke and Savage studied how developers who are visually impaired actually experience generative AI coding assistants. The tool helped, and participants were genuinely optimistic about it. But it also flooded them with suggestions, to the point that some wanted what the authors call an \"AI timeout,\" and it made moving between generated code and their own code harder.",
      "I am a CS student at Berkeley, and I worked on a wearable memory-assist device built with Infineon's PSoC 6 and a Raspberry Pi, for people with dementia or visual impairments. A camera and a face recognition model I trained tell the wearer who is walking toward them and how they are related, and it can identify several people in view at once.",
      "We put almost all of our effort into recognition accuracy. How many faces, how fast, how reliably. We put close to none into when the device should say nothing at all.",
      "Reading this, I think that was the harder problem and we skipped it. An assistive tool spends the user's attention every time it speaks. Accuracy decides whether the information is correct. The interruption budget decides whether someone can stand to keep the device on.",
      "So the question I am taking into the next thing I build: what is this tool's attention cost, and who gets to decide when it goes quiet, me or the person wearing it?",
      "If you build assistive or AI-assisted tools, I would like to know how you set that threshold. I have not seen it treated as an actual requirement."
    ],
    findings: [
      {
        h: "The failure mode was volume, not accuracy",
        p: "In both studies the AI was useful. What hurt was how much it said and how hard it was to track. That is a different engineering problem than the one I spent my effort on."
      },
      {
        h: "Attention is the budget nobody writes down",
        p: "Every announcement an assistive tool makes spends something the user cannot get back. I have never seen an interruption budget in a requirements doc, including my own."
      },
      {
        h: "There is no single accessible design",
        p: "Preferences across the 16 participants in the 2025 study varied widely enough that one accessible default would not serve them. That argues for user-set thresholds rather than a tuned constant."
      }
    ],
    sources: [
      {
        citation:
          "Flores-Saviaga, C., Hanrahan, B. V., Imteyaz, K., Clarke, S., & Savage, S. (2025). The Impact of Generative AI Coding Assistants on Developers Who Are Visually Impaired. arXiv:2503.16491 (DOI prefix indicates an ACM venue).",
        type: "Peer-reviewed paper",
        link: "https://arxiv.org/abs/2503.16491",
        method:
          "Activity Theory lens. Visually impaired developers completed programming tasks with a generative AI coding assistant. The abstract page does not state the participant count, so check the full paper before citing a number.",
        finding:
          "Participants found the assistant beneficial and were optimistic about it, but it exacerbated existing accessibility barriers and created new ones: too many suggestions, and difficulty moving between AI-generated content and their own code.",
        quote: "Participants wanted what the authors call \"AI timeouts.\"",
        limits:
          "Does not establish how often this happens in real work over time, or whether the effect holds outside the task setup used. No participant count on the abstract page.",
        verified: true
      },
      {
        citation:
          "Chen, N., Qiu, L. K., Wang, A. Z., Wang, Z., & Yang, Y. (2025). Screen Reader Programmers in the Vibe Coding Era: Adaptation, Empowerment, and New Accessibility Landscape. arXiv:2506.13270 (cs.HC, submitted June 16, 2025).",
        type: "Peer-reviewed paper",
        link: "https://arxiv.org/abs/2506.13270",
        method:
          "Longitudinal study with 16 blind and low-vision programmers. A GitHub Copilot tutorial plus a programming task, initial feedback, then two weeks of AI-assisted programming followed by follow-up sessions.",
        finding:
          "Code assistants improved efficiency and closed some accessibility gaps, but added new load: conveying intent to the AI, interpreting its output, and tracking multiple views. Preferences varied widely, and participants wanted a balance between automation and control.",
        quote: "The gains and the new burdens arrived together, not as a tradeoff the user got to choose.",
        limits:
          "16 participants, one toolchain, two weeks. Does not establish long-term adoption, and the preference spread means group-level findings may not describe any individual well.",
        verified: true
      }
    ],
    notes:
      "Read both papers in full before posting, the body currently leans on the abstracts. Add the live URL and flip status to Published once it is up. If the post lands, the follow-up is the Clinical AI Benchmark Atlas (NYU Langone, Oct 2026) on evaluation mismatch."
  }
];

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
    bodyLabel heading above body, defaults to "The post" (use "Research notes"
              and similar for entries that are not a published post)
    findings  [] { h, p } what I took away, as cards
    sources   [] { citation, type, link, method, finding, quote, limits, verified }
    notes     anything to remember next time
*/
window.BLOG_POSTS = [
  {
    id: "agents-reading-untrusted-text",
    title: "Can an agent read untrusted text and still act for you?",
    date: "2026-11-09",
    status: "Published",
    topics: ["AI security", "Prompt injection", "Agents", "Human-centered AI"],
    summary:
      "A nine-source review of prompt injection, agent permissions, and who ends up doing the security work. The full source log, with what each paper does not establish.",
    bodyLabel: "Where this landed",
    body: [
      "Prompt injection stops being a model problem and becomes a security problem the moment text an agent reads can redirect actions that carry the user's authority. Preventing that means looking at the surrounding system, not just at whether the model gives good answers.",
      "Model-level defenses, such as instruction hierarchies and filters, measurably help. But almost every reassuring number comes from a fixed attack. When the attacker is allowed to adapt, the numbers collapse: PIGuard blocked every static attempt on Gemini 2.5 Pro and still failed 71% of the time once an adaptive search got up to 800 queries per scenario.",
      "The architectural answer, CaMeL, moves enforcement outside the model's reading of the text, so the question becomes which actions untrusted data is allowed to influence rather than whether the model can spot a malicious instruction. Worth noting that CaMeL was excluded from the big adaptive evaluation rather than surviving it, so its protection is argued by design, not demonstrated under that attack.",
      "The gap nobody has closed is the three-way one: strong attack resistance, real task completion, and low user burden, shown together in the same study. Yan is the only source here with human participants, and the design that cut approval prompts from 18 to 10.9 also let through 20.1 percentage points more overreach, with no reliable time saving to justify the trade.",
      "My angle, if I take this further: every one of these studies measures what the system does, and only one measures what the person does. Nobody has tested any of it with users who cannot reliably read long or frequent approval prompts."
    ],
    findings: [
      {
        h: "A low attack success rate can mean a weak attacker",
        p: "AgentDojo separates legitimate task completion from attack success for exactly this reason. An agent too incompetent to do the task also fails to be exploited, and that looks like safety in the numbers."
      },
      {
        h: "\"Training helps\" and \"adaptive attacks break defenses\" are both true",
        p: "Wallace and Shi report real improvements; Zhan and Nasr break defenses under stronger procedures. The actual disagreement is about how far a favorable result generalizes, not about what happened in either experiment."
      },
      {
        h: "Fewer approval prompts did not mean less work",
        p: "Yan: 18.0 prompts under per-action approval versus 10.9 under a user-authored policy, but total time went from 142.1s to 128.8s with a confidence interval of [-46.3, 20.6], which crosses zero. The convenience was real, the time saving was not demonstrated."
      },
      {
        h: "An adaptive attack is only as good as the person writing it",
        p: "In the Narisetty evaluation the hand-crafted adaptive attack scored worse than the standard one (2.6% versus 4.2% mean). That says the attack was weak, not that the defense is strong. Calling an evaluation adaptive does not make it a hard test."
      },
      {
        h: "Protection has a price nobody quotes",
        p: "Progent cut mean attack success from 25.8% to 4.2%, but task utility fell from 45.2% to 27.1% and defended runs needed roughly 15 times more LLM calls. If the argument is about burden, that cost belongs in the argument."
      }
    ],
    sources: [
      {
        citation:
          "Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T., & Fritz, M. (2023). Not What You've Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection. AISec 2023.",
        type: "Peer-reviewed paper",
        link: "https://arxiv.org/html/2302.12173v2",
        finding: "Attacker-controlled external content can redirect LLM applications. This is the paper that established the attack class.",
        limits: "Proof-of-concept demonstrations. Says nothing about how often this succeeds in deployed systems.",
        verified: true
      },
      {
        citation:
          "Wallace, E., Xiao, K., Leike, R., Weng, L., Heidecke, J., & Beutel, A. (2024). The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions. arXiv:2404.13208.",
        type: "Preprint",
        link: "https://arxiv.org/abs/2404.13208",
        finding: "Training models to rank trusted instructions above untrusted content improves resistance to conflicting lower-priority instructions.",
        limits: "Improvement under specified tests, not a security boundary. The paper itself treats model defenses as complementary to system safeguards.",
        verified: true
      },
      {
        citation:
          "Debenedetti, E., Shumailov, I., Fan, T., Hayes, J., Carlini, N., Fabian, D., Kern, C., Shi, C., Terzis, A., & Tramèr, F. (2026). Defeating Prompt Injections by Design (CaMeL). IEEE SaTML 2026. First released 2025 as arXiv:2503.18813.",
        type: "Peer-reviewed paper",
        link: "https://arxiv.org/html/2503.18813v2",
        finding:
          "Separates trusted planning from untrusted data processing and enforces capability and information-flow policies outside the model, so the question becomes which actions untrusted data may influence.",
        limits:
          "Rests on its trust assumptions and on whoever writes the policy. Does not cover misleading summaries, phishing outcomes, or side channels. Do not mix utility numbers across versions.",
        verified: true
      },
      {
        citation:
          "Debenedetti, E., Zhang, J., Balunovic, M., Beurer-Kellner, L., Fischer, M., & Tramèr, F. (2024). AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents. NeurIPS 2024, Datasets and Benchmarks Track.",
        type: "Peer-reviewed paper and benchmark",
        link: "https://arxiv.org/html/2406.13352v3",
        method: "97 user tasks and 629 security test cases across simulated application domains.",
        finding: "Measures legitimate utility and attack success separately, which is what makes a low attack-success number interpretable.",
        limits: "Benchmark cases are not real incident frequencies, and an agent that cannot do the task can look attack-resistant.",
        verified: true
      },
      {
        citation:
          "Zhan, Q., Fang, R., Panchal, H. S., & Kang, D. (2025). Adaptive Attacks Break Defenses Against Indirect Prompt Injection Attacks on LLM Agents. Findings of NAACL 2025, pp. 7116-7132.",
        type: "Peer-reviewed paper",
        link: "https://aclanthology.org/2025.findings-naacl.395/",
        method: "100 sampled InjecAgent cases, two open-model families, short output horizons.",
        finding: "Defenses that look solid against fixed attacks fail against attackers who know the defense and adapt to it.",
        limits: "Strong against the tested defenses, weaker as evidence about complete deployed workflows. Does not establish benign utility.",
        verified: true
      },
      {
        citation:
          "Nasr, M., Carlini, N., Sitawarin, C., Schulhoff, S. V., Hayes, J., Ilie, M., Pluto, J., Song, S., Chaudhari, H., Shumailov, I., Thakurta, A. G., Xiao, K. Y., Terzis, A., & Tramèr, F. (2026). The Attacker Moves Second. USENIX Security 2026, pp. 1467-1486. First released 2025 as arXiv:2510.09023.",
        type: "Peer-reviewed paper",
        link: "https://arxiv.org/html/2510.09023v1",
        method:
          "80-case AgentDojo subset from the Slack, Travel and Workspace suites, with an adaptive search budget of up to 800 queries per scenario.",
        finding:
          "Gemini 2.5 Pro, static versus adaptive attack success: undefended 30% to 100%, Spotlighting 28% to 99%, Prompt Sandwiching 21% to 95%, PIGuard 0% to 71%. Table 7, discussed in G.1. I re-checked every one of these numbers against the paper.",
        limits:
          "Measures what an attacker finds given substantial effort, not the chance an ordinary interaction causes harm. The evaluation excluded CaMeL and several other enforcement defenses, so it cannot be cited as breaking them.",
        verified: true
      },
      {
        citation:
          "Narisetty, P., Kore, S. N. B., Kattamanchi, U. K. R., & Kumarapu, J. (2026). Adaptive Evaluation of Out-of-Band Defenses Against Prompt Injection in LLM Agents. arXiv:2606.26479v1. LaunchSafe Research.",
        type: "Preprint, self-described as preliminary and non-peer-reviewed",
        link: "https://arxiv.org/html/2606.26479v1",
        method:
          "Progent on AgentDojo, Qwen2.5-7B-Instruct agent, first 8 user tasks per suite across banking, slack and workspace, three runs at temperature 0, one hand-crafted adaptive attack.",
        finding:
          "Mean attack success 25.8% undefended, 4.2% with Progent under the standard attack, 2.6% under the adaptive one. Utility fell from 45.2% to 27.1% and defended runs needed about 15x more LLM calls.",
        limits:
          "The authors call it one small data point. The adaptive attack underperformed the standard attack, so it tested the defense weakly. One model, one defense, small task subset, and the policy model was swapped from GPT-4o to a 7B.",
        verified: true
      },
      {
        citation:
          "Shi, C., Lin, S., Song, S., Hayes, J., Shumailov, I., Yona, I., Pluto, J., Pappu, A., Choquette-Choo, C. A., Nasr, M., Sitawarin, C., Gibson, G., Terzis, A., & Flynn, J. (2025). Lessons from Defending Gemini Against Indirect Prompt Injections. arXiv:2505.14534.",
        type: "Technical report",
        link: "https://arxiv.org/html/2505.14534v1",
        finding: "Layered model-level defenses improved resistance in production-oriented testing.",
        limits:
          "Synthetic tests of model behavior, not field incident rates. A warning here is a model instruction, not a human approval dialog, and model-version comparisons change several things at once.",
        verified: true
      },
      {
        citation:
          "Yan, T. (2026). Do User-Authored Permission Policies Improve Protection Against AI Agent Overreach? arXiv:2608.27443.",
        type: "Preprint",
        link: "https://arxiv.org/pdf/2608.27443",
        method:
          "Between-subjects, 113 analyzed participants with no professional software background, three conditions: per-action approval (n=34), automated per-action review (n=44), user-authored policy (n=35). Same scripted 18-action day containing 7 overreach actions. Preregistered on OSF.",
        finding:
          "Approval prompts: 18.0 per-action, 10.0 automated, 10.9 policy. Overreach blocked: 59.6% per-action versus 39.6% policy, an adjusted gap of 20.1 points, CI [-32.1, -8.1]. Total time 142.1s versus 128.8s, adjusted difference -12.9s, CI [-46.3, 20.6]. Required-action completion stayed at 94.1% to 96.9% everywhere. I verified all of these against the PDF.",
        limits:
          "Short scripted interactions, no real accounts, US English-speaking nonsoftware workers, and no targeted sample of people with cognitive or visual impairments. Does not isolate fatigue as the cause.",
        verified: true
      }
    ],
    notes:
      "Produced with ChatGPT deep research, then checked here. I independently re-verified four things against primary sources: the Narisetty and Yan papers exist with the stated authors, every Yan statistic, every Nasr chart number plus the 80-case subset and 800-query budget, and the USENIX venue including pages. No fabricated citations were found. Three corrections to the original output are already folded into the entries above: source 7 is self-described preliminary non-peer-reviewed work rather than a normal preprint, Yan's third condition (automated review, 10.0 prompts) was dropped from the original synthesis and matters for the where-does-the-work-go question, and the Narisetty utility costs were cited without magnitudes. One claim I could not confirm: the original cited Yan as v2 with conditional acceptance at IUI 2027, but the PDF is v1 and states no venue. The checkpoint source logs from the ChatGPT session were lost before export, which is the reason this entry exists here. Figures live in the ChatGPT library and will not open for anyone else, so re-render them from make_figures.py if they are ever needed."
  },
  {
    id: "when-assistive-ai-should-stay-quiet",
    title: "When an assistive tool should stay quiet",
    date: "2026-11-10",
    status: "Published",
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

// Define card data for disinformation tactics
const CARD_DATA = [
  {
    "title": "Repetition",
    "points": [
      "Menticide's hammer that wears you down",
      "Repeats lies until they feel familiar",
      "Familiarity begins to feel like truth",
      "It's not persuasion - it's erosion"
    ],
    "layout": "layout-centered",
    "theme": "theme-red"
  },
  {
    "title": "Appeal to Prestige",
    "points": [
      "Invokes respected names or institutions",
      "Lends false credibility to weak arguments",
      "Uses borrowed trust for deception",
      "Makes falsehoods seem authoritative"
    ],
    "layout": "layout-split",
    "theme": "theme-blue"
  },
  {
    "title": "Weaponized Irony",
    "points": [
      "Uses sarcasm or humor to introduce extremist ideas",
      "Maintains plausible deniability with \"just joking\"",
      "Shields harmful content behind comedy",
      "Undermines serious critique with mockery"
    ],
    "layout": "layout-boxed",
    "theme": "theme-purple"
  },
  {
    "title": "Astroturfing",
    "points": [
      "Creates fake \"grassroots\" movements",
      "Manufactured to appear as popular public support",
      "Actually deception with money and marketing",
      "Makes corporate/government interests seem like popular opinion"
    ],
    "layout": "layout-split",
    "theme": "theme-green"
  },
  {
    "title": "Obfuscation",
    "points": [
      "Deliberately makes information unclear or complex",
      "Hides truth behind confusion",
      "Avoids accountability through complexity",
      "Deception by drowning clarity"
    ],
    "layout": "layout-boxed",
    "theme": "theme-dark"
  },
  {
    "title": "Amygdala Hacking",
    "points": [
      "Triggers fear, rage, and panic responses",
      "Targets the brain's emotional center",
      "Bypasses logic and critical thinking",
      "Makes you react, not reason"
    ],
    "layout": "layout-centered",
    "theme": "theme-sunset"
  },
  {
    "title": "Cherry Picking",
    "points": [
      "Selects only facts that support a false claim",
      "Ignores all opposing evidence",
      "Climate deniers use cold days to \"disprove\" warming",
      "Creates a false narrative through selective facts"
    ],
    "layout": "layout-split",
    "theme": "theme-blue"
  },
  {
    "title": "Folksy Appeal",
    "points": [
      "Adopts casual, down-to-earth language",
      "Appears relatable while pushing deception",
      "Uses false familiarity to lower skepticism",
      "Makes manipulators seem trustworthy"
    ],
    "layout": "layout-centered",
    "theme": "theme-green"
  },
  {
    "title": "Reflexive Control Theory",
    "points": [
      "Russian military and intelligence doctrine",
      "Manipulates adversary's perceptions",
      "Influences decision-making to serve manipulator's goals",
      "Makes targets believe they're acting freely"
    ],
    "layout": "layout-boxed",
    "theme": "theme-purple"
  },
  {
    "title": "Strategic Ambiguity",
    "points": [
      "Uses vague, contradictory messaging",
      "Keeps adversaries confused and hesitant",
      "Prevents effective response through uncertainty",
      "Weaponizes confusion as a strategy"
    ],
    "layout": "layout-split",
    "theme": "theme-dark"
  },
  {
    "title": "Fighting Disinformation: Inoculation",
    "points": [
      "Teach others the propaganda playbook",
      "Every mind you inoculate becomes resistance",
      "Share knowledge of manipulation techniques",
      "Build collective resilience through awareness"
    ],
    "layout": "layout-centered",
    "theme": "theme-blue"
  },
  {
    "title": "Fighting Disinformation: Verification",
    "points": [
      "Slow down and verify before sharing",
      "Question patterns your brain invents",
      "Seek multiple reliable sources",
      "Pause when content triggers strong emotions"
    ],
    "layout": "layout-boxed",
    "theme": "theme-green"
  },
  {
    "title": "Fighting Disinformation: Independence",
    "points": [
      "Think before you follow the crowd",
      "When crowds decide truth, propaganda wins",
      "Evaluate evidence on its own merit",
      "Resist the bandwagon effect"
    ],
    "layout": "layout-split",
    "theme": "theme-sunset"
  },
  // Additional disinformation tactics
  {
    "title": "False Balance",
    "points": [
      "Presents two sides as equally valid despite evidence",
      "Makes fringe beliefs appear as credible alternatives",
      "Creates artificial controversy on settled issues",
      "Media fairness exploited for legitimizing misinformation"
    ],
    "layout": "layout-split",
    "theme": "theme-purple"
  },
  {
    "title": "Card Stacking",
    "points": [
      "Shows only positive information about a subject",
      "Hides all negative facts deliberately",
      "Used by authoritarian regimes to mask suffering",
      "Controls perception through selective disclosure"
    ],
    "layout": "layout-centered",
    "theme": "theme-red"
  },
  {
    "title": "Gaslighting",
    "points": [
      "Leaders deny obvious facts or events",
      "Makes people doubt their own memory and perception",
      "Erodes trust in objective reality",
      "Favorite tool of authoritarians to control dissent"
    ],
    "layout": "layout-boxed",
    "theme": "theme-dark"
  },
  {
    "title": "Zersetzung",
    "points": [
      "Covert psychological warfare method (East German Stasi)",
      "Systematically destroys reputation and confidence",
      "Uses harassment, disinformation, and isolation",
      "Breaks down targets without physical violence"
    ],
    "layout": "layout-centered",
    "theme": "theme-purple"
  },
  {
    "title": "False Flag",
    "points": [
      "Staging attacks on oneself to justify aggression",
      "Attacker pretends to be the victim",
      "Creates justification for war or repression",
      "Makes the aggressor appear as defender"
    ],
    "layout": "layout-split",
    "theme": "theme-red"
  },
  {
    "title": "Doppelgänger Websites",
    "points": [
      "Fake websites imitating trusted news sources",
      "Use cloned designs and similar URLs",
      "Fool readers into believing lies from 'reputable' sources",
      "Exploit existing trust for disinformation"
    ],
    "layout": "layout-boxed",
    "theme": "theme-blue"
  },
  {
    "title": "Door-in-the-Face Technique",
    "points": [
      "Makes an extreme request expected to be rejected",
      "Follows with smaller request that seems reasonable by comparison",
      "Increases likelihood of second request being accepted",
      "Psychological trickery to manipulate compliance"
    ],
    "layout": "layout-centered",
    "theme": "theme-green"
  },
  {
    "title": "Euphemism",
    "points": [
      "Uses mild, vague, or pleasant-sounding words",
      "Covers up harsh realities and atrocities",
      "Makes violence and oppression sound normal",
      "Eases moral discomfort with unethical actions"
    ],
    "layout": "layout-split",
    "theme": "theme-sunset"
  },
  {
    "title": "Information Laundering",
    "points": [
      "Introduces false information in fringe spaces",
      "Gradually amplifies through increasingly credible sources",
      "Makes falsehoods appear legitimate over time",
      "Exploits the 'source amnesia' cognitive bias"
    ],
    "layout": "layout-boxed",
    "theme": "theme-dark"
  },
  {
    "title": "Honeypot Operations",
    "points": [
      "Lures individuals into compromising situations",
      "Often uses sex, money, or illegal offers",
      "Creates material for blackmail or discrediting",
      "Enables control through threat of exposure"
    ],
    "layout": "layout-centered",
    "theme": "theme-purple"
  },
  {
    "title": "Dog Whistles",
    "points": [
      "Coded phrases, numbers, and symbols",
      "Allows extremists to signal allegiance covertly",
      "Stays under the radar of general public",
      "Enables deniability while communicating to insiders"
    ],
    "layout": "layout-split",
    "theme": "theme-dark"
  },
  {
    "title": "Cognitive Domain Operations",
    "points": [
      "Silent attacks on how you think and choose",
      "Targets decision-making processes",
      "Weaponizes psychology and information",
      "Makes the mind itself a battlefield"
    ],
    "layout": "layout-boxed",
    "theme": "theme-sunset"
  },
  {
    "title": "Glittering Generalities",
    "points": [
      "Uses vague, emotionally charged words",
      "\"Freedom,\" \"Greatness,\" \"Security\" without specifics",
      "Sounds inspiring while saying nothing concrete",
      "Exploits positive emotional associations"
    ],
    "layout": "layout-centered",
    "theme": "theme-blue"
  },
  {
    "title": "Black Propaganda",
    "points": [
      "Creates false information attributed to opponents",
      "Makes it appear to come from a different source",
      "Designed to discredit enemies or rivals",
      "Deception inside deception for maximum damage"
    ],
    "layout": "layout-split",
    "theme": "theme-purple"
  },
  {
    "title": "Dezinformatsiya",
    "points": [
      "Soviet KGB tactic of strategic disinformation",
      "Long-term campaigns to spread harmful falsehoods",
      "Turns international opinion against enemies",
      "Systematic approach to weaponized deception"
    ],
    "layout": "layout-boxed",
    "theme": "theme-red"
  },
  {
    "title": "Information Warfare",
    "points": [
      "The battlefield is in your mind",
      "No uniforms or trenches, just cognitive attacks",
      "Deliberate campaign to control perception",
      "Every citizen is a target in this hidden war"
    ],
    "layout": "layout-centered",
    "theme": "theme-dark"
  },
  // More disinformation tactics
  {
    "title": "Censorship By Noise",
    "points": [
      "Floods information space with garbage content",
      "Drowns out truth without using force",
      "Overwhelms through distraction and volume",
      "Makes finding accurate information exhausting"
    ],
    "layout": "layout-boxed",
    "theme": "theme-blue"
  },
  {
    "title": "Salami Tactics",
    "points": [
      "Erodes rights and freedoms slice by slice",
      "Each change too small to trigger serious alarm",
      "By the time people notice, significant damage is done",
      "Gradual authoritarianism that avoids resistance"
    ],
    "layout": "layout-split",
    "theme": "theme-green"
  },
  {
    "title": "Cult of Personality",
    "points": [
      "Elevates a leader as flawless and heroic",
      "Uses propaganda, media control, and symbolism",
      "Suppresses dissent by creating quasi-religious loyalty",
      "Replaces critical thinking with worship"
    ],
    "layout": "layout-centered",
    "theme": "theme-red"
  },
  {
    "title": "Whataboutism",
    "points": [
      "Deflects criticism by pointing to others' flaws",
      "Changes the subject rather than addressing the issue",
      "Used by governments to avoid accountability",
      "False equivalence that derails meaningful discussion"
    ],
    "layout": "layout-boxed",
    "theme": "theme-purple"
  },
  {
    "title": "Name-Calling",
    "points": [
      "Uses insults to replace substantive arguments",
      "Labels opponents as \"traitors\" or \"foreign agents\"",
      "Discredits dissent without requiring evidence",
      "Silences opposition through character assassination"
    ],
    "layout": "layout-split",
    "theme": "theme-sunset"
  },
  {
    "title": "Technical Jargon",
    "points": [
      "Overuses specialized, complex language",
      "Confuses, intimidates, or misleads audiences",
      "Hides weak arguments behind complexity",
      "Makes the audience feel intellectually inferior"
    ],
    "layout": "layout-centered",
    "theme": "theme-dark"
  },
  {
    "title": "Fake News",
    "points": [
      "Deliberately fabricated stories spread as factual",
      "Created to deceive, mislead and manipulate",
      "Fuels confusion, distrust, and division",
      "Undermines the credibility of legitimate media"
    ],
    "layout": "layout-boxed",
    "theme": "theme-green"
  },
  {
    "title": "Oversimplification",
    "points": [
      "Reduces complex issues to simple, catchy solutions",
      "Ignores nuance and important complexity",
      "Offers false clarity on multifaceted problems",
      "Appeals to desire for easy answers to hard questions"
    ],
    "layout": "layout-split",
    "theme": "theme-blue"
  },
  {
    "title": "Fear, Uncertainty, Doubt",
    "points": [
      "Spreads vague threats and scary scenarios",
      "Creates conflicting information to paralyze decision-making",
      "Used by corporations and authoritarian regimes",
      "Prevents action through emotional manipulation"
    ],
    "layout": "layout-centered",
    "theme": "theme-purple"
  },
  {
    "title": "Appeal to Authority",
    "points": [
      "Uses someone's status rather than evidence",
      "Leverages celebrities to spread misinformation",
      "Confuses expertise in one area with authority in another",
      "Bypasses critical thinking through false credibility"
    ],
    "layout": "layout-boxed",
    "theme": "theme-red"
  },
  {
    "title": "Accusation in a Mirror",
    "points": [
      "Accuses opponents of your own wrongdoing",
      "Projection weaponized as propaganda",
      "Used to justify aggression and deflect blame",
      "Creates confusion about who's truly responsible"
    ],
    "layout": "layout-split",
    "theme": "theme-dark"
  },
  {
    "title": "Appeal to Tradition",
    "points": [
      "Defends ideas because \"it's always been this way\"",
      "Claims history alone makes something right",
      "Used to resist social progress and equal rights",
      "Substitutes longevity for moral or logical validity"
    ],
    "layout": "layout-centered",
    "theme": "theme-sunset"
  },
  {
    "title": "Fighting Disinformation: Evidence",
    "points": [
      "Don't follow the crowd — follow the evidence",
      "Evaluate claims based on facts, not popularity",
      "The herd can lead you astray if you let it",
      "Resist social pressure to accept misinformation"
    ],
    "layout": "layout-boxed",
    "theme": "theme-blue"
  },
  // Final batch of disinformation tactics
  {
    "title": "False Consensus Manufacturing",
    "points": [
      "Creates illusion that \"everyone agrees\"",
      "Uses bots, trolls, and coordinated influencers",
      "Simulates mass approval or outrage artificially",
      "Makes fringe opinions appear mainstream"
    ],
    "layout": "layout-centered",
    "theme": "theme-green"
  },
  {
    "title": "Doublespeak",
    "points": [
      "Uses deliberately ambiguous or contradictory language",
      "Obscures reality and misleads audiences",
      "Disguises harmful actions with pleasant terms",
      "The art of lying without technically lying"
    ],
    "layout": "layout-split",
    "theme": "theme-purple"
  },
  {
    "title": "Divide and Rule",
    "points": [
      "Sows division between groups to weaken unity",
      "Makes a divided population easier to control",
      "Distracts from real issues with manufactured conflicts",
      "As old as empire but still thriving today"
    ],
    "layout": "layout-boxed",
    "theme": "theme-red"
  },
  {
    "title": "Victim-Blaming",
    "points": [
      "Accuses those harmed of causing their own suffering",
      "Used to deflect blame and avoid accountability",
      "Makes victims seem responsible for their oppression",
      "Justifies harm by claiming targets deserved it"
    ],
    "layout": "layout-centered",
    "theme": "theme-dark"
  },
  {
    "title": "Recursive Narrative Engineering",
    "points": [
      "Seeds multiple, layered narratives across different spaces",
      "Each narrative references others to create circular \"proof\"",
      "Creates illusion of credibility through self-reference",
      "Makes falsehoods appear verified by multiple sources"
    ],
    "layout": "layout-split",
    "theme": "theme-blue"
  },
  {
    "title": "Psychological Flooding",
    "points": [
      "Overwhelms with constant crises and conflicting narratives",
      "Bombards with fear-inducing content to exhaust mental resilience",
      "Disables critical thinking through cognitive overload",
      "Creates fatigue that leads to disengagement or surrender"
    ],
    "layout": "layout-boxed",
    "theme": "theme-sunset"
  },
  {
    "title": "Fighting Disinformation: Self-Awareness",
    "points": [
      "Learn your own mental habits and biases",
      "Understand your vulnerabilities to manipulation",
      "Recognize when your emotions are being targeted",
      "Self-knowledge is the foundation of resistance"
    ],
    "layout": "layout-centered",
    "theme": "theme-purple"
  },
  {
    "title": "Fighting Disinformation: Community",
    "points": [
      "Make truth-telling a team sport",
      "Build networks of trusted information sharing",
      "Disinformation thrives in silence and isolation",
      "Community inoculation makes skepticism contagious"
    ],
    "layout": "layout-split",
    "theme": "theme-green"
  },
  // Advanced disinformation tactics
  {
    "title": "Stochastic Terrorism",
    "points": [
      "Uses public demonization and inflammatory rhetoric",
      "Inspires unpredictable acts of violence by individuals",
      "Creates plausible deniability through indirect incitement",
      "Makes targets feel they're called to act without coordination"
    ],
    "layout": "layout-boxed",
    "theme": "theme-red"
  },
  {
    "title": "Reflexive Control",
    "points": [
      "Psychological warfare tactic with Russian origins",
      "Crafts information to guide your decision-making",
      "Makes you believe the manipulator's choice was your idea",
      "Controls behavior while maintaining illusion of free will"
    ],
    "layout": "layout-centered",
    "theme": "theme-purple"
  },
  {
    "title": "Rotten Herring",
    "points": [
      "Creates fake scandals or distractions",
      "Diverts attention from real problems or crises",
      "Used when damaging news emerges about the powerful",
      "Makes people look elsewhere instead of at real issues"
    ],
    "layout": "layout-split",
    "theme": "theme-blue"
  },
  {
    "title": "Fifth Column",
    "points": [
      "Covert groups working within a country to undermine it",
      "Aids external enemies without open confrontation",
      "Operates through influence operations and subversion",
      "Creates internal division that weakens resistance"
    ],
    "layout": "layout-boxed",
    "theme": "theme-dark"
  },
  {
    "title": "Poisoning the Well",
    "points": [
      "Discredits a person or source before they speak",
      "Ensures their statements will be dismissed regardless of content",
      "Creates preemptive mistrust of legitimate information",
      "Prevents fair evaluation of evidence or arguments"
    ],
    "layout": "layout-centered",
    "theme": "theme-green"
  },
  {
    "title": "Semantic Manipulation",
    "points": [
      "Deliberately distorts or redefines language",
      "Controls words to control how reality is perceived",
      "Changes meaning of terms to confuse public discourse",
      "Makes communication itself a battlefield"
    ],
    "layout": "layout-split",
    "theme": "theme-sunset"
  },
  {
    "title": "Sealioning",
    "points": [
      "Bad-faith actors bombard with 'polite' demands for explanation",
      "Not seeking to learn but to exhaust and discredit",
      "Weaponizes civility to drain resources and attention",
      "Makes defending truth more costly than spreading lies"
    ],
    "layout": "layout-boxed",
    "theme": "theme-purple"
  },
  {
    "title": "Beautiful People",
    "points": [
      "Uses attractive or influential figures to promote ideas",
      "Exploits admiration to bypass critical thinking",
      "Persuades through association rather than evidence",
      "Transfers positive feelings about person to the message"
    ],
    "layout": "layout-centered",
    "theme": "theme-blue"
  },
  {
    "title": "Fighting Disinformation: Framing",
    "points": [
      "Break the frame and look underneath",
      "Recognize how information presentation shapes perception",
      "Question why certain aspects are emphasized over others",
      "If you can't choose your frame, someone else will choose it for you"
    ],
    "layout": "layout-split",
    "theme": "theme-red"
  },
  {
    "title": "Fighting Disinformation: Anchoring",
    "points": [
      "Break the anchor and start fresh",
      "Don't let others set your starting point in discussions",
      "Recognize when initial proposals are intentionally extreme",
      "If others control where you start, they control where you end up"
    ],
    "layout": "layout-boxed",
    "theme": "theme-dark"
  },
  // Concluding disinformation tactics
  {
    "title": "Buzzword",
    "points": [
      "Trendy, vague, or impressive-sounding terms",
      "Creates illusion of expertise without substance",
      "Distracts and confuses with empty language",
      "Signals affiliation without meaningful content"
    ],
    "layout": "layout-centered",
    "theme": "theme-blue"
  },
  {
    "title": "Fear as Control",
    "points": [
      "Emotional engine of menticide and manipulation",
      "Makes people cling to authority figures",
      "Causes surrender of independent thought",
      "Trades critical thinking for illusion of safety"
    ],
    "layout": "layout-boxed",
    "theme": "theme-red"
  },
  {
    "title": "Fighting Disinformation: Comfort Check",
    "points": [
      "Question the things that feel most comfortable",
      "The lie you most want to believe controls you most",
      "Examine your own confirmation bias critically",
      "Stay curious about your own certainties"
    ],
    "layout": "layout-split",
    "theme": "theme-green"
  },
  {
    "title": "Demonizing the Enemy",
    "points": [
      "Portrays opponents as evil or subhuman",
      "Makes violence or cruelty seem necessary",
      "Removes moral barriers to aggression",
      "Justifies extreme actions against dehumanized groups"
    ],
    "layout": "layout-centered",
    "theme": "theme-dark"
  },
  {
    "title": "Dysphemism",
    "points": [
      "Uses harsh or ugly words instead of neutral ones",
      "Opposite of euphemism - designed to trigger disgust",
      "Makes people or ideas seem dangerous or repulsive",
      "Manipulates perception through negative language"
    ],
    "layout": "layout-boxed",
    "theme": "theme-purple"
  },
  {
    "title": "Appeal to Pity",
    "points": [
      "Uses emotional pleas and victimhood narratives",
      "Distracts from weak arguments or wrongdoing",
      "Makes you feel guilty instead of thinking critically",
      "Weaponizes empathy to bypass rational scrutiny"
    ],
    "layout": "layout-split",
    "theme": "theme-sunset"
  },
  {
    "title": "Big Lie",
    "points": [
      "Outrageous falsehood repeated extensively",
      "So enormous that people can't believe it's fabricated",
      "Creates new reality when left unchallenged",
      "Doesn't just distort history - it rewrites it"
    ],
    "layout": "layout-centered",
    "theme": "theme-red"
  },
  {
    "title": "Provokatsiya",
    "points": [
      "Russian intelligence tactic of covert provocation",
      "Incites targets into harmful actions or statements",
      "Uses target's reaction to discredit or destroy them",
      "Creates situations where victims appear as aggressors"
    ],
    "layout": "layout-boxed",
    "theme": "theme-blue"
  },
  {
    "title": "Kompromat",
    "points": [
      "Collection of compromising information on targets",
      "Uses material (real or fabricated) to control or destroy",
      "Classic intelligence blackmail technique",
      "Creates leverage through threat of exposure"
    ],
    "layout": "layout-split",
    "theme": "theme-dark"
  },
  {
    "title": "False Dilemma",
    "points": [
      "Reduces complex issues to just two (often flawed) choices",
      "Hides nuance and eliminates middle ground",
      "Forces artificial decisions by removing alternatives",
      "Pressures conformity through limited options"
    ],
    "layout": "layout-centered",
    "theme": "theme-purple"
  },
  {
    "title": "Memetic Programming",
    "points": [
      "Creates and spreads contagious ideas or 'memes'",
      "Designed to shape beliefs without conscious awareness",
      "Bypasses critical thinking through humor or emotion",
      "Programs behavior through seemingly harmless content"
    ],
    "layout": "layout-boxed",
    "theme": "theme-green"
  },
  // Supplementary disinformation tactics
  {
    "title": "Appeal to Flattery",
    "points": [
      "Compliments or praises audience to win trust",
      "Makes you feel smart or special to lower skepticism",
      "Builds false rapport before pushing an agenda",
      "Uses emotional validation to bypass critical thinking"
    ],
    "layout": "layout-centered",
    "theme": "theme-blue"
  },
  {
    "title": "Cognitive Fatigue Induction",
    "points": [
      "Overwhelms with excessive, contradictory information",
      "Exhausts mental resources needed for critical thinking",
      "Makes targets too tired to evaluate claims effectively",
      "Leaves people vulnerable to simplified false narratives"
    ],
    "layout": "layout-boxed",
    "theme": "theme-purple"
  },
  {
    "title": "Propaganda of Success",
    "points": [
      "Exaggerates achievements and hides failures",
      "Creates illusion of constant victory and progress",
      "Masks reality with inflated claims of accomplishment",
      "Silences dissent by manufacturing false consensus"
    ],
    "layout": "layout-split",
    "theme": "theme-green"
  },
  {
    "title": "Narrative Flooding",
    "points": [
      "Pushes multiple conflicting stories simultaneously",
      "Overwhelms public discourse with contradictions",
      "Creates confusion about what is actually happening",
      "Prevents clear conclusions and understanding"
    ],
    "layout": "layout-centered",
    "theme": "theme-dark"
  },
  {
    "title": "Fighting Disinformation: Synthesis",
    "points": [
      "Connect the dots between seemingly separate attacks",
      "Recognize patterns across different disinformation campaigns",
      "Build a coherent understanding despite intentional chaos",
      "See the strategic intent behind tactical confusion"
    ],
    "layout": "layout-boxed",
    "theme": "theme-sunset"
  },
  // Final fighting disinformation strategies
  {
    "title": "Fighting Disinformation: Emotional Awareness",
    "points": [
      "Feel your emotions — then think anyway",
      "Notice when content triggers strong reactions",
      "If they're trying to make you rush, slow down",
      "Your emotional responses are their weapons unless you recognize them"
    ],
    "layout": "layout-centered",
    "theme": "theme-blue"
  },
  {
    "title": "Fighting Disinformation: Strategic Thinking",
    "points": [
      "Don't fight inside their script or framework",
      "Change the battlefield rather than accepting their terms",
      "Make them react to you, not the other way around",
      "Expose the manipulation strategy itself"
    ],
    "layout": "layout-split",
    "theme": "theme-purple"
  },
  {
    "title": "Fighting Disinformation: Refusing Fear",
    "points": [
      "Don't let fear dictate your decisions",
      "Question demands for obedience in the name of safety",
      "Recognize when fear is being used as control",
      "Courage begins with seeing manipulation clearly"
    ],
    "layout": "layout-boxed",
    "theme": "theme-red"
  },
  {
    "title": "Fighting Disinformation: Focus Control",
    "points": [
      "Consciously choose where to direct your attention",
      "Slow down and refuse to be swept up in chaos",
      "Prioritize signal over noise in information intake",
      "When you control your focus, they lose control of you"
    ],
    "layout": "layout-centered",
    "theme": "theme-dark"
  },
  {
    "title": "Fighting Disinformation: Sharing Knowledge",
    "points": [
      "Share awareness of manipulation techniques with others",
      "Awareness spreads faster than fear when actively shared",
      "Give people tools, not commands - respect autonomy",
      "Every mind you help protect strengthens collective resilience"
    ],
    "layout": "layout-boxed",
    "theme": "theme-sunset"
  },
  {
    "title": "Fighting Disinformation: Mental Resilience",
    "points": [
      "Stay sharp, skeptical, and unpredictable",
      "Recognize hopelessness as a deliberately induced state",
      "Maintain your ability to tell truth from lies",
      "Your mind is the battlefield - awareness is your armor"
    ],
    "layout": "layout-split",
    "theme": "theme-green"
  }
];
import type { Profile } from './makeover.ts'

export type ProjectIdea = {
  id: string
  title: string
  problem: string
  outcome: string
  technologies: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  time: Profile['time']
  interests: string[]
  roles: string[]
  skills: string[]
  roadmap: string[]
}

export const projectCatalogue: ProjectIdea[] = [
  {
    id: 'event-finder', title: 'Campus Event Finder',
    problem: 'Students hear about useful events too late or across too many group chats.',
    outcome: 'A searchable campus event board with filters, reminders and a simple organizer view.',
    technologies: ['JavaScript', 'Python'], difficulty: 'Beginner', time: '1 day',
    interests: ['Web development', 'Data analytics'], roles: ['frontend', 'full stack', 'product'],
    skills: ['UI design', 'CRUD flows', 'Filtering and search'],
    roadmap: ['Sketch an event list and detail view.', 'Add sample events and category filters.', 'Add a form to submit an event.'],
  },
  {
    id: 'spending-insights', title: 'Student Spending Insights',
    problem: 'It is hard to see where a limited monthly budget goes.',
    outcome: 'A small expense tracker that groups spending and highlights simple patterns.',
    technologies: ['Python', 'JavaScript'], difficulty: 'Beginner', time: '1 day',
    interests: ['Web development', 'Data analytics'], roles: ['data analyst', 'frontend', 'full stack'],
    skills: ['Data cleaning', 'Charts', 'Form validation'],
    roadmap: ['Create a small sample expense dataset.', 'Group expenses by category and week.', 'Show a chart and a monthly summary.'],
  },
  {
    id: 'feedback-themes', title: 'Student Feedback Theme Finder',
    problem: 'Clubs and course teams struggle to summarize long feedback forms.',
    outcome: 'A feedback dashboard that groups comments into themes and shows common phrases.',
    technologies: ['Python', 'JavaScript'], difficulty: 'Intermediate', time: '1 week',
    interests: ['NLP', 'AI', 'Data analytics'], roles: ['AI engineer', 'data analyst', 'backend'],
    skills: ['Text preprocessing', 'Clustering', 'Data storytelling'],
    roadmap: ['Collect or write a small sample of anonymous comments.', 'Normalize text and group similar feedback.', 'Build a dashboard with themes and example comments.'],
  },
  {
    id: 'support-triage', title: 'AI Support Ticket Triage',
    problem: 'Small teams can miss urgent requests in a busy support inbox.',
    outcome: 'A prototype that labels requests by topic and urgency, with a human review step.',
    technologies: ['Python', 'Java'], difficulty: 'Intermediate', time: '1 week',
    interests: ['AI', 'NLP', 'Web development'], roles: ['AI engineer', 'backend', 'full stack'],
    skills: ['Text classification', 'API design', 'Human-in-the-loop AI'],
    roadmap: ['Define a few ticket categories and urgency labels.', 'Create a small labeled sample and baseline classifier.', 'Show predictions in a review queue with confidence.'],
  },
  {
    id: 'skill-gap', title: 'Role Skill Gap Explorer',
    problem: 'Learners see job descriptions but are unsure which skills to practice next.',
    outcome: 'A role-to-skills comparison that turns a target job description into a learning checklist.',
    technologies: ['JavaScript', 'Python'], difficulty: 'Intermediate', time: '1 week',
    interests: ['AI', 'NLP', 'Web development'], roles: ['AI engineer', 'frontend', 'full stack', 'product'],
    skills: ['Information extraction', 'Accessible UI', 'Recommendation logic'],
    roadmap: ['Choose two sample job descriptions.', 'Extract and group recurring skills.', 'Build a checklist that links skills to practice projects.'],
  },
  {
    id: 'vision-sorter', title: 'Recycling Sort Helper',
    problem: 'People are often unsure which recycling bin an item belongs in.',
    outcome: 'A camera-based prototype that classifies a few common recyclable items and explains the result.',
    technologies: ['Python', 'C++'], difficulty: 'Advanced', time: '1 month',
    interests: ['Computer vision', 'AI', 'Core engineering'], roles: ['AI engineer', 'computer vision', 'research'],
    skills: ['Image labeling', 'Model evaluation', 'Responsible AI UX'],
    roadmap: ['Select a small, permitted image dataset and item classes.', 'Train or adapt a baseline image classifier.', 'Evaluate errors and show uncertainty with disposal guidance.'],
  },
  {
    id: 'energy-monitor', title: 'Smart Campus Energy Monitor',
    problem: 'Labs and classrooms may use energy outside busy hours without clear visibility.',
    outcome: 'A dashboard for simulated or sensor-based room energy readings and unusual usage alerts.',
    technologies: ['C++', 'Python', 'JavaScript'], difficulty: 'Advanced', time: '1 month',
    interests: ['IoT', 'Core engineering', 'Data analytics'], roles: ['embedded', 'IoT', 'data analyst', 'backend'],
    skills: ['Sensor data', 'Time-series charts', 'Anomaly detection'],
    roadmap: ['Start with simulated readings or an approved sensor.', 'Stream readings into a small data store.', 'Visualize room trends and flag unusual usage.'],
  },
  {
    id: 'network-anomaly', title: 'Network Log Anomaly Explorer',
    problem: 'Beginners find security logs noisy and difficult to inspect.',
    outcome: 'A safe dashboard that uses a public sample dataset to surface unusual log patterns.',
    technologies: ['Python', 'Java'], difficulty: 'Advanced', time: '1 month',
    interests: ['Cybersecurity', 'Data analytics', 'AI'], roles: ['cybersecurity', 'security analyst', 'data analyst', 'backend'],
    skills: ['Log parsing', 'Anomaly detection', 'Security visualization'],
    roadmap: ['Choose a public, non-sensitive sample dataset.', 'Parse and summarize event patterns.', 'Flag outliers and explain why they were surfaced.'],
  },
  {
    id: 'plant-health', title: 'Plant Health Field Guide',
    problem: 'A grower may not know when a plant needs a closer look.',
    outcome: 'A learning prototype that classifies a few leaf conditions and presents care references.',
    technologies: ['Python', 'C++'], difficulty: 'Advanced', time: '1 month',
    interests: ['Computer vision', 'Core engineering', 'AI'], roles: ['AI engineer', 'computer vision', 'research'],
    skills: ['Image classification', 'Dataset quality', 'Model limitations'],
    roadmap: ['Pick a small public dataset and define its limits.', 'Train a baseline image model.', 'Show likely classes with confidence and a clear informational disclaimer.'],
  },
]

export function recommendProjects(profile: Profile, role: string): ProjectIdea[] {
  const tokens = role.toLowerCase().split(/[^a-z0-9+#]+/).filter((token) => token.length > 2)
  return [...projectCatalogue]
    .map((project) => {
      const roleScore = project.roles.reduce((score, tag) => score + (tokens.some((token) => tag.includes(token) || token.includes(tag)) ? 5 : 0), 0)
      const interestScore = project.interests.reduce((score, interest) => score + (profile.interests.includes(interest) ? 3 : 0), 0)
      const technologyScore = project.technologies.includes(profile.technology) ? 2 : profile.technology === 'No preference' ? 1 : 0
      const timeScore = project.time === profile.time ? 2 : 0
      return { project, score: roleScore + interestScore + technologyScore + timeScore }
    })
    .sort((a, b) => b.score - a.score || a.project.title.localeCompare(b.project.title))
    .slice(0, 3)
    .map(({ project }) => project)
}

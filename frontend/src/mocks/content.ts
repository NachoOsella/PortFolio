import lembas from '../../content/projects/lembas.md?raw';
import planai from '../../content/projects/planai.md?raw';
import gruvboxitator from '../../content/projects/gruvboxitator.md?raw';
import javaLogicTrainer from '../../content/projects/java-logic-trainer.md?raw';
import portfolio from '../../content/projects/portfolio.md?raw';
import lembasModularMonolith from '../../content/posts/lembas-modular-monolith.md?raw';
import springAiStructuredPlans from '../../content/posts/spring-ai-structured-plans.md?raw';
import gruvboxitatorPixelPipeline from '../../content/posts/gruvboxitator-pixel-pipeline.md?raw';
import neovimJavaLogicTrainer from '../../content/posts/neovim-java-logic-trainer.md?raw';
import markdownFirstPortfolio from '../../content/posts/markdown-first-portfolio.md?raw';
import about from '../../content/pages/about.md?raw';
import now from '../../content/pages/now.md?raw';
import uses from '../../content/pages/uses.md?raw';

export const seedContent = [
  ['projects/lembas.md', lembas],
  ['projects/planai.md', planai],
  ['projects/gruvboxitator.md', gruvboxitator],
  ['projects/java-logic-trainer.md', javaLogicTrainer],
  ['projects/portfolio.md', portfolio],
  ['posts/lembas-modular-monolith.md', lembasModularMonolith],
  ['posts/spring-ai-structured-plans.md', springAiStructuredPlans],
  ['posts/gruvboxitator-pixel-pipeline.md', gruvboxitatorPixelPipeline],
  ['posts/neovim-java-logic-trainer.md', neovimJavaLogicTrainer],
  ['posts/markdown-first-portfolio.md', markdownFirstPortfolio],
  ['pages/about.md', about],
  ['pages/now.md', now],
  ['pages/uses.md', uses],
] as const;

export const seedMessages = [
  {
    id: 'm-1',
    name: 'Marina Silva',
    email: 'marina@example.com',
    company: 'Northline Labs',
    subject: 'Backend collaboration',
    message:
      'I liked the Lembas architecture case study and would love to discuss a backend opportunity.',
    status: 'new',
    createdAt: '2026-07-29T11:12:00.000Z',
  },
  {
    id: 'm-2',
    name: 'Tomás Herrera',
    email: 'tomas@example.com',
    company: 'Independent',
    subject: 'A question about Spring Boot',
    message:
      'Your article about structured LLM output and backend validation was helpful. Thank you for writing it.',
    status: 'read',
    createdAt: '2026-07-27T15:34:00.000Z',
  },
  {
    id: 'm-3',
    name: 'Sofia Nguyen',
    email: 'sofia@example.com',
    company: 'Lumen',
    subject: 'Website project',
    message: 'We are looking for help shaping a small marketing site and content workflow.',
    status: 'replied',
    createdAt: '2026-07-22T09:05:00.000Z',
  },
  {
    id: 'm-4',
    name: 'Lucas Meyer',
    email: 'lucas@example.com',
    subject: 'Hello from Berlin',
    message: 'The browser image-processing article was a great read. I am working through a similar problem.',
    status: 'read',
    createdAt: '2026-07-16T18:42:00.000Z',
  },
  {
    id: 'm-5',
    name: 'Ana Belén Ruiz',
    email: 'ana@example.com',
    company: 'Sierra Digital',
    subject: 'Junior developer roles',
    message: 'Do you have availability for a short conversation next week?',
    status: 'new',
    createdAt: '2026-07-11T13:18:00.000Z',
  },
];

export const seedCommits = [
  {
    id: 'a4f8c21',
    message: 'content: publish real project case studies',
    author: 'Ignacio Osella',
    createdAt: '2026-08-03T16:10:00.000Z',
    files: ['content/projects/lembas.md', 'content/projects/planai.md'],
  },
  {
    id: '9b1d70e',
    message: 'content: document browser image pipeline',
    author: 'Ignacio Osella',
    createdAt: '2026-07-28T12:42:00.000Z',
    files: ['content/posts/gruvboxitator-pixel-pipeline.md'],
  },
  {
    id: '3d6a2ff',
    message: 'content: update professional profile from curriculum',
    author: 'Ignacio Osella',
    createdAt: '2026-08-03T09:16:00.000Z',
    files: ['content/pages/about.md', 'content/pages/now.md'],
  },
  {
    id: '7c02b91',
    message: 'content: add Java trainer project and article',
    author: 'Ignacio Osella',
    createdAt: '2026-05-21T17:08:00.000Z',
    files: [
      'content/projects/java-logic-trainer.md',
      'content/posts/neovim-java-logic-trainer.md',
    ],
  },
  {
    id: 'e84af02',
    message: 'content: explain PlanAI structured output',
    author: 'Ignacio Osella',
    createdAt: '2026-01-20T14:27:00.000Z',
    files: ['content/posts/spring-ai-structured-plans.md'],
  },
];

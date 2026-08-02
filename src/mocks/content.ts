import modularErp from '../../content/projects/modular-erp.md?raw';
import lembas from '../../content/projects/lembas.md?raw';
import elBrasero from '../../content/projects/el-brasero.md?raw';
import clutchStudio from '../../content/projects/clutch-studio.md?raw';
import dotfilesManager from '../../content/projects/dotfiles-manager.md?raw';
import starshipSimulation from '../../content/projects/starship-simulation.md?raw';
import reactFeatureArchitecture from '../../content/posts/react-feature-architecture.md?raw';
import reusableErpModules from '../../content/posts/reusable-erp-modules.md?raw';
import springBootAuthentication from '../../content/posts/spring-boot-authentication.md?raw';
import dockerForSmallProducts from '../../content/posts/docker-for-small-products.md?raw';
import uiEngineeringDetails from '../../content/posts/ui-engineering-details.md?raw';
import codingAgentsNotes from '../../content/posts/coding-agents-notes.md?raw';
import whyRelationalData from '../../content/posts/why-relational-data.md?raw';
import learningInPublic from '../../content/posts/learning-in-public.md?raw';
import routeDesign from '../../content/posts/route-design.md?raw';
import about from '../../content/pages/about.md?raw';
import now from '../../content/pages/now.md?raw';
import uses from '../../content/pages/uses.md?raw';

export const seedContent = [
  ['projects/modular-erp.md', modularErp],
  ['projects/lembas.md', lembas],
  ['projects/el-brasero.md', elBrasero],
  ['projects/clutch-studio.md', clutchStudio],
  ['projects/dotfiles-manager.md', dotfilesManager],
  ['projects/starship-simulation.md', starshipSimulation],
  ['posts/react-feature-architecture.md', reactFeatureArchitecture],
  ['posts/reusable-erp-modules.md', reusableErpModules],
  ['posts/spring-boot-authentication.md', springBootAuthentication],
  ['posts/docker-for-small-products.md', dockerForSmallProducts],
  ['posts/ui-engineering-details.md', uiEngineeringDetails],
  ['posts/coding-agents-notes.md', codingAgentsNotes],
  ['posts/why-relational-data.md', whyRelationalData],
  ['posts/learning-in-public.md', learningInPublic],
  ['posts/route-design.md', routeDesign],
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
    subject: 'Frontend collaboration',
    message:
      'I liked the ERP case study and would love to discuss a product engineering opportunity.',
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
      'Your notes on keeping authentication server-owned were helpful. Thank you for writing them.',
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
    message: 'The route design article was a great read. I am working through a similar problem.',
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
    message: 'content: add modular ERP case study',
    author: 'Ignacio Osella',
    createdAt: '2026-07-28T16:10:00.000Z',
    files: ['content/projects/modular-erp.md'],
  },
  {
    id: '9b1d70e',
    message: 'content: update React architecture article',
    author: 'Ignacio Osella',
    createdAt: '2026-07-25T12:42:00.000Z',
    files: ['content/posts/react-feature-architecture.md'],
  },
  {
    id: '3d6a2ff',
    message: 'content: publish about page changes',
    author: 'Ignacio Osella',
    createdAt: '2026-07-21T09:16:00.000Z',
    files: ['content/pages/about.md', 'content/pages/now.md'],
  },
  {
    id: '7c02b91',
    message: 'chore: refine editorial navigation',
    author: 'Ignacio Osella',
    createdAt: '2026-07-18T17:08:00.000Z',
    files: ['src/components/PublicLayout.tsx', 'src/styles.css'],
  },
  {
    id: 'e84af02',
    message: 'content: add Spring Boot authentication notes',
    author: 'Ignacio Osella',
    createdAt: '2026-07-12T14:27:00.000Z',
    files: ['content/posts/spring-boot-authentication.md'],
  },
];

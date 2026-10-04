// Round formats used across company tracks.
// Each rubric criterion is scored 1-4 (like real interview scorecards);
// weights inside a rubric must sum to 1.

export const ROUND_TYPES = {
  dsa: {
    label: 'DSA / Problem Solving',
    short: 'DSA',
    workspace: 'code',
    rubric: [
      { id: 'problem_solving', label: 'Problem solving', weight: 0.35, desc: 'Clarifies the problem, finds a working approach, then improves it toward optimal.' },
      { id: 'complexity',      label: 'Complexity analysis', weight: 0.2, desc: 'States correct time/space complexity and reasons about trade-offs.' },
      { id: 'code_quality',    label: 'Code quality', weight: 0.2, desc: 'Correct, readable code that handles edge cases.' },
      { id: 'communication',   label: 'Communication', weight: 0.25, desc: 'Thinks out loud, responds well to hints and pushback.' },
    ],
  },
  machine_coding: {
    label: 'Machine Coding',
    short: 'MC',
    workspace: 'code',
    rubric: [
      { id: 'correctness',   label: 'Working solution', weight: 0.3, desc: 'Core requirements run end to end within the time limit.' },
      { id: 'modularity',    label: 'Modularity', weight: 0.3, desc: 'Clean separation of models, services and I/O; no god classes.' },
      { id: 'extensibility', label: 'Extensibility', weight: 0.2, desc: 'New requirements can be added without rewrites.' },
      { id: 'communication', label: 'Walkthrough', weight: 0.2, desc: 'Explains design choices and trade-offs clearly.' },
    ],
  },
  lld: {
    label: 'Low-Level Design',
    short: 'LLD',
    workspace: 'code',
    rubric: [
      { id: 'requirements', label: 'Requirements', weight: 0.2, desc: 'Pins down scope, entities and use cases before designing.' },
      { id: 'class_design', label: 'Class design', weight: 0.35, desc: 'Sensible entities, relationships and interfaces; SOLID where it matters.' },
      { id: 'patterns',     label: 'Patterns', weight: 0.2, desc: 'Uses design patterns where they fit, not for show.' },
      { id: 'tradeoffs',    label: 'Trade-offs', weight: 0.25, desc: 'Handles concurrency, edge cases and alternatives when probed.' },
    ],
  },
  hld: {
    label: 'System Design',
    short: 'HLD',
    workspace: 'text',
    rubric: [
      { id: 'requirements', label: 'Requirements & estimates', weight: 0.2, desc: 'Functional/non-functional requirements and rough scale numbers.' },
      { id: 'architecture', label: 'Architecture', weight: 0.3, desc: 'Coherent components, data model and APIs.' },
      { id: 'scalability',  label: 'Scale & reliability', weight: 0.3, desc: 'Bottlenecks, caching, partitioning, failure handling.' },
      { id: 'tradeoffs',    label: 'Trade-offs', weight: 0.2, desc: 'Justifies choices and compares alternatives.' },
    ],
  },
  behavioral: {
    label: 'Behavioral',
    short: 'BEH',
    workspace: 'text',
    rubric: [
      { id: 'structure',      label: 'Structure (STAR)', weight: 0.25, desc: 'Situation, task, action, result: concise and specific.' },
      { id: 'ownership',      label: 'Ownership', weight: 0.3, desc: 'Clear personal contribution ("I", not "we") and accountability.' },
      { id: 'impact',         label: 'Impact', weight: 0.25, desc: 'Concrete, ideally measurable results.' },
      { id: 'self_awareness', label: 'Self-awareness', weight: 0.2, desc: 'Reflects honestly on mistakes and learnings.' },
    ],
  },
  project: {
    label: 'Project Deep-Dive',
    short: 'PRJ',
    workspace: 'text',
    rubric: [
      { id: 'depth',         label: 'Technical depth', weight: 0.35, desc: 'Understands internals of what they built, not just the APIs.' },
      { id: 'decisions',     label: 'Decision making', weight: 0.3, desc: 'Explains why each choice was made and what was rejected.' },
      { id: 'ownership',     label: 'Ownership', weight: 0.15, desc: 'Clear about what they personally built.' },
      { id: 'communication', label: 'Communication', weight: 0.2, desc: 'Explains a complex system simply.' },
    ],
  },
}

export const getRoundType = (id) => ROUND_TYPES[id] || null

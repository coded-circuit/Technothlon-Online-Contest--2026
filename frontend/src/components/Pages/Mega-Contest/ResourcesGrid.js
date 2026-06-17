import React from 'react';

const resources = [
  ['📘', 'Logic Week', 'https://www.instagram.com/p/DZhwk7rj2T9/?img_index=1'],
  ['📖', 'Technopedia', 'https://technothlon.techniche.org.in/technopedia-login'],
  ['📝', 'PYQs', 'https://technothlon.techniche.org.in/pyp'],
  ['🧠', 'Practice Sets', 'https://technothlon.techniche.org.in/technopedia-login'],
  ['📅', 'Event Schedule', 'https://technothlon.techniche.org.in/'],
  ['🏫', 'School Registration Guide', 'https://technothlon.techniche.org.in/'],
];

const ResourcesGrid = () => (
  <section className="rounded-2xl bg-white/65 p-5 shadow-xl shadow-sky-200/35 backdrop-blur">
    <h2 className="text-xl font-black text-sky-900">Explore Resources</h2>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {resources.map(([icon, label, href]) => (
        <button
          key={label}
          type="button"
          onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
          className="rounded-xl bg-sky-50/90 p-3 text-left shadow-sm shadow-sky-100 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-sky-200/60"
        >
          <span className="text-2xl">{icon}</span>
          <span className="mt-2 block text-sm font-black text-slate-900">{label}</span>
        </button>
      ))}
    </div>
  </section>
);

export default ResourcesGrid;

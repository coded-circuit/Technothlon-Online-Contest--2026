import React from 'react';

const resources = [
  ['PYQs', 'Previous year question papers', 'https://technothlon.techniche.org.in/pyp'],
  ['Technopedia', 'Concepts and preparation material', 'https://technothlon.techniche.org.in/technopedia-login'],
  ['Logic Week', 'Logic practice from Technothlon', 'https://www.instagram.com/p/DZhwk7rj2T9/?img_index=1'],
];

const ResourcesGrid = () => (
  <section className="flex h-full flex-col justify-center rounded-2xl bg-white/70 p-6 shadow-xl shadow-sky-200/35 backdrop-blur">
    <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-700">
      Prepare better
    </p>
    <h2 className="mt-2 text-3xl font-black text-sky-900">Resources</h2>

    <div className="mt-5 grid gap-3">
      {resources.map(([label, description, href]) => (
        <button
          key={label}
          type="button"
          onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
          className="group flex items-center justify-between rounded-xl bg-sky-50/90 px-4 py-4 text-left shadow-sm shadow-sky-100 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-sky-200/60"
        >
          <span>
            <span className="block text-lg font-black text-slate-950">{label}</span>
            <span className="mt-1 block text-sm font-semibold text-slate-600">{description}</span>
          </span>
          <span className="ml-4 text-xl font-black text-sky-700 transition group-hover:translate-x-1">
            →
          </span>
        </button>
      ))}
    </div>
  </section>
);

export default ResourcesGrid;

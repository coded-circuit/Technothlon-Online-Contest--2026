import React from 'react';
import { FaEnvelope, FaFacebookF, FaGlobe, FaInstagram, FaWhatsapp } from 'react-icons/fa';

const links = [
  [FaGlobe, 'Website', 'https://technothlon.techniche.org.in'],
  [FaInstagram, 'Instagram', 'https://www.instagram.com/technothlon.iitg/'],
  [FaFacebookF, 'Facebook', 'https://www.facebook.com/technothlon.techniche'],
  [FaWhatsapp, 'WhatsApp', 'https://www.whatsapp.com/channel/0029VaM9jc072WTqZJIaKL1S'],
  [FaEnvelope, 'Email', 'mailto:technothlon@iitg.ac.in'],
];

const Footer = () => (
  <footer className="bg-slate-50 px-4 py-8 text-slate-950 sm:px-8">
    <div className="mx-auto max-w-7xl text-center">
      <h2 className="text-xl font-black text-slate-900">Connect with Technothlon</h2>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
        {links.map(([Icon, label, href]) => (
          <a
            key={label}
            href={href}
            target={href.startsWith('mailto:') ? undefined : '_blank'}
            rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
            aria-label={label}
            title={label}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-800 shadow-lg shadow-slate-200 transition hover:-translate-y-1 hover:text-sky-700 hover:shadow-sky-200"
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </a>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-500">
        © 2026 Technothlon, Techniche — IIT Guwahati. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;

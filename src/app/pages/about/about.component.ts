import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  meta = ['Pune, India · IST', 'English & Hindi', 'Remote since 2017'];

  stats = [
    { value: '340+', label: 'Projects' },
    { value: '68', label: 'Repeat clients' },
    { value: '18', label: 'Countries' },
    { value: '4.9', label: 'Average rating' },
    { value: '96%', label: 'First-cut approval' },
  ];

  skills = [
    { name: 'Narrative & story editing', years: 9, level: 95 },
    { name: 'Short-form / retention editing', years: 8, level: 92 },
    { name: 'Colour grading — DaVinci Resolve', years: 7, level: 88 },
    { name: 'Motion graphics & titles', years: 6, level: 78 },
    { name: 'Sound design & mixing', years: 5, level: 70 },
    { name: '3D integration — Blender', years: 3, level: 55 },
  ];

  tools = [
    { abbr: 'Pr', name: 'Premiere Pro', role: 'Primary NLE', color: 'violet' },
    { abbr: 'DR', name: 'DaVinci Resolve', role: 'Grade & finish', color: 'teal' },
    { abbr: 'Ae', name: 'After Effects', role: 'Motion & clean-up', color: 'violet' },
    { abbr: 'Au', name: 'Audition', role: 'Dialogue clean-up', color: 'violet' },
    { abbr: 'Bl', name: 'Blender', role: 'Motion — 3D assets', color: 'flare' },
    { abbr: 'Fr', name: 'Frame.io', role: 'Client review', color: 'teal' },
    { abbr: 'No', name: 'Notion', role: 'Project tracking', color: 'flare' },
    { abbr: 'Sl', name: 'Slack', role: 'Day-to-day comms', color: 'mid' },
  ];

  experience = [
    {
      period: '2021 — now',
      place: 'Cutroom Studio',
      title: 'Founder & Lead Editor',
      text: 'Running post for brands and creators across 18 countries. Two long-term retainers, roughly 40 projects a year, everything from 15-second ads to 20-minute documentaries. Colour and sound kept in house so the look stays consistent.',
    },
    {
      period: '2017 — 2021',
      place: 'Remote · Berlin, London, Austin',
      title: 'Freelance Video Editor',
      text: 'Built a client base entirely through referrals. This was the decade-defining lesson in scoping properly, writing contracts, and saying no to work that would not end well for either side.',
    },
    {
      period: '2015 — 2017',
      place: 'Rite & Co. Advertising, Mumbai',
      title: 'Junior Editor',
      text: 'Cut broadcast and digital ads under a senior editor. Learned pacing under real deadlines, and how to take a note without taking it personally.',
    },
    {
      period: '2014 — 2015',
      place: 'Freelance film units, Mumbai',
      title: 'Assistant Editor',
      text: 'Logging, syncing, proxies, and watching very good people make very small decisions that changed everything.',
    },
  ];

  specs = [
    { label: 'Display', text: '27″ reference, calibrated monthly to Rec.709 / 100 nits' },
    { label: 'Audio', text: 'Yamaha HS5 near-fields, treated corners, LUFS metering' },
    { label: 'Storage', text: '24TB RAID + nightly encrypted cloud backup' },
    { label: 'Security', text: 'NDA-ready, 2FA everywhere, footage purged after 90 days' },
  ];

  awards = [
    { year: '2025', title: 'Vega Awards — Bronze', note: 'Brand film, Northwind Coffee' },
    { year: '2024', title: 'Kinsale Shark — Shortlist', note: 'Editing craft, Sage & Oak' },
    { year: '2024', title: 'Featured — Frame.io Blog', note: 'Remote review workflows' },
    { year: '2023', title: 'Speaker — NAB Show Asia', note: 'Short-form post pipeline' },
  ];

  principles = [
    { title: 'Story before polish', text: 'A beautiful grade cannot save a cut that does not hold. Structure first, always — colour and polish come after the story works.' },
    { title: 'Say the real number', text: 'Quotes are fixed and scope is written down. If something falls outside it, you hear about it before the work happens, not on the invoice.' },
    { title: 'Protect the deadline', text: 'I take on fewer projects than I could so the ones I take ship on time. Capacity is published on the pricing page and it is honest.' },
    { title: 'Your footage is yours', text: 'Full rights on final payment, project files on request, and everything wiped from my drives 90 days after delivery unless you say otherwise.' },
  ];

  offClock = ['teal', 'amber', 'violet', 'flare'];
}
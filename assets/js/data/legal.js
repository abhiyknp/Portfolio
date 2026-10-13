/* Site pages: privacy notice, terms of use and accessibility statement. Plain language, first person. */
window.PF = window.PF || { skills: [], cases: [], artifacts: [], scenarios: [] };

PF.legal = {
  updated: '13 October 2026',
  contact: 'ba.abhiy@gmail.com',

  privacy: {
    title: 'Privacy notice',
    lede: 'This is a personal portfolio. It has no accounts, no forms and no cookies. Here is exactly what happens when you visit.',
    sections: [
      ['The short version', '<ul><li>I do not ask for, collect or sell personal information.</li><li>I count visits with GoatCounter, a privacy-friendly service that sets no cookies.</li><li>Your browser keeps a few settings (such as light or dark theme) on your own device. They never leave it.</li><li>A few files load from other services (fonts, hosting). Those services see the request, as with any website.</li></ul>'],
      ['Who is responsible', '<p>This site belongs to me, Abhishek Yadav, Noida, India. For any question about this notice, email <a href="mailto:ba.abhiy@gmail.com">ba.abhiy@gmail.com</a>.</p>'],
      ['Visit counts (GoatCounter)', '<p>I use <a href="https://www.goatcounter.com" target="_blank" rel="noopener">GoatCounter</a> to see how the portfolio is used. It records which page was viewed, the referring site (for example LinkedIn), the browser and operating system, screen size and country. It also records a few actions on the site: résumé downloads, clicks on my email or LinkedIn, use of the before/after slider, puzzle completions and attempts to open the owner\'s desk.</p><p>GoatCounter does not set cookies and does not build a profile of you. I only see totals, never who you are. GoatCounter\'s own privacy policy on its website explains how it handles the data it receives.</p><p>To stop your visits being counted in this browser, open <a href="#toggle-goatcounter">this link</a>. Opening it again switches counting back on.</p>'],
      ['What your browser stores', '<p>The site saves a few small settings in your browser\'s local storage so it works the way you left it. They stay on your device and are never sent anywhere.</p><table><tr><th>Name</th><th>What it remembers</th></tr><tr><td><code>pf-theme</code></td><td>Light or dark theme, if you changed it</td></tr><tr><td><code>pf-lib</code></td><td>Your search and filters in the Skills Library</td></tr><tr><td><code>pf-pz-best</code></td><td>Your best score in the process puzzle (only if you played it)</td></tr><tr><td><code>skipgc</code></td><td>That you switched off visit counting (only if you did)</td></tr><tr><td><code>pf-owner-gc</code>, <code>pf-owner-cache-2</code></td><td>Used only on the site owner\'s own devices for the private stats page</td></tr></table><p>Clearing this site\'s data in your browser settings removes all of them.</p>'],
      ['Other services that load files', '<ul><li><strong>GitHub Pages</strong> hosts the site. Like any web host, GitHub receives technical request data such as IP addresses. See the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">GitHub privacy statement</a>.</li><li><strong>Google Fonts</strong> supplies the Manrope and DM Mono typefaces. See the <a href="https://developers.google.com/fonts/faq/privacy" target="_blank" rel="noopener">Google Fonts privacy FAQ</a>.</li><li><strong>GoatCounter</strong> supplies its counting script (see above).</li></ul>'],
      ['If you email me', '<p>If you contact me by email, I use your message and address only to reply and, if relevant, to discuss a role. I do not add you to any list or share your details.</p>'],
      ['Your choices and rights', '<p>You can switch off visit counting, clear stored settings or block the services above in your browser. Because I do not hold personal information from visits, there is usually nothing about you for me to show, correct or delete. If you think I hold something about you (for example an email), write to me and I will deal with it promptly, in line with India\'s Digital Personal Data Protection Act, 2023.</p>'],
      ['Changes', '<p>If anything here changes, I will update this page and the date at the top.</p>']
    ]
  },

  terms: {
    title: 'Terms of use',
    lede: 'The practical rules for using this portfolio and what is on it.',
    sections: [
      ['About this site', '<p>This is the professional portfolio of Abhishek Yadav, Senior IT Business Analyst. It shows my experience, my way of working and sample business analysis material. Using the site means you accept these terms.</p>'],
      ['Labelled, illustrative content', '<p>Every claim, scenario, rule, number and sample document is labelled. "Source-supported" items come from my résumé or my own project description. "Illustrative" and "Recommended" items are examples written for this portfolio: they are not project documents, real incidents, client data or production behaviour. No confidential client material is reproduced. IDs, ticket keys, endpoints, schemas and figures in the samples are invented.</p>'],
      ['Organisations and names', '<p>Names of organisations, programmes and products (for example Digital India Corporation, MeitY, MoRTH, NHAI, Rajmarg Pravesh, BharatKosh, JIRA, Confluence, Figma and Power BI) belong to their owners. They appear only to describe my work or the tools I use. Their appearance does not mean any organisation endorses this site.</p>'],
      ['Using what is here', '<p>You are welcome to read, share links to and learn from the site. The text, sample artifacts, diagrams, photograph and résumé are mine. Please do not republish them as your own or use my photograph or résumé for anything other than considering me for a role. Short quotes with a link back are fine.</p>'],
      ['No warranty', '<p>The site is provided as it is, for information. I keep it accurate and up to date, but I do not guarantee that it is free of errors or always available. Sample artifacts and scenarios are teaching examples, not advice for your project. I am not responsible for any loss from relying on them.</p>'],
      ['Links to other sites', '<p>Links to other sites (such as LinkedIn) are for convenience. I am not responsible for their content or practices.</p>'],
      ['Credits and licences', '<ul><li>Typefaces: <a href="https://fonts.google.com/specimen/Manrope" target="_blank" rel="noopener">Manrope</a> and <a href="https://fonts.google.com/specimen/DM+Mono" target="_blank" rel="noopener">DM Mono</a>, under the SIL Open Font License, served by Google Fonts.</li><li>Visit counts: <a href="https://www.goatcounter.com" target="_blank" rel="noopener">GoatCounter</a>.</li><li>Hosting: GitHub Pages.</li><li>Everything else (design, code, text, diagrams and sample artifacts) is my own work.</li></ul>'],
      ['Law', '<p>These terms are governed by the laws of India.</p>'],
      ['Changes and contact', '<p>I may update these terms; the date at the top shows the latest version. Questions: <a href="mailto:ba.abhiy@gmail.com">ba.abhiy@gmail.com</a>.</p>']
    ]
  },

  accessibility: {
    title: 'Accessibility statement',
    lede: 'I want everyone to be able to read this portfolio, whatever device or assistive technology they use.',
    sections: [
      ['What the site supports', '<ul><li>Works with a keyboard alone: every link, tab, button, slider and the puzzle can be reached and used without a mouse. A "Skip to content" link comes first.</li><li>Respects "reduce motion": the scroll intro, loaders, background words and animations become still versions.</li><li>Light and dark themes, both designed for readable contrast.</li><li>Layouts tested at phone and desktop widths, with no sideways scrolling.</li><li>Diagrams and charts come with text: swimlane steps can be opened as text, the visitor chart has a table view, and the before/after slider has "Show before" and "Show after" buttons.</li><li>Labels on interactive parts and announcements for changing content (for example puzzle results) for screen readers.</li><li>The moving background words are decorative and hidden from screen readers.</li></ul>'],
      ['How it was checked', '<p>I aim for WCAG 2.1 level AA. During development the site was checked with automated browser tests on every page at desktop and phone widths, in both themes, and with reduced motion. It has not had a formal independent audit, so some issues may remain.</p>'],
      ['Known limits', '<ul><li>The scroll intro on the overview is decorative; its message is repeated as normal text, and "Skip intro" jumps past it.</li><li>Some wide tables scroll sideways inside their box on small screens.</li></ul>'],
      ['Tell me about a problem', '<p>If something is hard to use, email <a href="mailto:ba.abhiy@gmail.com">ba.abhiy@gmail.com</a> with the page and what happened. I will reply and fix what I can.</p>']
    ]
  }
};

export const CHROME_ARGS = [
  '--start-maximized',

  // Disable SSO / Kerberos / NTLM / Windows Integrated Auth
  '--auth-server-whitelist=_',
  '--auth-negotiate-delegate-whitelist=_',
  '--disable-auth-negotiate-cname-lookup',
  '--disable-features=AmbientAuthenticationInPrivateModesEnabled,WebAuthentication,HttpNegotiateAuth',

  // Disable saved passwords, autofill and credential manager
  '--disable-save-password-bubble',
  '--password-store=basic',
  '--disable-autofill-keyboard-accessory-view',

  // Disable extensions and background apps
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-component-extensions-with-background-pages',

  // Fresh session — no cached credentials
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-client-side-phishing-detection',
  '--disable-sync',
  '--disable-translate',

  // Incognito mode
  '--incognito',
];

export const AUTH_HEADERS_TO_STRIP = ['authorization', 'www-authenticate', 'proxy-authorization'];

export function ThemeInitScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){var t=localStorage.getItem('whatschat_admin_theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');})();`,
      }}
    />
  );
}

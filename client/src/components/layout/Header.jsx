const Header = ({ title, subtitle, children }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-right">
        {children}
      </div>
    </header>
  );
};

export default Header;

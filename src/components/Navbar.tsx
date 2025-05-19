import { Link, useLocation } from 'react-router-dom';
import { Map, PlusCircle, List } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      className={`flex flex-col items-center py-3 px-6 ${
        location.pathname === to
          ? 'text-blue-600'
          : 'text-gray-600 hover:text-blue-600'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );

  return (
    <nav className="bg-white border-t">
      <div className="max-w-xl mx-auto px-4">
        <div className="flex justify-around">
          <NavItem to="/" icon={Map} label="Mappa" />
          <NavItem to="/add" icon={PlusCircle} label="Aggiungi" />
          <NavItem to="/list" icon={List} label="Lista" />
        </div>
      </div>
    </nav>
  );
}